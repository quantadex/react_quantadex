import lodash from 'lodash';
import API from "../../api.jsx"
export const INIT_DATA = 'INIT_DATA';
export const APPEND_TRADE = 'APPEND_TRADE';
export const UPDATE_TICKER = 'UPDATE_TICKER';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const SET_AMOUNT = 'SET_AMOUNT';
export const UPDATE_USER_ORDER = 'UPDATE_USER_ORDER';

const StellarSdk = require('stellar-sdk')
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

let orderStream = null;

export function switchTicker(ticker) {
	console.log("Switch ticker ", ticker);
	const [first, second] = ticker.split("/");

	return function (dispatch) {
	    const base = new StellarSdk.Asset(first, "GBQWAJ7I7BKKGBBXX64HCIVQB6ENC5ZX44CTZ3VKMOU6HO5UN4ILNHI6");
        const counter = new StellarSdk.Asset(second, "GBQWAJ7I7BKKGBBXX64HCIVQB6ENC5ZX44CTZ3VKMOU6HO5UN4ILNHI6");

        orderStream = server.orderbook(base, counter)
            .stream({
                onmessage: function (message) {
                    //console.log("ORDERBOOK ", message)

                    dispatch({
                        type: UPDATE_ORDER,
                        data : message
                    })
                }
            })

		return Promise.all([API.open_trades(first, second), API.trade_history(), API.balance(), API.pending_trades(), API.pairs(), API.ticker()])
			.then((data) => {
				console.log("data ", data, first, second);
				dispatch({
					type: INIT_DATA,
					data : {
						ticker: ticker,
						tradeBook: data[0],
						tradeHistory: data[1],
						balance: lodash.keyBy(data[2],'currency'),
						openOrders: data[3],
						markets: data[4],
						tickers: data[5]
					}
				})
		});
	}
}