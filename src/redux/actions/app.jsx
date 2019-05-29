import lodash from 'lodash';
import ApplicationApi from "../../common/api/ApplicationApi";
import WalletApi from "../../common/api/WalletApi";
import { Apis } from "@quantadex/bitsharesjs-ws";
import { FillOrder, LimitOrder } from "../../common/MarketClasses";
import { PrivateKey, ChainStore } from "@quantadex/bitsharesjs";
import { createLimitOrderWithPrice, createLimitOrder2, cancelOrder, signAndBroadcast } from "../../common/Transactions";
import { aggregateOrderBook, convertHistoryToOrderedSet } from "../../common/PriceData";
import ReactGA from 'react-ga';
import CONFIG from '../../config.js'
import Utils from "../../common/utils.js";
import {setItem} from "../../common/storage.js"

export const INIT_DATA = 'INIT_DATA';
export const USER_DATA = 'USER_DATA';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
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
export const UPDATE_STORAGE = 'UPDATE_STORAGE';
export const LOAD_FILLED_ORDERS = 'LOAD_FILLED_ORDERS';
export const TOGGLE_CONNECT_DIALOG = 'TOGGLE_CONNECT_DIALOG';
export const INIT_BALANCE = 'INIT_BALANCE'
export const UPDATE_OPEN_ORDERS = 'UPDATE_OPEN_ORDERS'
export const WEBSOCKET_STATUS = 'WEBSOCKET_STATUS'

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
	if (!market) return {}
	const parts = market.split("/")
	return {
		base: assetsBySymbol[parts[0]],
		counter: assetsBySymbol[parts[1]]
	}
}

export function GetAccount(id) {
	return Apis.instance().db_api().exec("get_accounts", [[id]]).then(e => {
		return e[0]
	})
}

export function buyTransaction(market, price, amount) {
	return (dispatch, getState) => {
		var {base, counter} = getBaseCounter(market)

		var user_id = getState().app.userId;
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		const order = createLimitOrderWithPrice(user_id, true, window.assets, base.id, counter.id, price, amount)
		const tr = createLimitOrder2(order)

		return signAndBroadcast(tr, pKey)
			.then((e) => {
				dispatch(updateUserData())
				return e[0]
			}).catch((e) => {
				if (e.message && e.message.includes("insufficient balance")) {
					throw e
				} else {
					Rollbar.error("Buy Failed", e);
				}
			})
	}
}

export function sellTransaction(market, price, amount) {
	return (dispatch, getState) => {
		var { base, counter } = getBaseCounter(market)

		var user_id = getState().app.userId;
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		const order = createLimitOrderWithPrice(user_id, false, window.assets, base.id, counter.id, price, amount)
		const tr = createLimitOrder2(order)

		return signAndBroadcast(tr, pKey)
			.then((e) => {
				dispatch(updateUserData())
				return e[0]
			}).catch((e) => {
				if (e.message && e.message.includes("insufficient balance")) {
					throw e
				} else {
					Rollbar.error("Sell Failed", e);
				} 
				
			})
	}

}

export const cancelTransaction = (order_id) => {
	return (dispatch, getState) => {
		var user_id = getState().app.userId;
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		const order = cancelOrder(user_id, order_id)
		
		return signAndBroadcast(order, pKey)
			.then((e) => {
				dispatch(updateUserData())
			})
	}
}

export const transferFund = (data) => {
	return (dispatch, getState) => {
		return ApplicationApi.transfer({ 
			from_account: getState().app.userId,
			to_account: data.showTransfer ? data.destination : data.issuer,
			amount: Math.round(data.amount * Math.pow(10, window.assetsBySymbol[data.asset].precision)),
			asset: data.asset,
			memo: data.memo,
			broadcast: true,
			encrypt_memo: false,
		}).then((tr) => {
			return signAndBroadcast(tr, PrivateKey.fromWif(getState().app.private_key)).then(() => {
					dispatch(updateUserData())
				})
		}).catch(e => {
			Rollbar.error("Transfer Failed", e);
			throw e
		})
	}
}

export const withdrawVesting = (data) => {
	return (dispatch, getState) => {
		return ApplicationApi.vesting_balance_withdraw({ 
			account: getState().app.userId,
			balance: data.balance_id,
			amount: data.amount,
			asset: data.asset
		}).then((tr) => {
			return signAndBroadcast(tr, PrivateKey.fromWif(getState().app.private_key)).then(() => {
				dispatch(updateUserData())
			})
		}).catch(e => {
			Rollbar.error("Vesting Failed", e);
			throw e
		})
	}
}

