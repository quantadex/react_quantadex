import { Apis } from "@quantadex/bitsharesjs-ws";
import lodash from "lodash"
import fetch from "node-fetch"
import { transformPriceData, aggregateOrderBook, convertHistoryToOrderedSet } from "./src/common/PriceData.js";

const wsString = "wss://mainnet-lb.quantachain.io";
const markets_json = "https://s3.amazonaws.com/quantachain.io/markets_mainnet.json"

function getMarkets() {
    return fetch(markets_json).then(e => e.json())
}

function getAssets(type = "symbol") {
    return Apis.instance().db_api().exec("list_assets", ["A", 100])
    .then((assets) => {
        return lodash.keyBy(assets, type)
    })
	
}

// http://localhost:3000/api?query=getTicker
async function getTicker() {
    const markets = await getMarkets()
    const res = {}

    for (let coin of Object.keys(markets.markets)) {
        for (let market of markets.markets[coin]) {
            const pair = market.name.split('/')
            const ticker = await Apis.instance().db_api().exec("get_ticker", [pair[0], pair[1]])
            res[market.name] = ticker
        }
    }
    return res
}

// http://localhost:3000/api?query=get24hVolume
async function get24hVolume() {
    const markets = await getMarkets()
    const res = {}

    for (let coin of Object.keys(markets.markets)) {
        for (let market of markets.markets[coin]) {
            const pair = market.name.split('/')
            const ticker = await Apis.instance().db_api().exec("get_24_volume", [pair[0], pair[1]])
            res[market.name] = {[pair[0]]: ticker.base_volume, [pair[1]]: ticker.quote_volume}
        }
    }
    return res
}

// http://localhost:3000/api?query=getOrderBook&currencyPair=QDEX/BTC&depth=10
async function getOrderBook(params) {
    var markets
    const assets = await getAssets()
    const res = {}
    
    if (!params.currencyPair || params.currencyPair == "all") {
        markets = await getMarkets()
    } else {
        markets = {markets: {0 : [{name: params.currencyPair.replace("_", "/")}]}}
    }
    
    for (let coin of Object.keys(markets.markets)) {
        for (let market of markets.markets[coin]) {
            const pair = market.name.split('/')
            const ob = await Apis.instance().db_api().exec("get_order_book", [pair[0], pair[1], Math.min(50, params.depth) || 50])
            res[market.name] = aggregateOrderBook(ob.bids, ob.asks, assets[pair[0]].precision)
        }
    }
    return res
}

// http://localhost:3000/api?query=getTradeHistory&currencyPair=QDEX/BTC
async function getTradeHistory(params) {
    const assets = await getAssets()
    const assetsById = await getAssets("id")
    const res = []
    
    const pair = params.currencyPair.split('/')
    const history = await Apis.instance().history_api().exec("get_fill_order_history", [assets[pair[0]].id, assets[pair[1]].id, 100])
    const set = convertHistoryToOrderedSet(history, assets[pair[0]].id, assetsById)

    set.forEach(order => {
        const amount = parseFloat(order.amountToReceive().replace(/,/g, ""))
        const price = order.getPrice()
        const data = {
            date: order.time,
            type: order.isBid ? "buy" : "sell",
            price,
            amount,
            total: price * amount
        }
        res.push(data)
    })
    return res
}

// http://localhost:3000/api?query=getChartData&currencyPair=QDEX/BTC&period=86400&start=2019-04-08T00:00:00&end=2019-07-01T00:00:00
async function getChartData(params) {
    const assets = await getAssets()
    
    const period = params.period // 60, 300, 900, 1800, 3600, 86400
    const start = params.start
    const end = params.end
    const pair = params.currencyPair.split('/')
    const data = await Apis.instance().history_api().exec("get_market_history", [
        assets[pair[0]].id, 
        assets[pair[1]].id, 
        period,
        start,
        end
    ])
    return transformPriceData(data, assets[pair[1]], assets[pair[0]])
}

export function MarketsAPI(params) {
    return Apis.instance(wsString, true, 3000, { enableOrders: false }).init_promise
    .then(() => {
        switch (params.query) {
            case "getTicker":
                return getTicker()
            case "get24hVolume": 
                return get24hVolume()
            case "getOrderBook": 
                return getOrderBook(params)
            case "getTradeHistory": 
                return getTradeHistory(params)
            case "getChartData": 
                return getChartData(params)
            default:
                return "No method named " + params.query
        }
    })
}
