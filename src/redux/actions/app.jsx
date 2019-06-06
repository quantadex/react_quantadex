import lodash from 'lodash';
import React from 'react';
import ApplicationApi from "../../common/api/ApplicationApi";
import WalletApi from "../../common/api/WalletApi";
import { Apis } from "@quantadex/bitsharesjs-ws";
import { FillOrder, LimitOrder } from "../../common/MarketClasses";
import { PrivateKey, ChainStore } from "@quantadex/bitsharesjs";
import { createLimitOrderWithPrice, createLimitOrder2, cancelOrder, signAndBroadcast } from "../../common/Transactions";
import { validMarketPair, getBaseCounter, aggregateOrderBook, convertHistoryToOrderedSet } from "../../common/PriceData";
import { toast } from 'react-toastify';
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
export const TOGGLE_BUY_QDEX_DIALOG = 'TOGGLE_BUY_QDEX_DIALOG';
export const INIT_BALANCE = 'INIT_BALANCE'
export const UPDATE_OPEN_ORDERS = 'UPDATE_OPEN_ORDERS'
export const WEBSOCKET_STATUS = 'WEBSOCKET_STATUS'


export function GetAccount(id) {
	return Apis.instance().db_api().exec("get_accounts", [[id]]).then(e => {
		return e[0]
	})
}

function notify_success(toastId, msg) {
	toast.update(toastId, {
		render: msg,
		type: toast.TYPE.SUCCESS,
		autoClose: 2000,
		position: toast.POSITION.TOP_CENTER,
		pauseOnFocusLoss: false,
		pauseOnHover: false
	});
}

function notify_failed(toastId, msg) {
	toast.update(toastId, {
		render: msg,
		type: toast.TYPE.ERROR,
		autoClose: 2000,
		position: toast.POSITION.TOP_CENTER,
		pauseOnFocusLoss: false,
		pauseOnHover: false
	});
}

function toastMsg(label, success, e) {
	const msg = (<div>
		<span>{label}</span><br />
		<span>{success ? "Order ID: " + e.trx.operation_results[0][1] :
			"Failed order: " + (e.message.toLowerCase().includes("insufficient balance") ? "Insufficient Balance" : "Unable to place order: " + e.message)}</span>
	</div>)
	return msg
}

export function buyTransaction(market, price, amount, fill_or_kill = false, mobile_nav = undefined) {
	return (dispatch, getState) => {
		var {base, counter} = getBaseCounter(market)

		const asset = market.split('/')[0].split('0X')
		const label = asset[0] + (asset[1] ? '0x' + asset[1].substr(0,4) : "") + " " + amount + " @ " + price
		const toastId = toast("BUYING " + label, { autoClose: false, position: toast.POSITION.TOP_CENTER });

		var user_id = getState().app.userId;
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		const order = createLimitOrderWithPrice(user_id, true, window.assets, base.id, counter.id, price, amount, fill_or_kill)
		const tr = createLimitOrder2(order)

		return signAndBroadcast(tr, pKey)
			.then((e) => {
				const msg = toastMsg("BUY " + label, true, e[0])
				dispatch(updateUserData())
				if (asset[0] == "QDEX") {
					if (mobile_nav) {
						mobile_nav("trade")
					} else {
						dispatch({
							type: TOGGLE_BUY_QDEX_DIALOG,
							data: false
						})
					}
				}
				setTimeout(() => {
					notify_success(toastId, msg)
				}, 0)
			}).catch((e) => {
				if (e.message.includes("less than required")) {
					if (mobile_nav) {
						mobile_nav("buy_qdex")
					} else {
						dispatch({
							type: TOGGLE_BUY_QDEX_DIALOG,
							data: true
						})
					}
				}
				const msg = toastMsg("BUY " + label, false, e)
				notify_failed(toastId, msg)  
				Rollbar.error("Buy Failed", e);
				return e
			})
	}
}