export const withdrawGenesis = (data) => {
	return (dispatch, getState) => {
		return ApplicationApi.balance_claim({ 
			account: getState().app.userId,
			public_key: getState().app.publicKey,
			balance: data.balance_id,
			amount: data.amount,
			asset: data.asset
		}).then((tr) => {
			return signAndBroadcast(tr, PrivateKey.fromWif(getState().app.private_key)).then(() => {
				dispatch(updateUserData())
			})
		}).catch(e => {
			Rollbar.error("Genesis Failed", e);
			throw e
		})
	}
}

export const accountUpgrade = () => {
	return (dispatch, getState) => {
		return ApplicationApi.account_upgrade({ 
			account: getState().app.userId
		}).then((tr) => {
			return signAndBroadcast(tr, PrivateKey.fromWif(getState().app.private_key)).then(() => {
				let data = {
					id: getState().app.userId,
					name: getState().app.name,
					publicKey: getState().app.publicKey,
					lifetime: true
				}
				dispatch({
					type: UPDATE_ACCOUNT,
					data: data
				})
				dispatch(updateUserData())
			})
		}).catch(error => {
			console.log(error)
			if (error.message.includes("Insufficient Balance")) {
				throw "Insufficient Balance"
			} else {
				Rollbar.error("Upgrade Failed", error);
				throw "Server error. Please try again"
			}
		})
	}
}

// const promiseTimeout = function(ms, promise){

// 	// Create a promise that rejects in <ms> milliseconds
// 	let timeout = new Promise((resolve, reject) => {
// 	  let id = setTimeout(() => {
// 		clearTimeout(id);
// 		reject('Timed out in '+ ms + 'ms.')
// 	  }, ms)
// 	})
  
// 	// Returns a race between our timeout and the passed in promise
// 	return Promise.race([
// 	  promise,
// 	  timeout
// 	])
//   }

  
// function query_roll_tx(tx, delay){
// 	var retryInterval = null;
// 	function getDataWithDelay(tx, ms) {
// 		return promiseTimeout(ms).then(e=> {
// 			return fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_history.op_object.tx&filter_value=${tx}`, { mode: "cors" }).then(e => e.json())
// 		})
// 	}

// 	return getDataWithDelay(tx, delay).then(res => {
// 		if (res.length == 0) {
// 			return getDataWithDelay(tx, delay).then(res=> {
// 				if (res.length == 0) {
// 					return getDataWithDelay(tx, delay).then(res=> {
// 						return res;
// 					})
// 				}
// 				return res;
// 			})
// 		} else {
// 			return res;
// 		}
// 	})	
// }

export const rollDice = (data) => {
	return (dispatch, getState) => {
		return ApplicationApi.roll_dice({ 
			account: getState().app.userId,
			amount: 1,
			asset: "1.3.0",
			bet: ">50",
			numbers: []
		}).then((tr) => {
			console.log(3, tr)
			return signAndBroadcast(tr, PrivateKey.fromWif(getState().app.private_key)).then(() => {
				// console.log(tr.id())
				return tr.id()
				// console.log(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_history.op_object.tx&filter_value=${tr.id()}`)


				
			})
		}).catch(error => {
			console.log(error)
			// if (error.message.includes("Insufficient Balance")) {
			// 	throw "Insufficient Balance"
			// } else {
			// 	throw "Server error. Please try again"
			// }
		})
	}
}

