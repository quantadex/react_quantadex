import { INIT_DATA, APPEND_TRADE, UPDATE_ORDER,SET_AMOUNT, UPDATE_USER_ORDER, UPDATE_TICKER } from "../actions/app.jsx";
import lodash from 'lodash';

let initialState = { currentTicker: 'BTC/USD', tradeHistory: [], tradeBook: { bids: [], asks: []}, openOrders: [], markets: [], currentPrice: "", balance: {} }


function mergeTickerData(current, data) {
  const lookup = lodash.keyBy(data, "ticker");
  return current.map((e) => {
    if (e.ticker in lookup) {
      return Object.assign({}, e, lookup[e.ticker]);
    }
    return e;
  });
}

const app = (state = initialState, action) => {
  //console.log("Reduce ", action);

  switch (action.type) {
    case INIT_DATA:
      //console.log("Merge? ", mergeTickerData(action.data.markets, action.data.tickers));

      const currentPrice = action.data.tradeHistory[0].price;
      return { 
        ...state,
        ticker: action.data.ticker,
        base: action.data.ticker.split("/")[0],
        counter: action.data.ticker.split("/")[1],        
        tradeHistory: action.data.tradeHistory,
        tradeBook: action.data.tradeBook,
        currentPrice: currentPrice,
        balance: action.data.balance,
        inputSell: currentPrice,
        inputBuy: currentPrice,
        openOrders: action.data.openOrders,
        markets: mergeTickerData(action.data.markets, action.data.tickers)
      }
    case UPDATE_TICKER: 
      //console.log("TICKER ",  action.data);    
      return {
        ...state,
        markets: mergeTickerData(state.markets, action.data)
      }
    case APPEND_TRADE: 
      return {
        ...state,
        tradeHistory: [{amount: action.data.amount, price: action.data.price, created: action.data.time * 1000}, ...state.tradeHistory].slice(0,20),
        currentPrice: action.data.price
      }
    case SET_AMOUNT: 
      return {
        ...state,
        ...lodash.pick(action.data, ['inputBuy', 'inputSell', 'inputBuyAmount', 'inputSellAmount'])
      }
    case UPDATE_USER_ORDER: 
      //console.log("update user ", action.data)
      return {
        ...state,
        openOrders: action.data.orders,
        balance: lodash.keyBy(action.data.balance,'currency')
      }
    case UPDATE_ORDER:
      //console.log("UPDATE_ORDER ", action.data);
      // let bidByPrice = lodash.keyBy(state.tradeBook.bids, "price")
      // let askByPrice = lodash.keyBy(state.tradeBook.asks, "price")
      //
      // const rec = action.data;
      // if (rec.is_bid) {
      //   if (parseFloat(rec.amount) == 0.0 ) {
      //     delete bidByPrice[rec.price];
      //   } else {
      //     bidByPrice[rec.price] = rec;
      //   }
      // } else {
      //   if (parseFloat(rec.amount) == 0.0 ) {
      //     delete askByPrice[rec.price];
      //   } else {
      //     askByPrice[rec.price] = rec;
      //   }
      // }
      //
      // const finalBids = lodash.orderBy(lodash.values(bidByPrice), "price", ['desc'])
      // const finalAsks = lodash.orderBy(lodash.values(askByPrice), "price")

      // console.log(rec, finalBids, finalAsks)
      return {
        ...state,
        tradeBook: {
          bids: action.data.bids,
          asks: action.data.asks
        }
      }
    default:
      return state
  }
}

export default app