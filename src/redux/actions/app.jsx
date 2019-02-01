import lodash from 'lodash';
import API from "../../api.jsx"
import SortedSet from 'js-sorted-set'
import QuantaClient from "@quantadex/quanta_js"
import { Apis } from "@quantadex/bitsharesjs-ws";
import { Price, Asset, FillOrder, LimitOrderCreate, LimitOrder } from "../../common/MarketClasses";
import { PrivateKey, PublicKey, Aes, key, ChainStore } from "@quantadex/bitsharesjs";
import { createLimitOrderWithPrice, createLimitOrder2, cancelOrder, signAndBroadcast } from "../../common/Transactions";
import { aggregateOrderBook, convertHistoryToOrderedSet } from "../../common/PriceData";
import ReactGA from 'react-ga';

export const INIT_DATA = 'INIT_DATA';
export const LOGIN = 'LOGIN';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const SET_MARKET_QUOTE = 'SET_MARKET_QUOTE';
export const APPEND_TRADE = 'APPEND_TRADE';
export const UPDATE_TICKER = 'UPDATE_TICKER';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const SET_AMOUNT = 'SET_AMOUNT';
export const UPDATE_USER_ORDER = 'UPDATE_USER_ORDER';
export const UPDATE_TRADES = 'UPDATE_TRADES'
export const UPDATE_DIGITS = 'UPDATE_DIGITS'
export const UPDATE_BLOCK_INFO = 'UPDATE_BLOCK_INFO';
export const TOGGLE_LEFT_PANEL = 'TOGGLE_LEFT_PANEL';
export const TOGGLE_RIGHT_PANEL = 'TOGGLE_RIGHT_PANEL';
export const UPDATE_NETWORK = 'UPDATE_NETWORK';

export const TOGGLE_FAVORITE_LIST = 'TOGGLE_FAVORITE_LIST';
export const INIT_BALANCE = 'INIT_BALANCE'
export const UPDATE_OPEN_ORDERS = 'UPDATE_OPEN_ORDERS'

export const toggleFavoriteList = pair => ({
	type: TOGGLE_FAVORITE_LIST,
	pair
})
var markets = null;

export function getMarketQuotes() {
	return function(dispatch) {

	} 
}

export function initBalance() {
	return function(dispatch) {
	}
}

function getBaseCounter(market) {
	const parts = market.split("/")
	return {
		base: assetsBySymbol[parts[0]],
		counter: assetsBySymbol[parts[1]]
	}
}

export function buyTransaction(market, price, amount) {
	return (dispatch, getState) => {
		var {base, counter} = getBaseCounter(market)
		var user_id = getState().app.userId;

		const pKey = PrivateKey.fromWif(getState().app.private_key);
		// console.log(pKey, assets[base.id], "price=",price, "amount=", amount, user_id);

		const order = createLimitOrderWithPrice(user_id, true, window.assets, base.id, counter.id, price, amount)

		// console.log("order prepare", order);
		const tr = createLimitOrder2(order)
		return signAndBroadcast(tr, pKey)
			.then((e) => {
				// console.log("order result ", e);
				return e[0]
			}).catch((e) => {
				throw e
			})
	}
}

export function sellTransaction(market, price, amount) {
	return (dispatch, getState) => {
		var { base, counter } = getBaseCounter(market)
		var user_id = getState().app.userId;

		const pKey = PrivateKey.fromWif(getState().app.private_key);
		// console.log(pKey, assets[base.id], "price=", price, "amount=", amount, user_id);

		const order = createLimitOrderWithPrice(user_id, false, window.assets, base.id, counter.id, price, amount)

		// console.log("order prepare", order);
		const tr = createLimitOrder2(order)
		return signAndBroadcast(tr, pKey)
			.then((e) => {
				// console.log("order result ", e);
				return e[0]
			}).catch((e) => {
				throw e
			})
	}

}

export const cancelTransaction = (market, order_id) => {
	return (dispatch, getState) => {
		var { base, counter } = getBaseCounter(market)
		var user_id = getState().app.userId;
	
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		// console.log(pKey, assets[base.id], user_id);
	
		const order = cancelOrder(user_id, order_id)
	
		// console.log("cancel order", order);
		return signAndBroadcast(order, pKey)
			.then((e) => {
				// console.log("order result ", e);
			})
	}
}

