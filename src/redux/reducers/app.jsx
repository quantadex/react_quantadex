import { INIT_DATA, INIT_BALANCE, APPEND_TRADE, UPDATE_ORDER, UPDATE_OPEN_ORDERS, SET_AMOUNT, UPDATE_USER_ORDER, UPDATE_TICKER, UPDATE_TRADES, UPDATE_DIGITS } from "../actions/app.jsx";
import { TOGGLE_LEFT_PANEL, TOGGLE_RIGHT_PANEL } from "../actions/app.jsx";
import { TOGGLE_FAVORITE_LIST } from "../actions/app.jsx";
import { toggleFavoriteList } from "../actions/app.jsx";
import SortedSet from 'js-sorted-set'

import lodash from 'lodash'
import moment from 'moment'

let initialState = {
  currentTicker: 'BTC/USD',
  tradeHistory: [],
  tradeBook: { bids: [], asks: []},
  openOrders: [], markets: [],
  currentPrice: "",
  balance: {},
  ui: {
    leftOpen: true,
    rightOpen: true
  },
  mostRecentTrade: {
    price: ""
  },
  orderBook: {
    decimals: {
      allowedDecimals: ["8","7","6","5"],
      value: "8",
      maxTotalDecimals: "8"
    },
    spread: 0,
    spreadDollar:0,
    asks: {
      dataSource: new SortedSet({ comparator: function(a, b) { return parseFloat(JSON.parse(a).price) - parseFloat(JSON.parse(b).price); }}),

      columns: [{
        name:"Price BTC",
        key:"price",
        type:"number",
        sortable:false,
        color: (value) => {return "white"},
        fontSize:"base",
        fontWeight:"light",
        float:"left"
      },{
        name:"Amount BTC",
        key:"amount",
        type:"number",
        sortable:false,
        color: (value) => {return "red"},
        fontSize:"base",
        fontWeight:"light",
        float:"right"
      },{
        name:"Total BTC",
        key:"total",
        type:"number",
        sortable:false,
        color: (value) => {return "white"},
        fontSize:"base",
        fontWeight:"light",
        float:"right"
      }]
    },
    bids: {
      dataSource: new SortedSet({ comparator: function(a, b) { return parseFloat(JSON.parse(b).price) - parseFloat(JSON.parse(a).price); }}),

      columns: [{
        name:"Price BTC",
        key:"price",
        type:"number",
        sortable:false,
        color: (value) => {return "white"},
        fontSize:"base",
        fontWeight:"light",
        float:"left"
      },{
        name:"Amount BTC",
        key:"amount",
        type:"number",
        sortable:false,
        color: (value) => {return "theme"},
        fontSize:"base",
        fontWeight:"light",
        float:"right"
      },{
        name:"Total BTC",
        key:"total",
        type:"number",
        sortable:false,
        color: (value) => {return "white"},
        fontSize:"base",
        fontWeight:"light",
        float:"right"
      }]
    }
  },
  dashboard: {
    dataSource: [{
      pair: "ENG",
      price: "0.00038789",
      percentage: "33.26",
      volume: "346788",
      favoriteList:false
    },{
      pair: "LSK",
      price: "0.0031460",
      percentage: "30.06",
      volume: "346788",
      favoriteList:true
    },{
      pair: "BTC",
      price: "0.002990",
      percentage: "23.66",
      volume: "346788",
      favoriteList:true
    },{
      pair: "BTG",
      price: "0.014553",
      percentage: "22.1",
      volume: "346788",
      favoriteList:false
    },{
      pair: "XLM",
      price: "0.000123",
      percentage: "12",
      volume: "346788",
      favoriteList:false
    },{
      pair: "SNT",
      price: "0.000123",
      percentage: "134",
      volume: "346788",
      favoriteList:true
    },{
      pair: "SNT",
      price: "0.000123",
      percentage: "-67.34",
      volume: "346788",
      favoriteList:false
    },{
      pair: "NULS",
      price: "0.000123",
      percentage: "24",
      volume: "346788",
      favoriteList:false
    },{
      pair: "MOD",
      price: "0.00038789",
      percentage: "33.26",
      volume: "346788",
      favoriteList:false
    },{
      pair: "VEN",
      price: "0.00038789",
      percentage: "33.26",
      volume: "346788",
      favoriteList:false
    },{
      pair: "MOD",
      price: "0.00038789",
      percentage: "33.26",
      volume: "346788",
      favoriteList:false
    }],
    columns: [{
      name:"",
      type:"icon",
      key: "favoriteList",
      favoritedIconUrl: "/public/images/star-white.svg",
      unfavoritedIconUrl: "/public/images/star-grey.svg",
      handleClick: pair => {
        return toggleFavoriteList(pair)
      }
    },{
      name:"Pair",
      key:"pair",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"regular",
      float:"left"
    },{
      name:"Price BTC",
      key:"price",
      type:"number",
      sortable:false,
      color: (value) => {return "white72"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"24hr,%",
      key:"percentage",
      type:"number",
      sortable:false,
      color: (value) => {return parseFloat(value) > 0 ? "theme" : "red"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"Volume",
      key:"volume",
      type:"number",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    }]
  },
  trades: {
    dataSource: [],
    columns: [{
      name:"Price BTC",
      key:"price",
      type:"number",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"left"
    },{
      name:"Amount",
      key:"amount",
      type:"number",
      sortable:false,
      color: (value) => {return "theme"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"Date",
      key:"date",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"Time",
      key:"time",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    }]
  }
}

initialState.favoriteList = {
  ...initialState.dashboard,
  dataSource: initialState.dashboard.dataSource.filter((item) => {
    item.favoriteList
  })
}

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

      var asksSortedSet = state.orderBook.asks.dataSource
      action.data.orderBook.asks.map((ask) => {
        if (ask[0] != 0.0) {
          asksSortedSet.insert(JSON.stringify({
            price: ask[1],
            amount: ask[0],
            total: parseFloat(ask[1]) * parseFloat(ask[0])
          }))
        }
      })

      var bidsSortedSet = state.orderBook.bids.dataSource
      action.data.orderBook.bids.map((bid) => {
        if (bid[0] != 0.0) {
          bidsSortedSet.insert(JSON.stringify({
            price: bid[1],
            amount: bid[0],
            total: parseFloat(bid[1]) * parseFloat(bid[0])
          }))
        }
      })

      const tradesDataSource = action.data.trades.trades.map((trade) => {
        return {
          price: trade.price,
          amount: trade.amount,
          date: moment(trade.time * 1000).format('DD MMM'),
          time:moment(trade.time * 1000).format("HH:mm:ss")
        }
      })

      var spread = 0
      var spreadDollar = 0
      if (asksSortedSet.beginIterator().value() && bidsSortedSet.beginIterator().value()) {
        spread = Math.abs((parseFloat(JSON.parse(asksSortedSet.beginIterator().value()).price)/parseFloat(JSON.parse(bidsSortedSet.beginIterator().value()).price) - 1)*100)
        spreadDollar = Math.abs(parseFloat(JSON.parse(asksSortedSet.beginIterator().value()).price) - parseFloat(JSON.parse(bidsSortedSet.beginIterator().value()).price))
      }

      return {
        ...state,
        currentTicker:action.data.ticker,
        openOrders:action.data.openOrders.orders,
        orderBook: {
          ...state.orderBook,
          spread: spread,
          spreadDollar: spreadDollar,
          asks: {
            ...state.orderBook.asks,
            dataSource:asksSortedSet
          },
          bids: {
            ...state.orderBook.bids,
            dataSource:bidsSortedSet
          }
        },
        trades: {
          ...state.trades,
          dataSource: tradesDataSource
        }
        // ticker: action.data.ticker,
        // base: action.data.ticker.split("/")[0],
        // counter: action.data.ticker.split("/")[1],
        // tradeHistory: action.data.tradeHistory,
        // tradeBook: action.data.tradeBook,
        // currentPrice: currentPrice,
        // balance: action.data.balance,
        // inputSell: currentPrice,
        // inputBuy: currentPrice,
        // openOrders: action.data.openOrders,
        // markets: mergeTickerData(action.data.markets, action.data.tickers)
      }

    case INIT_BALANCE:
      return {

        ...state,
        balance: lodash.keyBy(action.data.balances,'currency')
      }

    case UPDATE_OPEN_ORDERS:
      return {
        ...state,
        openOrders: action.data.orders
      }

    case UPDATE_TRADES:

      const trade = JSON.parse(action.data).message
      return {
        ...state,
        mostRecentTrade: {
          ...state.mostRecentTrade,
          price:trade.price,
        },
        trades: {
          ...state.trades,
          dataSource: [
            {
              price: trade.price,
              amount: trade.amount,
              date: moment(trade.time * 1000).format('DD MMM'),
              time:moment(trade.time * 1000).format("HH:mm:ss")
            },
            ...state.trades.dataSource
          ]
        }
      }

    case UPDATE_DIGITS:
      return {
        ...state,
        orderBook: {
          ...state.orderBook,
          decimals: {
            ...state.orderBook.decimals,
            value:action.value
          }
        }
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
      try {
        const rec = JSON.parse(action.data).message // new asks and bids
        var asksSortedSet = state.orderBook.asks.dataSource // asks on list
        const rec_asks = rec.asks // new asks
        rec_asks.forEach((item) => {
          if (parseFloat(item[0]) == 0.0) {
            var asksIterator = asksSortedSet.beginIterator()
            while (asksIterator.value() !== null) {
              if (parseFloat(JSON.parse(asksIterator.value()).price) == parseFloat(item[1])) {
                asksSortedSet.remove(asksIterator.value())
                break
              }
              asksIterator = asksIterator.next()
            }
          } else {
            asksSortedSet.insert(JSON.stringify({
              price: item[1],
              amount: item[0],
              total: parseFloat(item[1]) * parseFloat(item[0])
            }))
          }
        })

        var bidsSortedSet = state.orderBook.bids.dataSource
        const rec_bids = rec.bids
        rec_bids.forEach((item) => {
          if (parseFloat(item[0]) == 0.0) {
            var bidsIterator = bidsSortedSet.beginIterator()
            while (bidsIterator.value() !== null) {
              if (parseFloat(JSON.parse(bidsIterator.value()).price) == parseFloat(item[1])) {
                bidsSortedSet.remove(bidsIterator.value())
                break
              }
              bidsIterator = bidsIterator.next()
            }
          } else {
            bidsSortedSet.insert(JSON.stringify({
              price: item[1],
              amount: item[0],
              total: parseFloat(item[1]) * parseFloat(item[0])
            }))
          }
        })
        var spread = 0;
        var spreadDollar = 0;
        if (asksSortedSet.beginIterator().value() && bidsSortedSet.beginIterator().value()) {
          spread = Math.abs((parseFloat(JSON.parse(asksSortedSet.beginIterator().value()).price)/parseFloat(JSON.parse(bidsSortedSet.beginIterator().value()).price) - 1)*100)
          spreadDollar = Math.abs(parseFloat(JSON.parse(asksSortedSet.beginIterator().value()).price) - parseFloat(JSON.parse(bidsSortedSet.beginIterator().value()).price))
        }

        return {
          ...state,
          orderBook: {
            ...state.orderBook,
            spread: spread,
            spreadDollar: spreadDollar,
            bids: {
              ...state.orderBook.bids,
              dataSource:bidsSortedSet
            },
            asks: {
              ...state.orderBook.asks,
              dataSource:asksSortedSet
            }
          }
        }
      } catch(e) {
        console.log("error",e)
      }

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
    case TOGGLE_LEFT_PANEL:
      return {
        ...state,
        ui: {
          ...state.ui,
          leftOpen: !state.ui.leftOpen,
        }
      }

    case TOGGLE_RIGHT_PANEL:
      return {
        ...state,
        ui: {
          ...state.ui,
          rightOpen: !state.ui.rightOpen
        }
      }
    case TOGGLE_FAVORITE_LIST:
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          dataSource: state.dashboard.dataSource.map((item) => {
            if (item.pair == action.pair) {
              item.favoriteList = !item.favoriteList
            }

            return item

          })
        }
      }
    default:
      return state
  }
}

export default app
