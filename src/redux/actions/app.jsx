import lodash from 'lodash';
import API from "../../api.jsx"
import SortedSet from 'js-sorted-set'
import QuantaClient from "@quantadex/quanta_js"
import { Apis } from "@quantadex/bitsharesjs-ws";
import { Price, Asset, FillOrder, LimitOrderCreate, LimitOrder } from "../../common/MarketClasses";
import { PrivateKey, PublicKey, Aes, key, ChainStore } from "@quantadex/bitsharesjs";
import { createLimitOrderWithPrice, createLimitOrder2, cancelOrder, signAndBroadcast } from "../../common/Transactions";
import { aggregateOrderBook } from "../../common/PriceData";

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

export const TOGGLE_LEFT_PANEL = 'TOGGLE_LEFT_PANEL';
export const TOGGLE_RIGHT_PANEL = 'TOGGLE_RIGHT_PANEL';

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
		console.log(pKey, assets[base.id], price, amount, user_id);

		const order = createLimitOrderWithPrice(user_id, true, window.assets, base.id, counter.id, price, amount)

		console.log("order prepare", order);
		const tr = createLimitOrder2(order)
		return signAndBroadcast(tr, pKey)
			.then((e) => {
				console.log("order result ", e);
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
		console.log(pKey, assets[base.id], user_id);

		const order = createLimitOrderWithPrice(user_id, false, window.assets, base.id, counter.id, price, amount)

		console.log("order prepare", order);
		const tr = createLimitOrder2(order)
		return signAndBroadcast(tr, pKey)
			.then((e) => {
				console.log("order result ", e);
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
		console.log(pKey, assets[base.id], user_id);
	
		const order = cancelOrder(user_id, order_id)
	
		console.log("cancel order", order);
		return signAndBroadcast(order, pKey)
			.then((e) => {
				console.log("order result ", e);
			})
	}
}

var initAPI = false;
var wsString = "ws://testnet-01.quantachain.io:8090";

function updateChainState(state) {
	// console.log("updateChainState", state);
	// var c = ChainStore.getAccountRefsOfKey("QA6nkaBAz1vV6cb25vSHXJqHos1AeADzqRAXPvtASXMAhM3SbRFA");
	// console.log(c);
	// if (c){
	// 	c.forEach(chain_account_id => {
	// 		console.log(chain_account_id);
	// 		ChainStore.getAccount(chain_account_id);
	// 	})
	// }
}

function onUpdate(e) {
	console.log('update',e)
}

export function switchTicker(ticker) {
	console.log("Switch ticker ", ticker);

	return function (dispatch,getState) {
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		const publicKey = pKey.toPublicKey().toString()

		if (initAPI == false) {
			Apis.instance(wsString, true, 3000, { enableOrders: true }).init_promise.then((res) => {
				console.log("connected to:", res[0].network, publicKey);

				Apis.instance().db_api().exec("set_subscribe_callback", [onUpdate, true]);
				initAPI = true;				
			})
			.then((e) => {
				return Promise.all([Apis.instance()
					.db_api()
					.exec("get_key_references", [[publicKey]])
					.then(vec_account_id => {
						console.log("get_key_references ", vec_account_id[0][0]);

						Apis.instance()
							.db_api()
							.exec("get_objects", [[vec_account_id[0][0]]])
							.then((data) => {
								console.log("get account ", data);
								dispatch({
									type: UPDATE_ACCOUNT,
									data: data[0]
								})
							})

					}), Apis.instance().db_api().exec("list_assets", ["A", 100]).then((assets) => {
						console.log("assets ", assets);
						window.assets = lodash.keyBy(assets, "id")
						window.assetsBySymbol = lodash.keyBy(assets, "symbol")
						return assets;
					})]);
			})
			.then((e) => {
				return fetch("https://s3.amazonaws.com/quantachain.io/markets.json").then(e=> e.json())
					.then(async (e) => {
					markets = e;
					var marketData = [];
					console.log("json ", markets.markets);

					for (const market of markets.markets) {
						var { base, counter } = getBaseCounter(market.name);
						const data = await Promise.all([Apis.instance()
							.db_api()
							.exec("get_ticker", [base.id, counter.id]),
							Apis.instance()
								.db_api()
								.exec("get_24_volume", [base.id, counter.id])])
						
						marketData.push({
							name: market.name,
							last: data[0].latest,
							base_volume: data[1].base_volume,
							quote_volume: data[1].quote_volume
						})						
					}

					console.log("market data ", marketData);

					dispatch({
						type: SET_MARKET_QUOTE,
						data: marketData
					})

				})
			})
			.then((e) => {
				action()
			});
		} else {
			action()
		}

		function action() {
			dispatch({
				type: UPDATE_TICKER,
				data: ticker
			})
			var {base, counter} = getBaseCounter(getState().app.currentTicker)
			// console.log('????????????????', base, counter)

			function fetchData() {
				var {base, counter} = getBaseCounter(getState().app.currentTicker)
				// console.log('!!!!!!!!!!!!!!!!!', ticker, base, counter)
				const trades = Apis.instance().history_api().exec("get_fill_order_history", [base.id, counter.id, 100]).then((filled) => {
					// console.log("history filled ", filled);
					var trade_history = [];
					filled.forEach((filled) => {
						var fill = new FillOrder(
							filled,
							window.assets,
							counter.id
						);
						// console.log("normalized ", filled, fill, fill.getPrice(), fill.fill_price.toReal());
						trade_history.push(fill)
					})
					return trade_history
				})
	
				const orderBook = Apis.instance().db_api().exec("get_order_book", [base.id, counter.id, 50]).then((ob) => {
					console.log("ob  ", ob);
					return aggregateOrderBook(ob.bids, ob.asks, window.assets[base.id].precision)
				})
	
				const account_data = Apis.instance()
					.db_api()
					.exec("get_full_accounts", [[getState().app.userId], true])
					.then(results => {
						var orders = [];
						results[0][1].limit_orders.forEach((ordered) => {
							var order = new LimitOrder(
								ordered,
								window.assets,
								counter.id
							);
							orders.push(order)
						})
						return [results, orders]
					});

				return Promise.all([orderBook,trades,account_data])
				.then((data) => {
					dispatch({
						type: INIT_DATA,
						data: {
							orderBook:data[0],
							trades:data[1],
							openOrders:data[2][1],
							ticker:ticker,
							accountData: data[2][0]
						}
					})
				})
			}

			Apis.instance().db_api().exec("subscribe_to_market", [(data) => {
				console.log("Got a market change ", data, base, counter);
				fetchData()
			}, base.id, counter.id])

			Apis.instance()
				.orders_api()
				.exec("get_grouped_limit_orders", [
					base.id,
					counter.id,
					10,
					null,
					50
				]).then((limitorders) => {
					// const user_orders = limitorders.filter((order) => order.seller === user_id)
					console.log("get_grouped_limit_orders  ", limitorders);
				})

			fetchData()

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