var initAPI = false;
var initUser = false;
//var wsString = "ws://localhost:8090";
var wsString = "wss://testnet-01.quantachain.io:8095";

function getAvgtime() {
	const avgTime = blockTimes.reduce((previous, current, idx, array) => {
		return previous + current[1] / array.length;
	}, 0);
	return avgTime;
}
const blockTimes = [];
var previousTime = null;

function updateChainState(dispatch) {
	const object = ChainStore.getObject("2.1.0");

	if (object==null) {
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
		type: UPDATE_BLOCK_INFO,
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


var dynamicGlobal = null;

function onUpdate(dispatch) {

}

export function switchTicker(ticker) {
	Apis.setAutoReconnect(true)
	// send GA
	ReactGA.set({ page: "exchange/" + ticker });
	ReactGA.pageview("exchange/" + ticker);
	// console.log("Switch ticker ", ticker);

	return function (dispatch,getState) {
		var publicKey = null
		if (getState().app.private_key !== null) {
			const pKey = PrivateKey.fromWif(getState().app.private_key);
			publicKey = pKey.toPublicKey().toString()
		}

		dispatch({
			type: UPDATE_TICKER,
			data: ticker
		})

		if (initAPI == false) {
			Apis.instance(wsString, true, 3000, { enableOrders: true }).init_promise.then((res) => {
				// console.log("connected to:", res[0].network, publicKey);

				// Apis.instance().db_api().exec("set_subscribe_callback", [onUpdate, true]);
				initAPI = true;				

				ChainStore.init(false).then(() => {
					ChainStore.subscribe(updateChainState.bind(this, dispatch));
				});
			})
			.then((e) => {
				Apis.instance().db_api().exec("list_assets", ["A", 100]).then((assets) => {
					// console.log("assets ", assets);
					window.assets = lodash.keyBy(assets, "id")
					window.assetsBySymbol = lodash.keyBy(assets, "symbol")
					return assets;
				}).then((e) => {
					action(ticker)
				});
			})
			
		} else {
			action(ticker)
		}

		function action(ticker) {
			var {base, counter} = getBaseCounter(ticker)

			async function fetchData(ticker, first=false) {
				var {base, counter} = getBaseCounter(ticker)
				
				await fetch("https://s3.amazonaws.com/quantachain.io/markets.json").then(e => e.json())
					.then(async (e) => {
						// save for later
						markets = e;
						window.markets = markets.markets
						window.marketsHash = lodash.keyBy(markets.markets, "name")
						
						var marketData = [];
						var USD_value = {}
						// console.log("json ", markets.markets);

						for (const market of markets.markets) {
							var { base, counter } = getBaseCounter(market.name);
							const data = await Promise.all([Apis.instance()
								.db_api()
								.exec("get_ticker", [counter.id, base.id]),
							Apis.instance()
								.db_api()
								.exec("get_24_volume", [counter.id, base.id])])

							marketData.push({
								name: market.name,
								last: data[0].latest,
								base_volume: data[1].base_volume,
								quote_volume: data[1].quote_volume
							})
							if (counter.symbol == 'USD') {
								USD_value[base.id] = data[0].latest
							}
						}

						dispatch({
							type: SET_MARKET_QUOTE,
							data: [marketData, USD_value]
						})
					}).then(e => {
						if (!initUser && getState().app.private_key !== null) {
							const pKey = PrivateKey.fromWif(getState().app.private_key);
							publicKey = pKey.toPublicKey().toString()

							Apis.instance()
							.db_api()
							.exec("get_key_references", [[publicKey]])
							.then(vec_account_id => {
								// console.log("get_key_references ", vec_account_id[0][0]);
		
								return Apis.instance()
									.db_api()
									.exec("get_objects", [[vec_account_id[0][0]]])
									.then((data) => {
										// console.log("get account ", data);
										dispatch({
											type: UPDATE_ACCOUNT,
											data: data[0]
										})
									})
		
							}).then(e => {
								initUser = true
								fetchData(ticker)
							})
						}
					})
					
				const trades = Apis.instance().history_api().exec("get_fill_order_history", [base.id, counter.id, 100]).then((filled) => {
					//console.log("history filled ", filled);
					const trade_history = convertHistoryToOrderedSet(filled, base.id)
					//console.log("converted ", trade_history);
					const my_history = [];
					if (publicKey) {
						(filled.filter(order => order.op.account_id == getState().app.userId)).forEach((filled) => {
							var order = new FillOrder(
								filled,
								window.assets,
								base.id
							);
							my_history.push(order)
						})
					}
					
					return [trade_history, my_history]
				})
	
				// selling counter
				const orderBook = Apis.instance().db_api().exec("get_order_book", [counter.id, base.id, 50]).then((ob) => {
					// console.log("ob  ", ob);
					return aggregateOrderBook(ob.bids, ob.asks, window.assets[base.id].precision)
				})

				var account_data = [[],[]]
				
				if (publicKey && getState().app.userId) {
					account_data = Apis.instance()
					.db_api()
					.exec("get_full_accounts", [[getState().app.userId], true])
					.then(results => {
						var orders = [];
						results[0][1].limit_orders.forEach((ordered) => {
							// search both market pairs to see what makes sense
							// as the trading pair
							const base = assets[ordered.sell_price.base.asset_id].symbol
							const counter = assets[ordered.sell_price.quote.asset_id].symbol
							const symbolA = [base, counter]
							const symbolB = [counter, base]

							const foundA = window.marketsHash[symbolA.join("/")]
							const foundB = window.marketsHash[symbolB.join("/")]

							let baseId = base.id;
							if (foundA) {
								baseId = assetsBySymbol[base].id
							}else if (foundB) {
								baseId = assetsBySymbol[counter].id
							}
							var order = new LimitOrder(
								ordered,
								window.assets,
								baseId
							);
							
							// console.log("ordered", order);
							orders.push(order)
						})
						return [results, orders]
					})
				}

				// console.log("Get all the data! for ", ticker);
				return Promise.all([orderBook, trades, account_data])
					.then((data) => {
						dispatch({
							type: INIT_DATA,
							data: {
								orderBook: data[0],
								trades: data[1][0],
								filledOrders: data[1][1],
								openOrders: data[2][1],
								ticker: ticker,
								accountData: data[2][0]
							}
						})
						if (first) {
							const ask_section = document.getElementById("ask-section")
							ask_section.scrollTop = ask_section.scrollHeight;
						}
						
					})					
			}

			Apis.instance().db_api().exec("subscribe_to_market", [(data) => {
				// console.log("Got a market change ", base, counter, data);
				const curr_ticker = getBaseCounter(getState().app.currentTicker)
				if (base.id === curr_ticker.base.id && counter.id === curr_ticker.counter.id) {
					fetchData(ticker)
					if (Apis.instance().streamCb) {
						Apis.instance().streamCb()
					}
				}
			}, base.id, counter.id])

			fetchData(ticker, true)
		}
		// const orderBook = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/depth/"+ticker).then((res) => {return res.json()})
		// const trades = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/settlement/"+ticker).then((res) => {return res.json()})
		// const openOrders = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/status").then((res) => {return res.json()})

		// return Promise.all([orderBook,trades,openOrders])
		// 	.then((data) => {
		// 		dispatch({
		// 			type: INIT_DATA,
		// 			data: {
		// 				orderBook:data[0],
		// 				trades:data[1],
		// 				openOrders:data[2],
		// 				ticker:ticker,
		// 			}
		// 		})

		// 		var orderbookws = new EventSource('http://testnet-02.quantachain.io:7200/stream/depth/'+ticker);

		// 		// Log errors
		// 		orderbookws.onerror = function (error) {
		// 		  console.log('EventSource Error ' + error);
		// 		};

		// 		// Log messages from the server
		// 		orderbookws.onmessage = function (e) {
		// 			dispatch({
		// 				type: UPDATE_ORDER,
		// 				data: e.data
		// 			})
		// 		};

		// 		var tradesws = new WebSocket('ws://backend-dev.env.quantadex.com:8080/ws/v1/trades/BTC/USD');

		// 		// Log errors
		// 		tradesws.onerror = function (error) {
		// 		  console.log('WebSocket Error ' + error);
		// 		};

		// 		// Log messages from the server
		// 		tradesws.onmessage = function (e) {
		// 			dispatch({
		// 				type: UPDATE_TRADES,
		// 				data: e.data
		// 			})
		// 		};
		// 	})
	}

}