var initAPI = false;

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
		limitOrders = await fetch(CONFIG.getEnv().API_PATH + `/account?operation_type=1&account_id=${userId}&size=100&filter_field=operation_history__operation_result&filter_value=${cancels.join(',')}`, { mode: "cors" })
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
		return fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_type&filter_value=2,4&size=${dataSize}&from_=${page * dataSize}&account_id=${userId}`, { mode: "cors" })
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

export const AccountLogin = (private_key) => {
	return (dispatch, getState) => {
		const pKey = PrivateKey.fromWif(private_key);
		let publicKey = pKey.toPublicKey().toString()

		return Apis.instance()
		.db_api()
		.exec("get_key_references", [[publicKey]])
		.then(vec_account_id => {
			// console.log("get_key_references ", vec_account_id);
			if (vec_account_id[0].length == 0) {
				throw "No account for public key: " + publicKey
			}

			const dedup_ids = []
			for (let id of vec_account_id[0]) {
				if (!dedup_ids.includes(id)) dedup_ids.push(id)
			}

			if (dedup_ids.length == 1) {
				dispatch(ConnectAccount(dedup_ids[0], private_key))
			} else {
				return Apis.instance().db_api().exec("get_accounts", [dedup_ids]).then(e => {
					return e
				})
			}
			
			
		}).catch(error => {
			console.log(error)
			if (typeof error == "string") {
				throw error
			} else {
				Rollbar.error("Login Failed", error);
				throw "Server error. Please try again."
			}
		})
	}
}

export const ConnectAccount = (account_id, private_key) => {
	return (dispatch, getState) => {
		return Apis.instance()
		.db_api()
		.exec("get_objects", [[account_id]])
		.then((data) => {
			// console.log("get account ", data);
			let lifetime_member = data[0].membership_expiration_date === "1969-12-31T23:59:59"
			dispatch({
				type: UPDATE_ACCOUNT,
				data: {...data[0], lifetime: lifetime_member}
			})
			dispatch({
				type: LOGIN,
				private_key: private_key
			})

			setItem("name", data[0].name)
			setItem("id", data[0].id)
			setItem("publicKey", data[0].active.key_auths[0][0])
			setItem("lifetime", lifetime_member)
			setItem("env", window.location.pathname.startsWith("/testnet") ? "testnet" : "mainnet")
			if (window.isApp) {
				setItem("private_key", private_key)
			}

			Rollbar.configure({
				payload: {
				  person: {
					id: data[0].id,
					username: data[0].name
				  }
				}
			  });

		}).then(e => {
			dispatch(updateUserData())
			dispatch({
				type: TOGGLE_CONNECT_DIALOG,
				data: false
			})
			return true
		}).catch(error => {
			console.log(error)
			if (error.message.includes("Bad Cast")) {
				throw "No account for public key: " + publicKey
			} else {
				Rollbar.error("Connect Failed", error);
				throw "Server error. Please try again."
			}
		})
	}
}

window.binance_price = {"BTCUSDT": 0, "ETHUSDT": 0}
const binance_socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker');
binance_socket.addEventListener('message', function (event) {
	const data = JSON.parse(event.data).data
	window.binance_price[data.s] = data.c
});

var market_depth_time
var reconnect_timeout

function reconnect(instance, dispatch, ticker) {
	dispatch({
		type: WEBSOCKET_STATUS,
		data: 0
	})

	if (reconnect_timeout) return
	reconnect_timeout = setTimeout(() => {
		instance.close()
		dispatch(switchTicker(ticker, true))
		reconnect_timeout = null
	}, 1000)
}

export function switchTicker(ticker, force_init=false) {
	// send GA
	ReactGA.set({ page: "exchange/" + ticker });
	ReactGA.pageview("exchange/" + ticker);
	// console.log("Switch ticker ", ticker);

	return function (dispatch,getState) {
		if (initAPI == false || force_init) {
			Apis.instance(CONFIG.getEnv().WEBSOCKET_PATH, true, 5000, { enableOrders: true }).init_promise.then((res) => {
				// console.log("connected to:", publicKey);

				// Apis.instance().db_api().exec("set_subscribe_callback", [onUpdate, true]);
				initAPI = true;

				ChainStore.subscribers.clear()
				ChainStore.init(false).then(() => {
					ChainStore.subscribe(updateChainState.bind(this, dispatch));
				});
			})
			.then((e) => {
				dispatch({
					type: WEBSOCKET_STATUS,
					data: 1
				})
				Apis.instance().db_api().exec("list_assets", ["A", 100]).then((assets) => {
					// console.log("assets ", assets);
					window.assets = lodash.keyBy(assets, "id")
					window.assetsBySymbol = lodash.keyBy(assets, "symbol")
					return assets;
				}).then((e) => {
					action(ticker)
				});

				Apis.instance().db_api().exec("get_global_properties", []).then(e => {
					window.maker_rebate_percent_of_fee = e.parameters.extensions.maker_rebate_percent_of_fee
				})
			})
			.catch(e => {
				reconnect(Apis.instance(), dispatch, ticker)
				Rollbar.error("Apis init Failed", e);
				return null
			})
			
			Rollbar.configure({
				payload: {
				  person: {
					id: getState().app.userId,
					username: getState().app.name
				  }
				}
			  });
			
		} else {
			try {
				action(ticker)
			} catch(e) {
				console.log(e)
				reconnect(Apis.instance(), dispatch, ticker)
				Rollbar.error("Apis init Failed", e);
			}
		}

		function action(ticker) {
			var {base, counter} = getBaseCounter(ticker)
			dispatch({
				type: UPDATE_TICKER,
				data: ticker
			})
			if (base && counter) {
				const tmpOrder = createLimitOrderWithPrice("1.2.0", true, window.assets, base.id, counter.id, 1, 1)
				const tr = createLimitOrder2(tmpOrder)
				tr.set_required_fees().then(e => {
					dispatch({
						type: UPDATE_FEE,
						data: tr.operations[0][1].fee
					})
				})
			}

			async function fetchData(ticker, first=false) {
				var {base, counter} = getBaseCounter(ticker)
				try {
					if (!window.markets) {
						const markets = await fetch(CONFIG.getEnv().MARKETS_JSON, {mode: "cors"}).then(e => e.json()).catch(e => {
							Rollbar.error("Failed to get Markets JSON", e);
						})
						window.markets = markets.markets
						window.marketsHash = Object.keys(markets.markets).reduce(function (previous, key) {
							let ob = lodash.keyBy({...markets.markets[key]}, "name")
							return {...previous, ...ob}
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

					var marketData = {};
					var USD_value = {}

					// console.log("json ", window.markets);

					for (const market in window.markets) {
						for (const pair of window.markets[market]) {
							let { base, counter } = getBaseCounter(pair.name);
							if(!base || !counter) continue
							const data = await Promise.all([Apis.instance()
								.db_api()
								.exec("get_ticker", [counter.id, base.id]),
							Apis.instance()
								.db_api()
								.exec("get_24_volume", [counter.id, base.id])])

							if (!market_depth_time || ((new Date()) - market_depth_time) > (60*5*1000)) {
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
							let latest = data[0].latest === "0" ? data[0].highest_bid === "0" || data[0].highest_ask === "0" ? "-" : (parseFloat(data[0].highest_bid) + parseFloat(data[0].lowest_ask))/2 : data[0].latest
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
					market_depth_time = new Date()

					window.USD_value = USD_value
					dispatch({
						type: SET_MARKET_QUOTE,
						data: [marketData, USD_value]
					})

				} catch(e) {
					console.log(e)
					reconnect(Apis.instance(), dispatch, ticker)
					return
				}					
				
				const trades = Apis.instance().history_api().exec("get_fill_order_history", [base.id, counter.id, 100]).then((filled) => {
					// console.log("history filled ", filled);
					const trade_history = convertHistoryToOrderedSet(filled, base.id)
					//console.log("converted ", trade_history);
					return trade_history
				})
	
				// selling counter
				const orderBook = Apis.instance().db_api().exec("get_order_book", [counter.id, base.id, 50]).then((ob) => {
					// console.log("ob  ", ob);
					return aggregateOrderBook(ob.bids, ob.asks, window.assets[base.id].precision)
				})

				// console.log("Get all the data! for ", ticker);
				return Promise.all([orderBook, trades])
					.then((data) => {
						dispatch({
							type: INIT_DATA,
							data: {
								ticker: ticker,
								orderBook: data[0],
								trades: data[1],
							}
						})
						if (first) {
							const ask_section = document.getElementById("ask-section")
							if (ask_section) ask_section.scrollTop = ask_section.scrollHeight;
						}
						
					})					
			}
			var fetchTime = new Date()
			Apis.instance().db_api().exec("subscribe_to_market", [(data) => {
				// console.log("Got a market change ", ticker, base, counter, data);
				const curr_ticker = getBaseCounter(getState().app.currentTicker)

				if (base.id === curr_ticker.base.id && counter.id === curr_ticker.counter.id) {
					try {
						if (new Date() - fetchTime > 50) {
							fetchData(ticker)
							fetchTime = new Date()
						}
						
						if (Apis.instance().streamCb) {
							Apis.instance().streamCb()
						}
					} catch (e) {
						console.log(e)
						reconnect(Apis.instance(), dispatch, ticker)
					}
				}
			}, base.id, counter.id])

			fetchData(ticker, true)
		}
	}
}

export function updateUserData() {
	return function (dispatch, getState) {
		const publicKey = getState().app.publicKey
		const userId = getState().app.userId
		
		if (!(publicKey && userId)) return
		if (!Apis.instance().db_api() || getState().app.markets.length == 0) {
			setTimeout(() => {
				dispatch(updateUserData())
			}, 500)
			return
		}

		var account_data = [[],[]]
		var my_trades = []
		var genesis_balance = []
		
		my_trades = fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_type&filter_value=2,4&size=${dataSize}&account_id=${userId}`, { mode: "cors" }).then(e => e.json())
		.then((filled) => {
			const my_history = processOrderHistory(filled, userId)
			// console.log(my_history)
			return my_history
		})

		
		account_data = Apis.instance()
		.db_api()
		.exec("get_full_accounts", [[userId], true])
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
		}).then(e => {
			let statistic_id = e[0][0][1].statistics.id
			return Apis.instance().db_api().exec("get_objects", [[statistic_id]]).then(statistics=>{
				return [...e, statistics[0].extensions.referral_fee_paid]
			})
		})

		const shortAddress = WalletApi.getShortAddress(publicKey)
		genesis_balance = Apis.instance().db_api().exec("get_balance_objects", [[shortAddress]]).then(e=>{
			// console.log("balance obj????", e);
			return e
		})

		return Promise.all([account_data, my_trades, genesis_balance])
			.then((data) => {
				dispatch({
					type: USER_DATA,
					data: {
						filledOrders: data[1],
						openOrders: data[0][1],
						accountData: data[0][0],
						referral_fee: data[0][2],
						genesis_balance: data[2],
					}
				})
			})	
	}
}