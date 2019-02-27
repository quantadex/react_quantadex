import { INIT_DATA, INIT_BALANCE, SET_MARKET_QUOTE, APPEND_TRADE, UPDATE_ORDER, UPDATE_OPEN_ORDERS, SET_AMOUNT, UPDATE_USER_ORDER, UPDATE_TICKER, UPDATE_TRADES, UPDATE_FEE, UPDATE_DIGITS, UPDATE_NETWORK, LOAD_FILLED_ORDERS } from "../actions/app.jsx";
import { TOGGLE_LEFT_PANEL, TOGGLE_RIGHT_PANEL } from "../actions/app.jsx";
import { TOGGLE_FAVORITE_LIST, UPDATE_ACCOUNT, UPDATE_BLOCK_INFO } from "../actions/app.jsx";
import { LOGIN } from "../actions/app.jsx";
import { dataSize } from "../actions/app.jsx";
import SortedSet from 'js-sorted-set'

import lodash from 'lodash'
import moment from 'moment'

let initialState = {
  network: "TESTNET",
  private_key: null,
  publicKey: "",
  currentTicker: 'ETH/USD',
  fee: {},
  tradeHistory: [],
  tradeBook: { bids: [], asks: []},
  markets: [],
  currentPrice: undefined,
  balance: [],
  ui: {
    leftOpen: true,
    rightOpen: true
  },
  mostRecentTrade: {
    price: undefined
  },
  openOrders: {
    dataSource: [],
    columns: [{
      name:"PAIR",
      key:"assets",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"left"
    },{
      name:"ID",
      key:"id",
      type:"id",
      sortable:false,
      color: (value) => {return "theme"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"PRICE",
      key:"price",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"AMOUNT",
      key:"amount",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"TOTAL",
      key:"total",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"TYPE",
      key:"type",
      type:"string",
      sortable:false,
      color: (value) => {return value == "BUY" ? "theme" : "red"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"DATE",
      key:"date",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"",
      key:"cancel",
      type:"cancel",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    }]
  },
  filledOrders: {
    dataSource: [],
    dataSource2: [],
    columns: [{
      name:"PAIR",
      key:"assets",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"left"
    },{
      name:"ID",
      key:"id",
      type:"id",
      sortable:false,
      color: (value) => {return "theme"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"PRICE",
      key:"price",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"AMOUNT",
      key:"amount",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"TOTAL",
      key:"total",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"TYPE",
      key:"type",
      type:"string",
      sortable:false,
      color: (value) => {return value == "BUY" ? "theme" : "red"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"MAKER",
      key:"maker",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small text-capitalize",
      fontWeight:"light",
      float:"center"
    },{
      name:"STATUS",
      key:"status",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"center"
    },{
      name:"DATE",
      key:"date",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    }]
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
      dataSource: new SortedSet({ comparator: function(a, b) { return parseFloat(a.price) - parseFloat(b.price); }}),

      columns: [{
        name: (ticker) => {return "Price " + ticker.split('/')[1].substr(0,3)},
        key:"price",
        type:"number",
        sortable:false,
        color: (value) => {return "white"},
        fontSize:"base",
        fontWeight:"light",
        float:"left"
      },{
        name:"Amount",
        key:"amount",
        type:"number",
        sortable:false,
        color: (value) => {return "red"},
        fontSize:"base",
        fontWeight:"light",
        float:"right"
      },{
        name: (ticker) => {return "Total " + ticker.split('/')[1].substr(0,3)},
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
      dataSource: new SortedSet({ comparator: function(a, b) { return parseFloat(b.price) - parseFloat(a.price); }}),

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
    dataSource: [],
    columns: [
    //   {
    //   name:"",
    //   type:"icon",
    //   key: "favoriteList",
    //   favoritedIconUrl: "/public/images/star-white.svg",
    //   unfavoritedIconUrl: "/public/images/star-grey.svg",
    //   handleClick: pair => {
    //     return toggleFavoriteList(pair)
    //   }
    // },
    {
      name:"Pairs",
      key:"pairs",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"regular",
      float:"left"
    },{
      name:"Price",
      key:"price",
      type:"number",
      sortable:false,
      color: (value) => {return "white72"},
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
      name:"Price",
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
      color: (value) => {return value == 0 ? "theme" : "red"},
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

function processFilledOrder(orders) {
  const data = orders.map((order) => {
    var tickerPair, ticker, amount, total

    if (order.seller) {
      tickerPair = [order.assets[order.sell_price.base.asset_id].symbol, order.assets[order.sell_price.quote.asset_id].symbol]
      ticker = order.isBid() ? tickerPair.reverse() : tickerPair
      order.time = new Date(order.order.time + 'z')
      amount = order.isBid() ? order.sell_price.quote.getAmount({ real: true }) : order.sell_price.base.getAmount({ real: true });
      total = ((order.getPrice() * Math.pow(10, 6)) * (amount * Math.pow(10, 6)))/Math.pow(10, 12)
      order.isBid = order.isBid()
    } else {
      tickerPair = [order.assets[order.fill_price.base.asset_id].symbol, order.assets[order.fill_price.quote.asset_id].symbol]
      ticker = order.is_maker ? tickerPair : tickerPair.reverse()
      ticker = order.isBid ? ticker.reverse() : ticker
      order.id = order.order_id
      amount = parseFloat(order.amountToReceive());
      total = ((order.getPrice() * Math.pow(10, 6)) * (amount * Math.pow(10, 6)))/Math.pow(10, 12)
    }
    
    return {
      id: order.id,
      assets: ticker.join('/'),
      price: order.getPrice() + ' ' + ticker[1],
      amount: parseFloat(amount) + ' ' + ticker[0],
      total: total + ' ' + ticker[1],
      maker: order.seller ? "-" : String(order.is_maker),
      type: order.isBid ? 'BUY' : 'SELL',
      date: order.time.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }),
      block: order.block,
      status: order.seller ? "Canceled" : "Filled"
    }
  })

  return data
}

const app = (state = initialState, action) => {
  //console.log("Reduce ", action);

  switch (action.type) {
    case INIT_DATA:
      //console.log("Merge? ", mergeTickerData(action.data.markets, action.data.tickers));
      var maxAsk = 0
      var asksSortedSet = state.orderBook.asks.dataSource
      asksSortedSet.clear()
      action.data.orderBook.asks.map((ask) => {
        try {
          let total = parseFloat(ask.price) * parseFloat(ask.quote)
          asksSortedSet.insert({
            price: ask.price,
            amount: ask.quote,
            total: total
          })
          maxAsk = Math.max(maxAsk, total)
        } catch(e) {
          console.log(e)
        }
      })

      var maxBid = 0
      var bidsSortedSet = state.orderBook.bids.dataSource
      bidsSortedSet.clear()
      action.data.orderBook.bids.map((bid) => {          
        try {
            let total = parseFloat(bid.price) * parseFloat(bid.quote)
            bidsSortedSet.insert({
              price: bid.price,
              amount: bid.quote,
              total: total
            })
            maxBid = Math.max(maxBid, total)
          } catch(e) {
            console.log(e)
          }
      })
      
      var maxTrade = 0
      var lastTradePrice = undefined
      const tradesDataSource = action.data.trades.map((trade) => {
        if (lastTradePrice === undefined) {
          lastTradePrice = trade.getPrice()
        }
        let amount = parseFloat(trade.amountToReceive().replace(/,/g, ""))
        let total = trade.getPrice() * amount
        maxTrade = Math.max(maxTrade, total)

        return {
          id: trade.id,
          price: trade.getPrice(),
          amount: amount,
          total: total,
          color_key: trade.isBid ? 0 : 1,
          date: moment(trade.time || "").utc().format('DD MMM'),
          time: moment(trade.time || "").utc().format("HH:mm:ss")
        }
      })
      
      var spread = undefined
      var spreadDollar = 0
      if (asksSortedSet.beginIterator().value() && bidsSortedSet.beginIterator().value()) {
        spread = Math.abs((parseFloat(asksSortedSet.beginIterator().value().price)/parseFloat(bidsSortedSet.beginIterator().value().price) - 1)*100)
        spreadDollar = Math.abs(parseFloat(asksSortedSet.beginIterator().value().price) - parseFloat(bidsSortedSet.beginIterator().value().price)).toFixed(7)
      }

      const onOrdersFund = {}
      
      const limitOrdersDataSource = action.data.openOrders.map((order) => {
        const tickerPair = [order.assets[order.sell_price.base.asset_id].symbol, order.assets[order.sell_price.quote.asset_id].symbol]
        const ticker = order.isBid() ? tickerPair.reverse() : tickerPair
        
        const amount = order.isBid() ?
          (order.amountToReceive()).getAmount({ real: true }) :
          (order.amountForSale()).getAmount({ real: true });
        
        const total = ((order.getPrice() * Math.pow(10, 6)) * (amount * Math.pow(10, 6)))/Math.pow(10, 12)

        let onOrderFeeAsset = order.order.deferred_paid_fee.asset_id
        let onOrderFeeValue = order.fee / Math.pow(10, window.assets[onOrderFeeAsset].precision)
        let onOrderAsset = order.sell_price.base.asset_id
        let onOrderValue = order.isBid() ? total : amount
        
        onOrdersFund[onOrderFeeAsset] = (onOrdersFund[onOrderFeeAsset] || 0) + onOrderFeeValue
        onOrdersFund[onOrderAsset] = (onOrdersFund[onOrderAsset] || 0) + onOrderValue
        
        return {
          assets: ticker.join('/'),
          price: order.getPrice() + ' ' + ticker[1],
          amount: amount + ' ' + ticker[0],
          total: total + ' ' + ticker[1],
          type: order.isBid() ? 'BUY' : 'SELL',
          date: (new Date(order.expiration.setFullYear(order.expiration.getFullYear() - 5))).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }),
          id: order.id
        }
      })
      
      const filledOrdersDataSource = processFilledOrder(action.data.filledOrders)
      
      var total_fund_value = 0
      const balances = action.data.accountData.length > 0 && action.data.accountData[0][1].balances.map((balance => {
        const real_balance = balance.balance / (10 ** window.assets[balance.asset_type].precision)
        const usd = state.usd_value[balance.asset_type] ? (real_balance + (onOrdersFund[balance.asset_type] || 0)) * state.usd_value[balance.asset_type] : 0
        total_fund_value += usd
        return {
          asset: balance.asset_type,
          balance: real_balance,
          usd: usd
        }
      }))

      return {
        ...state,
        // currentTicker:action.data.ticker,
        balance: balances,
        onOrdersFund: onOrdersFund,
        totalFundValue: total_fund_value,
        mostRecentTrade: {
          ticker: action.data.ticker,
          price: lastTradePrice
        },
        openOrders: {
          ...state.openOrders,
          dataSource: limitOrdersDataSource
        }, 
        filledOrders: {
          ...state.filledOrders,
          dataSource: filledOrdersDataSource
        },
        orderBook: {
          ...state.orderBook,
          spread: spread,
          spreadDollar: spreadDollar,
          asks: {
            ...state.orderBook.asks,
            dataSource:asksSortedSet,
            max: maxAsk
          },
          bids: {
            ...state.orderBook.bids,
            dataSource:bidsSortedSet,
            max: maxBid
          }
        },
        trades: {
          ...state.trades,
          dataSource: tradesDataSource,
          max: maxTrade
        }
      }

    case LOAD_FILLED_ORDERS:
      const filledOrdersDataSource2 = processFilledOrder(action.data, state.userId)
      const end = filledOrdersDataSource2.length < dataSize
      return {
        ...state,
        filledOrders: {
          ...state.filledOrders,
          dataSource2: state.filledOrders.dataSource2.concat(filledOrdersDataSource2),
          end: end
        },
      }

    case INIT_BALANCE:
      return {

        ...state,
        balance: lodash.keyBy(action.data.balances,'currency')
      }
    
    case UPDATE_NETWORK:
      return {
        ...state,
        network: action.data
    }

    case UPDATE_FEE:
      let asset = window.assets[action.data.asset_id]
      let amount = action.data.amount/Math.pow(10, asset.precision)
      let symbol = asset.symbol
      return {
        ...state,
        fee: {amount: amount, symbol: symbol}
    }

    case SET_MARKET_QUOTE:
      return {
        ...state,
        markets: action.data[0],
        usd_value: action.data[1]
      }

    case LOGIN:
      return {
        ...state,
        private_key: action.private_key
      }
    case UPDATE_ACCOUNT: 
      return {
        ...state,
        userId: action.data.id,
        name: action.data.name,
        publicKey: action.data.owner.key_auths[0][0]
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
              date: moment(trade.SettledAt * 1000).format('DD MMM'),
              time: moment(trade.SettledAt * 1000).format("HH:mm:ss")
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
    case UPDATE_BLOCK_INFO: {
      return {
        ...state,
        blockInfo: action.data
      }
    }
    
    case UPDATE_TICKER:
      // console.log("TICKER ",  action.data);
      return {
        ...state,
        currentTicker:action.data,
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
        ...lodash.pick(action.data, ['inputBuy', 'inputSell', 'inputBuyAmount', 'inputSellAmount', 'inputSide', 'setTime'])
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
        const rec = JSON.parse(action.data) // new asks and bids
        var asksSortedSet = state.orderBook.asks.dataSource // asks on list
        var bidsSortedSet = state.orderBook.bids.dataSource

        const updateLevel = function(recs, orderSet) {
          recs.forEach((item) => {
            const amount = item[0];
            const price = item[1];
            const it = orderSet.findIterator({ price: price })

            if (parseFloat(item[0]) == 0.0) {
              // console.log("iter ", it, item[1]);
              if (it.node != null) {
                orderSet.remove(it.node.value)
              }
            } else {
              try {
                if (it.node) {
                  it.node.value.amount = amount;
                } else {
                  orderSet.insert({
                    price: price,
                    amount: amount,
                    total: parseFloat(price) * parseFloat(amount)
                  })
                }
              } catch (e) {
                console.log(e)
              }
            }
          })
        }

        updateLevel(rec.asks, asksSortedSet);
        updateLevel(rec.bids, bidsSortedSet);

        var spread = 0;
        var spreadDollar = 0;
        if (asksSortedSet.beginIterator().value() && bidsSortedSet.beginIterator().value()) {
          spread = Math.abs((parseFloat(asksSortedSet.beginIterator().value().price)/parseFloat(bidsSortedSet.beginIterator().value().price) - 1)*100)
          spreadDollar = Math.abs(parseFloat(asksSortedSet.beginIterator().value().price) - parseFloat(bidsSortedSet.beginIterator().value().price)).toFixed(7)
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
      // return {
      //   ...state,
      //   tradeBook: {
      //     bids: action.data.bids,
      //     asks: action.data.asks
      //   }
      // }
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
