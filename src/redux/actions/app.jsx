import lodash from 'lodash';
import ApplicationApi from "../../common/api/ApplicationApi";
import WalletApi from "../../common/api/WalletApi";
import { Apis } from "@quantadex/bitsharesjs-ws";
import { FillOrder, LimitOrder } from "../../common/MarketClasses";
import { PrivateKey, ChainStore } from "@quantadex/bitsharesjs";
import { createLimitOrderWithPrice, createLimitOrder2, cancelOrder, signAndBroadcast } from "../../common/Transactions";
import { validMarketPair, getBaseCounter, aggregateOrderBook, convertHistoryToOrderedSet } from "../../common/PriceData";
import ReactGA from 'react-ga';
import CONFIG from '../../config.js'
import Utils from "../../common/utils.js";
import {setItem} from "../../common/storage.js"
import * as QuantaApi from './quanta-api'
import * as OrderHistory from './order_history.jsx';

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
				Rollbar.error("Buy Failed", e);
				throw e
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
				Rollbar.error("Sell Failed", e);
				throw e
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
			}).catch((e) => {
				Rollbar.error("Cancel Failed", e);
				throw e
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

export const loadOrderHistory = (page) => {
	return (dispatch, getState) => {
		const userId = getState().app.userId
		return fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_type&filter_value=2,4&size=${dataSize}&from_=${page * dataSize}&account_id=${userId}`, { mode: "cors" })
			.then(e => e.json())
			.then((filled) => {
				return OrderHistory.processOrderHistory(filled, userId)
			}).then(my_history => {
				dispatch({
					type: LOAD_FILLED_ORDERS,
					data: my_history
				})
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

window.initAPI = false;
export var dataSize = 100;

export function switchTicker(ticker, force_init=false) {
	// send GA
	ReactGA.set({ page: "exchange/" + ticker });
	ReactGA.pageview("exchange/" + ticker);
	// console.log("Switch ticker ", ticker);

	return function (dispatch,getState) {
		async function update() {
			if (window.initAPI == false || force_init) {
				const res = await QuantaApi.ConnectAsync(dispatch)

				await QuantaApi.UpdateGlobalPropertiesAsync()
				await fetchAndSubscribeTickerAsync(ticker, dispatch)

				// Updates user in case they are already logged in.
				Rollbar.configure({
					payload: {
						person: {
						id: getState().app.userId,
						username: getState().app.name
						}
					}
				});
				window.initAPI = true;
				console.log("initialized update");
			} else {
				await fetchAndSubscribeTickerAsync(ticker, dispatch)
			}
		}
		update().catch((e)=>{
			Rollbar.error("update ticker exception: ", e);
		})
	}
}

async function fetchAndSubscribeTickerAsync(ticker, dispatch) {
	var {base, counter} = getBaseCounter(ticker)
	if (!base || !counter) 
		return

	dispatch({ type: UPDATE_TICKER, data: ticker })

	// update fees
	const tmpOrder = createLimitOrderWithPrice("1.2.0", true, window.assets, base.id, counter.id, 1, 1)
	const tr = createLimitOrder2(tmpOrder)
	await tr.set_required_fees()
	dispatch({
		type: UPDATE_FEE,
		data: tr.operations[0][1].fee
	})
	
	var fetchTime = new Date()
	Apis.instance().db_api().exec("subscribe_to_market", [(data) => {
		// console.log("Got a market change ", ticker, base, counter, data);
		const curr_ticker = getBaseCounter(ticker)

		async function subscribeToTicker() {
			if (base.id === curr_ticker.base.id && counter.id === curr_ticker.counter.id) {
				if (new Date() - fetchTime > 50) {
					await updateFetchDataAsync(ticker)
					fetchTime = new Date()

					if (Apis.instance().streamCb) {
						await Apis.instance().streamCb()
					}			
				}
			}
		}

		subscribeToTicker().then(() => {}).catch((e) => {
			Rollbar.error("subscribe exception caught:", e);
		})
	}, base.id, counter.id])

	async function updateFetchDataAsync(ticker, first=false) {
		const data = await QuantaApi.fetchDataAsync(ticker, first)

		window.USD_value = data.USD_value
		dispatch({
			type: SET_MARKET_QUOTE,
			data: [data.marketData, data.USD_value]
		})

		dispatch({
			type: INIT_DATA,
			data: {
				ticker: data.ticker,
				orderBook: data.orderBook,
				trades: data.trades,
			}
		})		
	}

	await updateFetchDataAsync(ticker, true)
}

export function reconnectIfNeeded() {
	return async function (dispatch, getState) {
		if (getState().app.websocket_status) {
			console.log("Attempt to reconnect", getState().websocket_status);
			const res = await QuantaApi.ConnectAsync(dispatch)

			dispatch(switchTicker(getState().app.currentTicker))
			dispatch(updateUserData())
		}
	}
}

export function updateUserData() {
	return async function (dispatch, getState) {
		const publicKey = getState().app.publicKey
		const userId = getState().app.userId
		console.log("updateUserData", userId);	

		if (!(publicKey && userId)) return
		if (!Apis.instance().db_api() || getState().app.markets.length == 0) {
			setTimeout(() => {
				dispatch(updateUserData())
			}, 500)
			return
		}
		
		const my_trades_promise = fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_type&filter_value=2,4&size=${dataSize}&account_id=${userId}`, { mode: "cors" }).then(e => e.json())
		.then((filled) => {
			const my_history = OrderHistory.processOrderHistory(filled, userId)
			// console.log(my_history)
			return my_history
		})
		
		const account_data_promise = Apis.instance()
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
		const genesis_balance_promise = Apis.instance().db_api().exec("get_balance_objects", [[shortAddress]]).then(e=>{
			// console.log("balance obj????", e);
			return e
		})

		return Promise.all([account_data_promise, my_trades_promise, genesis_balance_promise])
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
			}).catch(e=> {
				Rollbar.error("Problems with updateUserData ", e)
			})
	}
}