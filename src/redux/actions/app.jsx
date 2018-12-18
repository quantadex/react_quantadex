import lodash from 'lodash';
import API from "../../api.jsx"
import SortedSet from 'js-sorted-set'
import QuantaClient from "@quantadex/quanta_js"
import { Apis } from "@quantadex/bitsharesjs-ws";
import { FillOrder } from "../../common/MarketClasses";

export const INIT_DATA = 'INIT_DATA';
export const LOGIN = 'LOGIN';
export const SET_MARKET_QUOTE = 'SET_MARKET_QUOTE';
export const APPEND_TRADE = 'APPEND_TRADE';
export const UPDATE_TICKER = 'UPDATE_TICKER';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const SET_AMOUNT = 'SET_AMOUNT';
export const UPDATE_USER_ORDER = 'UPDATE_USER_ORDER';
export const UPDATE_TRADES = 'UPDATE_TRADES'
export const UPDATE_DIGITS = 'UPDATE_DIGITS'

export const TOGGLE_LEFT_PANEL = 'TOGGLE_LEFT_PANEL';
export const TOGGLE_RIGHT_PANEL = 'TOGGLE_RIGHT_PANEL';

export const TOGGLE_FAVORITE_LIST = 'TOGGLE_FAVORITE_LIST';
export const INIT_BALANCE = 'INIT_BALANCE'
export const UPDATE_OPEN_ORDERS = 'UPDATE_OPEN_ORDERS'

export const toggleFavoriteList = pair => ({
	type: TOGGLE_FAVORITE_LIST,
	pair
})

var qClient, default_market;
export function initMarket(key) {
	console.log("set key =", key)
	qClient = new QuantaClient({ orderbookUrl: "http://orderbook-api-792236404.us-west-2.elb.amazonaws.com", secretKey: key })
	default_market = (qClient.showMarkets().then((e) => {
		return e[0].Name
	}))
}

export function getMarketQuotes() {
	return function(dispatch) {
		qClient.getQuotes().then((e) => {
			dispatch({
				type: SET_MARKET_QUOTE,
				data: e
			})
		})
	} 
}

var getFreeCoins = (accountId) => {
	return fetch("http://backend-dev.env.quantadex.com:8080/api/v1/demo/freecoins/" + accountId)
					.then((res) => {return res.json()})
}

var register = (json) => {
	return fetch("http://backend-dev.env.quantadex.com:8080/api/v1/account/register",{
						method: 'POST',
						body: JSON.stringify(json), // must match 'Content-Type' header
						headers: {
							"Content-Type" : "application/json"
						},
					}).then((res) => {return res.json()})
}

var postTransaction = (tx) => {
	return fetch("http://backend-dev.env.quantadex.com:8080/api/v1/tx",{
						method: 'POST',
						body: JSON.stringify({tx:tx.toEnvelope().toXDR('base64')}), // must match 'Content-Type' header
						headers: {
							"Content-Type" : "application/json"
						},
					}).then((res) => {return res.json()})
}

var getBalance = (accountId) => {
	return fetch("http://backend-dev.env.quantadex.com:8080/api/v1/account/balance/" + accountId)
					.then((res) => {return res.json()})
}

var getMyOrders = (accoundId) => {
	return fetch("http://backend-dev.env.quantadex.com:8080/api/v1/account/orders/" + accoundId)
	.then((res) => {return res.json()})
}

