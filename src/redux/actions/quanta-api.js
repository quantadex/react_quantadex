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
	console.log("Connecting...");
	Apis.setRpcConnectionStatusCallback(
		(status) => {
			console.log("ws status changed: ", status);
			if (status === "reconnect")
				ChainStore.resetCache(false);
			if (status === "closed") 
				dispatch({ type: "WEBSOCKET_STATUS", data: "Closed" })
			if (status === "open")
				dispatch({ type: "WEBSOCKET_STATUS", data: null })
		}
	);

	const res = await Apis.instance(CONFIG.getEnv().WEBSOCKET_PATH, true, 5000, { enableOrders: true }).init_promise
	ChainStore.subscribers.clear()
	await ChainStore.init(false)		
	ChainStore.subscribe(() => {
		updateChainState(dispatch)
	})
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

		// setup markets
	const markets = await fetch(CONFIG.getEnv().MARKETS_JSON, { mode: "cors" }).then(e => e.json()).catch(e => {
		Rollbar.error("Failed to get Markets JSON", e);
	})

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
	
	console.log("done building markets", window.allMarketsByHash);

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
				// await?
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
			let latest = data[0].latest === "0" ? data[0].highest_bid === "0" || data[0].highest_ask === "0" ? "-" : (parseFloat(data[0].highest_bid) + parseFloat(data[0].lowest_ask)) / 2 : data[0].latest
			latest = Utils.maxPrecision(latest, window.allMarketsByHash[pair.name].pricePrecision)
			window.allMarketsByHash[pair.name].last = latest
			marketData[market].push({
				name: pair.name,
				last: latest,
				base_volume: data[1].base_volume,
				quote_volume: data[1].quote_volume
			})
			if (counter.symbol == 'USD') {
				USD_value[base.id] = data[0].latest
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