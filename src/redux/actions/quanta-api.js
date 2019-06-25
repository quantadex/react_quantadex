import ApplicationApi from "../../common/api/ApplicationApi";
import WalletApi from "../../common/api/WalletApi";
import CONFIG from '../../config.js'
import { validMarketPair, getBaseCounter, aggregateOrderBook, convertHistoryToOrderedSet } from "../../common/PriceData";
import { PrivateKey, ChainStore } from "@quantadex/bitsharesjs";
import Utils from "../../common/utils.js";
import lodash from 'lodash';
import { Apis } from "@quantadex/bitsharesjs-ws";

const blockTimes = [];
var previousTime = null;
window.market_depth_time = null;

function getAvgtime() {
	const avgTime = blockTimes.reduce((previous, current, idx, array) => {
		return previous + current[1] / array.length;
	}, 0);
	return avgTime;
}

function updateChainState(dispatch) {
	const object = ChainStore.getObject("2.1.0");

	if (object == null) {
		return;
	}

	const timestamp = timeStringToDate(object.get("time"))

	if (previousTime != null) {
		blockTimes.push([
			object.get("head_block_number"),
			(timestamp - previousTime) / 1000
		]);
	}
	previousTime = timestamp;
	//console.log('update', timestamp, object.get("head_block_number"), Math.round(getAvgtime()*1000))

	dispatch({
		type: "UPDATE_BLOCK_INFO",
		data: {
			blockNumber: object.get("head_block_number"),
			blockTime: Math.round(getAvgtime() * 1000)
		}
	})
}

function timeStringToDate(block_time) {
	if (!/Z$/.test(block_time)) {
		block_time += "Z";
	}
	return new Date(block_time);
}

/**
 * Connects to websocket and setup all the proper callbacks for updating blocks data,
 * and reconnection.
 * @param {*} dispatch 
 */
export async function ConnectAsync(dispatch) {
	if (window.ws_connecting) return
	// console.log("Connecting...");
	window.ws_connecting = true
	try {
		const res = await Apis.instance(CONFIG.getEnv().WEBSOCKET_PATH, true, 5000, { enableOrders: true }).init_promise
		ChainStore.subscribers.clear()
		await ChainStore.init(false)		
		ChainStore.subscribe(() => {
			updateChainState(dispatch)
		})
	} catch (e) {
		console.log(e)
	}
	
	window.ws_connecting = false
}

function getBinanceData(markets) {
	var symbol_map = {}
	var binance_symbol = []
	window.binance_data = {}
	
	for (const coin of Object.keys(markets.markets)) {
		for (const market of markets.markets[coin]) {
			if ((market.name.endsWith("/TUSD0X0000000000085D4780B73119B644AE5ECD22B376") || market.name.endsWith("/USD")) && market.benchmarkSymbol) {
				let symbol = market.benchmarkSymbol.split(":")[1].replace("/", "")
				symbol_map[symbol] = market.name
				binance_symbol.push(symbol.toLowerCase() + '@ticker')
			}
		}
	}

	if (binance_symbol.length > 0) {
		const binance_socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + binance_symbol.join('/'));
		binance_socket.addEventListener('message', function (event) {
			const data = JSON.parse(event.data).data
			window.binance_data[symbol_map[data.s].split('/')[0]] = {last_price: data.c, change: data.P}
		});
	}
}

/**
 * UpdateGlobalPropertiesAsync 
 * updates the global assets, keys, and rebates -- anything related to global states goes here.
 */
