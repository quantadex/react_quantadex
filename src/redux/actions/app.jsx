import lodash from 'lodash';
import API from "../../api.jsx"
import SortedSet from 'js-sorted-set'
import QuantaClient from "@quantadex/quanta_js"
import ApplicationApi from "../../common/api/ApplicationApi";
import { Apis } from "@quantadex/bitsharesjs-ws";
import { Price, Asset, FillOrder, LimitOrderCreate, LimitOrder } from "../../common/MarketClasses";
import { PrivateKey, PublicKey, Aes, key, ChainStore } from "@quantadex/bitsharesjs";
import { createLimitOrderWithPrice, createLimitOrder2, cancelOrder, signAndBroadcast } from "../../common/Transactions";
import { aggregateOrderBook, convertHistoryToOrderedSet } from "../../common/PriceData";
import ReactGA from 'react-ga';
import { toast } from 'react-toastify';
import CONFIG from '../../config.js'

export const INIT_DATA = 'INIT_DATA';
export const LOGIN = 'LOGIN';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const UPDATE_FEE = 'UPDATE_FEE';
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
export const LOAD_FILLED_ORDERS = 'LOAD_FILLED_ORDERS';

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

export function GetName(id) {
	return Apis.instance().db_api().exec("get_accounts", [[id]]).then(e => {
		return e[0].name
	})
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

export const transferFund = (data) => {
	return (dispatch, getState) => {
		return ApplicationApi.transfer({ 
			from_account: getState().app.userId,
			to_account: data.showTransfer ? data.destination : data.issuer,
			amount: data.amount * Math.pow(10, window.assetsBySymbol[data.asset].precision),
			asset: data.asset,
			memo: data.memo,
			broadcast: true,
			encrypt_memo: false,
		}).then((tr) => {
			// console.log(tr);
			return signAndBroadcast(tr, PrivateKey.fromWif(getState().app.private_key))
		}).catch(e => {
			throw e
		})
	}
}

var initAPI = false;
var initUser = false;
//var wsString = "ws://localhost:8090";
var wsString = CONFIG.SETTINGS.WEBSOCKET_PATH;
export var dataSize = 100;

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

function validMarketPair(a, b) {
	const pair = [a, b]
	const base = assets[a].symbol
	const counter = assets[b].symbol
	const symbolA = [base, counter]

	const foundA = window.marketsHash[symbolA.join("/")]

	return foundA ? pair : pair.reverse()
}

async function processOrderHistory(data, userId) {
	const my_history = []
	const cancels = []
	var limitOrders = []
	
	data.filter((op) => op.operation_type == 2).map(item => {
		cancels.push(item.operation_history.op_object.order)
	})

	if (cancels.length > 0) {
		limitOrders = await fetch(CONFIG.SETTINGS.API_PATH + `/account?operation_type=1&account_id=${userId}&size=100&filter_field=operation_history__operation_result&filter_value=${cancels.join(',')}`)
			.then(e => e.json())
			.then(e => {
				return lodash.keyBy(e, (o) => o.operation_history.operation_result.split(',')[1].replace(/"/g, '').replace(']', ''))
			})
	}
	data.forEach((filled) => {
		if (filled.operation_type == 2 && filled.operation_history.operation_result == "[0,{}]") {
			return
		}
		let baseId
		var order
		const type = filled.operation_type
		let op = filled.operation_history
		op.time = filled.block_data.block_time
		op.block_num = filled.block_data.block_num

		if (type == 2) {
			let limitOp = limitOrders[op.op_object.order].operation_history.op_object
			limitOp.sell_price = {base: limitOp.amount_to_sell, quote: limitOp.min_to_receive}
			limitOp.id = op.op_object.order
			limitOp.time = op.time
			
			baseId = validMarketPair(limitOp.amount_to_sell.asset_id, limitOp.min_to_receive.asset_id)[0]
			order = new LimitOrder(
				limitOp,
				window.assets,
				baseId
			);
		} else {
			baseId = validMarketPair(op.op_object.fill_price.base.asset_id, op.op_object.fill_price.quote.asset_id)[0]
			op.op = [{}, op.op_object]
			order = new FillOrder(
				op,
				window.assets,
				baseId
			);
		}
		my_history.push(order)
	})
	return my_history
}

export const loadOrderHistory = (page) => {
	return (dispatch, getState) => {
		const userId = getState().app.userId
		return fetch(CONFIG.SETTINGS.API_PATH + `/account?filter_field=operation_type&filter_value=2,4&size=${dataSize}&from_=${page * dataSize}&account_id=${userId}`)
			.then(e => e.json())
			.then((filled) => {
				return processOrderHistory(filled, userId)
			}).then(my_history => {
				dispatch({
					type: LOAD_FILLED_ORDERS,
					data: my_history
				})
			})
	}
}

var disconnect_notified
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

			const tmpOrder = createLimitOrderWithPrice("1.2.0", true, window.assets, base.id, counter.id, 1, 1)
			const tr = createLimitOrder2(tmpOrder)
			tr.set_required_fees().then(e => {
				dispatch({
					type: UPDATE_FEE,
					data: tr.operations[0][1].fee
				})
			})

			async function fetchData(ticker, first=false) {
				var {base, counter} = getBaseCounter(ticker)
				try {
					await fetch(CONFIG.SETTINGS.MARKETS_JSON).then(e => e.json())
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
								USD_value[counter.id] = 1
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
				} catch(e) {
					console.log(e)
					if (!disconnect_notified) {
						disconnect_notified = toast.error("Lost connection to server. Please refresh the page.", {
							position: toast.POSITION.TOP_CENTER,
							autoClose: false
						});
					}
					
					return
				}		
				
				const trades = Apis.instance().history_api().exec("get_fill_order_history", [base.id, counter.id, 100]).then((filled) => {
					// console.log("history filled ", filled);
					const trade_history = convertHistoryToOrderedSet(filled, base.id)
					//console.log("converted ", trade_history);
					return trade_history
				})

				var my_trades = []

				if (publicKey && getState().app.userId) {
					const userId = getState().app.userId
					my_trades = fetch(CONFIG.SETTINGS.API_PATH + `/account?filter_field=operation_type&filter_value=2,4&size=${dataSize}&account_id=${userId}`).then(e => e.json())
					.then((filled) => {
						const my_history = processOrderHistory(filled, userId)
						// console.log(my_history)
						return my_history
					})
				}
	
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
							let baseId = validMarketPair(ordered.sell_price.base.asset_id, ordered.sell_price.quote.asset_id)[0]
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
				return Promise.all([orderBook, trades, account_data, my_trades])
					.then((data) => {
						dispatch({
							type: INIT_DATA,
							data: {
								orderBook: data[0],
								trades: data[1],
								filledOrders: data[3],
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
	}

}
