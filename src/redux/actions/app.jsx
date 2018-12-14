import lodash from 'lodash';
import API from "../../api.jsx"
import SortedSet from 'js-sorted-set'
import QuantaClient from "@quantadex/quanta_js"
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

import StellarBase, {Keypair, Asset, Operation} from 'stellar-base'
StellarBase.Network.use(new StellarBase.Network("Test QuantaDex SDF Network ; June 2018"))

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
			}).catch((e) => {
				console.log(e);
			})
	} 
}

export function sellTransaction(market, price, amount) {
	return function() {
		return qClient.submitOrder(1, market, price, amount)
			.then((e) => e.json()).then((e) => {
				console.log("ordered ", e);
			}).catch((e) => {
				console.log(e);
			})
	}
}

// export function sellTransaction(publicKey,secretKey,issuerKey, qty, price) {
// 	return function(dispatch) {
// 		return getBalance(publicKey).then((data) => {
// 			var account=new StellarBase.Account(publicKey,data.seqnum.toString());
// 			var buying = new Asset("USD",issuerKey)
// 			var selling = new Asset("BTC",issuerKey)
// 			var opt3 = {
// 				buying: buying,
// 				selling: selling,
// 				amount: (1.0 * qty).toString(),
// 				price: (1.0 * price).toString()
// 			}
// 		    console.log("sellTransaction(" + publicKey + ", seq=" + data.seqnum.toString() + "): SELL " + qty + " @ " + price + " | " + opt3.amount + " @ " + opt3.price);
// 			var transaction = new StellarBase.TransactionBuilder(account)
// 				.addOperation(StellarBase.Operation.manageOffer(opt3))
// 				.build();
// 			var key = Keypair.fromSecret(secretKey);
// 			transaction.sign(key);
// 			postTransaction(transaction).then((data) => {
// 				console.log("after making one sell transaction: ",data)
// 				getMyOrders(publicKey).then((data) => {
// 					console.log("open orders: ", data)
// 					dispatch({
// 						type: UPDATE_OPEN_ORDERS,
// 						data:data
// 					})
// 				})
// 			})
// 		})
// 	}
// }

// var mockTransaction =  (publicKey,secretKey,issuerKey) => {
//
// 	getBalance(publicKey).then((data) => {
// 		var account=new StellarBase.Account(publicKey,data.seqnum.toString());
// 		var selling = new Asset("USD",issuerKey)
// 		var buying = new Asset("BTC",issuerKey)
// 		var opt3 = {
// 			selling: selling,
// 			buying: buying,
// 			amount: "2",
// 			price: {
// 				n:1,
// 				d:1
// 			},
// 		}
// 		var transaction = new StellarBase.TransactionBuilder(account)
// 			.addOperation(StellarBase.Operation.manageOffer(opt3))
// 			.build();
// 		var key = Keypair.fromSecret(secretKey);
// 		transaction.sign(key);
// 		postTransaction(transaction).then((data) => {
// 			console.log("after making one transaction: ",data)
// 			getBalance(sender_public).then((data) => {
// 				console.log("balance: ", data)
// 			})
// 			getOpenOrders(sender_public).then((data) => {
// 				console.log("open orders: ", data)
// 			})
// 		})
// 	})
// }
// mockTransaction(sender_public,sender_secret,issuer_public)

export function switchTicker(ticker) {
	console.log("Switch ticker ", ticker);
	return function (dispatch) {

		const orderBook = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/depth/"+ticker).then((res) => {return res.json()})
		const trades = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/settlement/"+ticker).then((res) => {return res.json()})
		const openOrders = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/status").then((res) => {return res.json()})

		return Promise.all([orderBook,trades,openOrders])
			.then((data) => {
				dispatch({
					type: INIT_DATA,
					data: {
						orderBook:data[0],
						trades:data[1],
						openOrders:data[2],
						ticker:ticker,
					}
				})

				var orderbookws = new EventSource('http://testnet-02.quantachain.io:7200/stream/depth/'+ticker);

				// Log errors
				orderbookws.onerror = function (error) {
				  console.log('EventSource Error ' + error);
				};

				// Log messages from the server
				orderbookws.onmessage = function (e) {
					dispatch({
						type: UPDATE_ORDER,
						data: e.data
					})
				};

				var tradesws = new WebSocket('ws://backend-dev.env.quantadex.com:8080/ws/v1/trades/BTC/USD');

				// Log errors
				tradesws.onerror = function (error) {
				  console.log('WebSocket Error ' + error);
				};

				// Log messages from the server
				tradesws.onmessage = function (e) {
					dispatch({
						type: UPDATE_TRADES,
						data: e.data
					})
				};
			})
	}

	// const [first, second] = ticker.split("/");
	//
	// return function (dispatch) {
	//     const base = new StellarSdk.Asset(first, "GBQWAJ7I7BKKGBBXX64HCIVQB6ENC5ZX44CTZ3VKMOU6HO5UN4ILNHI6");
  //       const counter = new StellarSdk.Asset(second, "GBQWAJ7I7BKKGBBXX64HCIVQB6ENC5ZX44CTZ3VKMOU6HO5UN4ILNHI6");
	//
  //       orderStream = server.orderbook(base, counter)
  //           .stream({
  //               onmessage: function (message) {
  //                   //console.log("ORDERBOOK ", message)
	//
  //                   dispatch({
  //                       type: UPDATE_ORDER,
  //                       data : message
  //                   })
  //               }
  //           })
	//
	// 	return Promise.all([API.open_trades(first, second), API.trade_history(), API.balance(), API.pending_trades(), API.pairs(), API.ticker()])
	// 		.then((data) => {
	// 			console.log("data ", data, first, second);
	// 			dispatch({
	// 				type: INIT_DATA,
	// 				data : {
	// 					ticker: ticker,
	// 					tradeBook: data[0],
	// 					tradeHistory: data[1],
	// 					balance: lodash.keyBy(data[2],'currency'),
	// 					openOrders: data[3],
	// 					markets: data[4],
	// 					tickers: data[5]
	// 				}
	// 			})
	//
	// 				streaming here/
	// 	});
	// }
}
