import lodash from 'lodash';
import API from "../../api.jsx"
import SortedSet from 'js-sorted-set'
import QuantaClient from "@quantadex/quanta_js"
import { Apis } from "@quantadex/bitsharesjs-ws";
import { Price, Asset, FillOrder, LimitOrderCreate } from "../../common/MarketClasses";
import { PrivateKey, PublicKey, Aes, key } from "@quantadex/bitsharesjs";
import { createLimitOrder2, signAndBroadcast } from "../../common/Transactions";

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
	return (dispatch, getState) => {
		var base = "1.3.1"
		var counter = "1.3.0"
		var user_id = "1.2.8";

		const pKey = PrivateKey.fromWif(getState().app.private_key);
		console.log(pKey, assets[base]);
		const priceObj = new Price({ 
			base: new Asset({
					asset_id: assets[base].id,
					precision: assets[base].precision
			}),
			quote: new Asset({
				asset_id: assets[counter].id,
				precision: assets[counter].precision
			})
		})

		priceObj.setPriceFromReal(price)
		const sellAmount = priceObj.base.clone()
		sellAmount.setAmount({real: parseFloat(amount)});

		console.log("priceObj", priceObj, amount, sellAmount);

		const order = new LimitOrderCreate({
			for_sale: sellAmount.times(priceObj),
			expiration: null,
			to_receive: sellAmount,
			seller: user_id,
			fee: {
				asset_id: "1.3.0",
				amount: 0
			}
		});
		console.log("order prepare", order);
		const tr = createLimitOrder2(order)
		return signAndBroadcast(tr, pKey)
			.then((e) => {
				console.log("order result ", e);
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

			const trades = Apis.instance().history_api().exec("get_fill_order_history", [base, counter, 100]).then((filled) => {
				console.log("history filled ", filled);
				var trade_history = [];
				filled.forEach((filled) => {
					var fill = new FillOrder(
						filled,
						window.assets,
						counter
					);
					console.log("normalized ", fill, fill.getPrice(), fill.fill_price.toReal());
					trade_history.push(fill)
				})
				return trade_history
			})

			const orderBook = Apis.instance().db_api().exec("get_order_book", [base, counter, 50]).then((ob) => {
				console.log("ob  ", ob);
				return ob
			})

			Apis.instance().db_api().exec("subscribe_to_market", [(data) => {
				console.log("Got a market change ", data);
			}, base, counter])

			return Promise.all([orderBook,trades])
			.then((data) => {
				dispatch({
					type: INIT_DATA,
					data: {
						orderBook:data[0],
						trades:data[1],
					}
				})
			})


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