export function initBalance() {
	return function(dispatch) {
	    console.log("initBalance(): initializing balance")

		localStorage.removeItem("quanta_sender_publicKey")

		StellarBase.Network.use(new StellarBase.Network("Test QuantaDex SDF Network ; June 2018"))

		if (localStorage.getItem("quanta_sender_publicKey") == null) {
			var sender_keypair = Keypair.random();
			var sender_secret = sender_keypair.secret()
			var sender_public = sender_keypair.publicKey()
			var issuer_publicKey = "GC5YBJP4YMTVZ5DLNZDDLFQAY5MGJ66I5GAJN34FPTZIMJKEVRQ22K24"
			console.log("initBalance() sender public key: ",sender_keypair.publicKey())
			console.log("initBalance() sender secret key: ",sender_secret)
			var sender_json = {
				accountId:sender_public,
				firstName:"sender_first",
				lastName:"sender_last",
				email:"sender_email",
			}

			return register(sender_json).then((data) => {
				console.log("after register sender: ",data)
				localStorage.setItem("quanta_sender_publicKey",sender_public)
				localStorage.setItem("quanta_sender_secretKey",sender_secret)
				localStorage.setItem("quanta_issuer_publicKey",issuer_publicKey)
				var account=new StellarBase.Account(sender_public,data.seqnum.toString());
				var opts = {
					asset:new Asset("BTC",issuer_publicKey),
					limit:"1000000000"
				}
				var opts2 = {
					asset:new Asset("USD",issuer_publicKey),
					limit:"1000000000"
				}
				var transaction = new StellarBase.TransactionBuilder(account)
															.addOperation(StellarBase.Operation.changeTrust(opts))
															.addOperation(StellarBase.Operation.changeTrust(opts2))
											        .build();

				var key = Keypair.fromSecret(sender_secret);
				transaction.sign(key);
				postTransaction(transaction).then((data) => {
					console.log("after change trust:",data)
					getFreeCoins(sender_public).then((data) => {
						console.log("after get coin: ",data)
						dispatch({
							type: INIT_BALANCE,
							data: data
						})
					})
				})
			})
		} else {
			var sender_public = localStorage.getItem("quanta_sender_publicKey")
			var sender_secret = localStorage.getItem("quanta_sender_secretKey")
			var issuer_public = localStorage.getItem("quanta_issuer_publicKey")
			return getBalance(sender_public).then((data) => {
				console.log("after get balance:",data)
				dispatch({
					type: INIT_BALANCE,
					data:data
				})
			})
		}
	}
}

export function buyTransaction(market, price, amount) {
	return function() {
		return qClient.submitOrder(0, market, price, amount)
			.then((e) => e.json()).then((e) => {
				console.log("ordered ", e);
				return e
			}).catch((e) => {
				console.log(e);
				throw e
			})
	} 
}

export function sellTransaction(market, price, amount) {
	return function() {
		return qClient.submitOrder(1, market, price, amount)
			.then((e) => e.json()).then((e) => {
				console.log("ordered ", e);
				return e
			}).catch((e) => {
				console.log(e);
				throw e
			})
	}
}

var initAPI = false;
var wsString = "ws://testnet-01.quantachain.io:8090";


export function switchTicker(ticker) {
	console.log("Switch ticker ", ticker);
	return function (dispatch) {

		if (initAPI == false) {
			Apis.instance(wsString, true).init_promise.then((res) => {
				console.log("connected to:", res[0].network);

				//Apis.instance().db_api().exec("set_subscribe_callback", [updateListener, true]);
				initAPI = true;
			}).then((e) => {
				action()
			});
		} else {
			action()
		}

		function action() {
			var base = "1.3.1"
			var counter = "1.3.0"
			Apis.instance().db_api().exec("list_assets", ["A", 100]).then((assets) => {
				console.log(assets);
				window.assets = lodash.keyBy(assets, "id")
			})

			Apis.instance().history_api().exec("get_fill_order_history", [base, counter, 100]).then((filled) => {
				console.log("history filled ", filled);
				filled.forEach((filled) => {
					var fill = new FillOrder(
						filled,
						window.assets,
						counter
					);
					console.log("normalized ", fill, fill.getPrice(), fill.fill_price.toReal());
				})
			})

			Apis.instance().db_api().exec("get_order_book", [base, counter, 50]).then((ob) => {
				console.log("ob  ", ob);
			})

			Apis.instance().db_api().exec("subscribe_to_market", [(data) => {
				console.log("Got a market change ", data);
			}, base, counter])
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