export function sellTransaction(market, price, amount, mobile_nav = undefined) {
	return (dispatch, getState) => {
		var { base, counter } = getBaseCounter(market)

		const asset = market.split('/')[0].split('0X')
		const label = asset[0] + (asset[1] ? '0x' + asset[1].substr(0,4) : "") + " " + amount + " @ " + price
		const toastId = toast("SELLING " + label, { autoClose: false, position: toast.POSITION.TOP_CENTER });
	
		var user_id = getState().app.userId;
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		const order = createLimitOrderWithPrice(user_id, false, window.assets, base.id, counter.id, price, amount)
		const tr = createLimitOrder2(order)

		return signAndBroadcast(tr, pKey)
			.then((e) => {
				const msg = toastMsg("SELL " + label, true, e[0])
				notify_success(toastId, msg)
				dispatch(updateUserData())
			}).catch((e) => {
				if (e.message.includes("less than required")) {
					if (mobile_nav) {
						mobile_nav("buy_qdex")
					} else {
						dispatch({
							type: TOGGLE_BUY_QDEX_DIALOG,
							data: true
						})
					}
				}
				const msg = toastMsg("SELL " + label, false, e)
				notify_failed(toastId, msg)
				Rollbar.error("Sell Failed", e);
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

export const rollDice = (amount, asset, bet) => {
	const now = new Date()
	return (dispatch, getState) => {
		return ApplicationApi.roll_dice({ 
			account: getState().app.userId,
			amount,
			asset,
			bet,
			numbers: []
		}).then((tr) => {
			// console.log(3, tr)
			const pKey = PrivateKey.fromWif(getState().app.private_key)
			tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
			//console.log("serialized transaction:", tr.serialize().operations);
			console.log('before broadcast', new Date() - now)
			return tr.broadcast()
				.then((res) => {
					console.log("Call order update success!");
					console.log("sent", new Date() - now)
					return tr.id()
					// return res;
				})

			// return signAndBroadcast(tr, PrivateKey.fromWif(getState().app.private_key)).then(() => {
			// 	console.log("sent", new Date() - now)
			// 	// console.log(tr.id())
			// 	return tr.id()
			// 	// console.log(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_history.op_object.tx&filter_value=${tr.id()}`)


				
			// })
		}).catch(error => {
			console.log(error)
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

export function getQdexAsks(counter) {
	return function () {
		const qdex_id = window.assetsBySymbol.QDEX.id
		return Apis.instance().db_api().exec("get_order_book", [counter.id, qdex_id, 50]).then((ob) => {
			return aggregateOrderBook([], ob.asks, window.assets[qdex_id].precision).asks
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
			dispatch({ type: UPDATE_TICKER, data: ticker })
			if (window.initAPI == false || force_init) {
				Apis.setRpcConnectionStatusCallback(
					(status) => {
						// console.log("ws status changed: ", status);
						if (status === "reconnect")
							ChainStore.resetCache(false);
						if (status === "closed") {
							dispatch({ type: "WEBSOCKET_STATUS", data: "Closed" })
							setTimeout(() => {
								if (!document[window.hidden]) QuantaApi.ConnectAsync(dispatch)
							}, 1000)
						}
						if (status === "open") {
							dispatch({ type: "WEBSOCKET_STATUS", data: null })
						}
					}
				);

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
				// console.log("initialized update");
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
		const data = await QuantaApi.fetchDataAsync(ticker)

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
		
		if (first) {
			const ask_section = document.getElementById("ask-section")
			if (ask_section) ask_section.scrollTop = ask_section.scrollHeight;
		}
	}

	await updateFetchDataAsync(ticker, true)
}

export function refreshData() {
	return async function (dispatch, getState) {
	dispatch(switchTicker(getState().app.currentTicker))
	dispatch(updateUserData())
}
}

export function updateUserData() {
	return async function (dispatch, getState) {
		const publicKey = getState().app.publicKey
		const userId = getState().app.userId
		// console.log("updateUserData", userId);	

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