export async function UpdateGlobalPropertiesAsync() {
	const assets = await Apis.instance().db_api().exec("list_assets", ["A", 100])
	window.assets = lodash.keyBy(assets, "id")
	window.assetsBySymbol = lodash.keyBy(assets, "symbol")

	const gp = await Apis.instance().db_api().exec("get_global_properties", [])
	window.maker_rebate_percent_of_fee = gp.parameters.extensions.maker_rebate_percent_of_fee
	window.roll_dice_percent_of_fee = gp.parameters.extensions.roll_dice_percent_of_fee || 0

		// setup markets
	const markets = await fetch(CONFIG.getEnv().MARKETS_JSON, { mode: "cors" }).then(e => e.json()).catch(e => {
		Rollbar.error("Failed to get Markets JSON", e);
	})

	if (!window.binance_data) getBinanceData(markets)

	window.markets = markets.markets
	window.marketsHash = Object.keys(markets.markets).reduce(function (previous, key) {
		let ob = lodash.keyBy({ ...markets.markets[key] }, "name")
		return { ...previous, ...ob }
	}, {})
	window.wallet_listing = markets.wallet_listing
	window.coin_info = markets.coin_info

	// used by datafeed
	window.allMarkets = []
	for (const key in window.markets) {
		window.allMarkets.push(...window.markets[key])
	}
	window.allMarketsByHash = lodash.keyBy(window.allMarkets, "name")
	
	// console.log("done building markets", window.allMarketsByHash);

}

export async function UpdateMarketsDataAsync() {
	var marketData = {};
	var USD_value = {}

	for (const market in window.markets) {
		for (const pair of window.markets[market]) {
			let { base, counter } = getBaseCounter(pair.name);
			if (!base || !counter) continue
			const data = await Promise.all([Apis.instance()
				.db_api()
				.exec("get_ticker", [counter.id, base.id]),
			Apis.instance()
				.db_api()
				.exec("get_24_volume", [counter.id, base.id])])

			if (!window.market_depth_time || ((new Date()) - window.market_depth_time) > (60 * 5 * 1000)) {
				const depth = await Apis.instance().db_api().exec("get_order_book", [counter.id, base.id, 50])
				let asks_depth = depth.asks.reduce((total, next) => {
					return total + parseFloat(next.base)
				}, 0)
				let bids_depth = depth.bids.reduce((total, next) => {
					return total + parseFloat(next.base)
				}, 0)

				window.allMarketsByHash[pair.name].depth = asks_depth + bids_depth
			}

			if (!marketData[market]) {
				marketData[market] = []
			}
			let latest = data[0].latest !== "0" ? 
							data[0].latest
								: data[0].highest_bid !== "0" || data[0].highest_ask !== "0" ? 
									(parseFloat(data[0].highest_bid) + parseFloat(data[0].lowest_ask)) / 2 
									: "-" 
			latest = Utils.maxPrecision(latest, window.allMarketsByHash[pair.name].pricePrecision)
			window.allMarketsByHash[pair.name].last = latest
			marketData[market].push({
				name: pair.name,
				last: latest,
				base_volume: data[1].base_volume,
				quote_volume: data[1].quote_volume
			})
			if (counter.symbol == 'USD' || counter.symbol == 'TUSD0X0000000000085D4780B73119B644AE5ECD22B376') {
				USD_value[base.id] = data[0].latest > 0 ? data[0].latest : window.binance_data[base.symbol] ? window.binance_data[base.symbol].last_price : 0
				USD_value[counter.id] = 1
			}
		}
	}	
	
	// update global
	window.market_depth_time = new Date()

	return { marketData, USD_value}
}

export async function fetchDataAsync(ticker) {
	const {marketData, USD_value} = await UpdateMarketsDataAsync()

	var { base, counter } = getBaseCounter(ticker)
	const trades = Apis.instance().history_api().exec("get_fill_order_history", [base.id, counter.id, 100]).then((filled) => {
		const trade_history = convertHistoryToOrderedSet(filled, base.id)
		// console.log("history filled ", filled);
		//console.log("converted ", trade_history);
		return trade_history
	})

	// selling counter
	const orderBook = Apis.instance().db_api().exec("get_order_book", [counter.id, base.id, 50]).then((ob) => {
		// console.log("ob  ", ob);
		return aggregateOrderBook(ob.bids, ob.asks, window.assets[base.id].precision)
	})

	const data =  await Promise.all([orderBook, trades])

	return {
		ticker,
		orderBook: data[0],
		trades: data[1],
		marketData,
		USD_value

	}
}