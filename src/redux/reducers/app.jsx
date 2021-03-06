import React from 'react';
import { 
  INIT_DATA, USER_DATA, INIT_BALANCE, SET_MARKET_QUOTE, 
  APPEND_TRADE, UPDATE_ORDER, UPDATE_OPEN_ORDERS, 
  SET_AMOUNT, UPDATE_USER_ORDER, UPDATE_TICKER, 
  UPDATE_TRADES, UPDATE_FEE, UPDATE_DIGITS, LOAD_FILLED_ORDERS ,
  UPDATE_STORAGE, WEBSOCKET_STATUS,
  UPDATE_ACCOUNT, UPDATE_BLOCK_INFO,
  LOGIN, LOGOUT, TOGGLE_CONNECT_DIALOG, 
  TOGGLE_BUY_QDEX_DIALOG
} from "../actions/app.jsx";
import { dataSize } from "../actions/app.jsx";
import SortedSet from 'js-sorted-set'
import { toast } from 'react-toastify';
import Ticker, {SymbolToken} from '../../components/ui/ticker.jsx'
import lodash from 'lodash'
import moment from 'moment'
import {clear} from '../../common/storage.js'

let network = window.location.pathname.startsWith("/testnet") ? "testnet" : "mainnet"
if (localStorage.env !== undefined && localStorage.env !== network) localStorage.clear()

let initialState = {
  network: network,
  isMobile: window.isApp || screen.width < 992 || window.location.search.includes("app=true"), 
  websocket_status: null,
  private_key: null,
  publicKey: localStorage.publicKey || "",
  name: localStorage.name,
  userId: localStorage.id,
  lifetime: localStorage.lifetime === "true",
  currentTicker: null,
  fee: {},
  tradeHistory: [],
  tradeBook: { bids: [], asks: []},
  markets: [],
  currentPrice: undefined,
  balance: {},
  vesting: [],
  genesis: [],
  ui: {
    connectDialog: false,
    buyQdexDialog: false
  },
  mostRecentTrade: {
    price: undefined
  },
  openOrders: {
    dataSource: [],
    columns: [{
      name:"PAIR",
      key:"pair",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"left"
    },{
      name:"ORDER ID",
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
      key:"pair",
      type:"string",
      sortable:false,
      color: (value) => {return "white"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"left"
    },{
      name:"ORDER ID",
      key:"id",
      type:"id",
      sortable:false,
      color: (value) => {return "theme"},
      fontSize:"extra-small",
      fontWeight:"light",
      float:"right"
    },{
      name:"FILL PRICE",
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
    user_orders: {},
    asks: {
      dataSource: new SortedSet({ comparator: function(a, b) { return parseFloat(a.price) - parseFloat(b.price); }}),

      columns: [{
        name: (ticker) => {return "Price " + ticker.split('/')[1].split('0X')[0]},
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
        name: (ticker) => {return "Total " + ticker.split('/')[1].split('0X')[0]},
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

var toastId;

function processFilledOrder(orders) {
  let latestOrder
  const data = orders.map((order) => {
    var tickerPair, ticker, amount, total

    if (order.seller) {
      tickerPair = [order.assets[order.sell_price.base.asset_id].symbol, order.assets[order.sell_price.quote.asset_id].symbol]
      ticker = order.isBid() ? tickerPair.reverse() : tickerPair
      order.time = new Date(order.order.time + 'z')
      amount = order.isBid() ? order.sell_price.quote.getAmount({ real: true }) 
                            : order.sell_price.base.getAmount({ real: true })
      total = order.isBid() ?  order.sell_price.base.getAmount({ real: true }) 
                            : order.sell_price.quote.getAmount({ real: true })
      order.isBid = order.isBid()
    } else {
      tickerPair = [order.assets[order.fill_price.base.asset_id].symbol, order.assets[order.fill_price.quote.asset_id].symbol]
      ticker = order.is_maker ? tickerPair : tickerPair.reverse()
      ticker = order.isBid ? ticker.reverse() : ticker
      order.id = order.order_id
      amount = parseFloat(order.amountToReceive());
      total = ((order.getPrice() * Math.pow(10, 6)) * (amount * Math.pow(10, 6)))/Math.pow(10, 12)
    }

    if (!latestOrder) {
      latestOrder = order.id
      if (!order.seller && new Date() - order.time < 30000 && currentOrders.indexOf(order.id) == -1 && toastId != order.id) {
        const msg = (<div>
          <b>Order Filled:</b><br/>
          <span>Order of {ticker[0]} at {order.getPrice()} has fully filled.</span>
        </div>)
        toastId = toast.success(msg, {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 2000,
                    toastId: order.id,
                    pauseOnFocusLoss: false,
                    pauseOnHover: false
                  });
      }
    }
    
    return {
      id: order.id,
      assets: ticker.join('/'),
      pair: <Ticker ticker={ticker.join('/')} withLink={true} />,
      price: <span>{order.getPrice()} <SymbolToken name={ticker[1]} showIcon={false} /></span>,
      amount: <span>{amount} <SymbolToken name={ticker[0]} showIcon={false} /></span>,
      total: <span>{total.toLocaleString(navigator.language, {maximumFractionDigits: window.assetsBySymbol[ticker[1]].precision})} <SymbolToken name={ticker[1]} showIcon={false} /></span>,
      maker: order.seller ? "False" : String(order.is_maker),
      type: order.isBid ? 'BUY' : 'SELL',
      date: order.time.toLocaleString(navigator.language, { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }),
      block: order.block,
      status: order.seller ? "Canceled" : "Filled"
    }
  })

  return data
}
var currentOrders = []
const app = (state = initialState, action) => {
  // console.log("Reduce ", action);

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
          console.log("init data exception ",e)
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
          console.log("init data exception ",e)
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

      if (lastTradePrice === undefined) {
        lastTradePrice = window.allMarketsByHash[action.data.ticker] ? window.allMarketsByHash[action.data.ticker].last : "-"
      }
      
      var spread = undefined
      var spreadDollar = 0
      if (asksSortedSet.beginIterator().value() && bidsSortedSet.beginIterator().value()) {
        spread = Math.abs((parseFloat(asksSortedSet.beginIterator().value().price)/parseFloat(bidsSortedSet.beginIterator().value().price) - 1)*100)
        spreadDollar = Math.abs(parseFloat(asksSortedSet.beginIterator().value().price) - parseFloat(bidsSortedSet.beginIterator().value().price)).toFixed(7)
      }
      return {
        ...state,
        currentTicker: action.data.ticker,
        mostRecentTrade: {
          ticker: action.data.ticker,
          price: lastTradePrice
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

    case USER_DATA:
      const onOrdersFund = {}
      const user_orders = {}
      currentOrders = []
      const limitOrdersDataSource = action.data.openOrders.map((order) => {
        const tickerPair = [order.assets[order.sell_price.base.asset_id].symbol, order.assets[order.sell_price.quote.asset_id].symbol]
        const ticker = order.isBid() ? tickerPair.reverse() : tickerPair
        
        const amount = order.isBid() ?
          (order.amountToReceive()).getAmount({ real: true }) :
          (order.amountForSale()).getAmount({ real: true })
        
        const total = order.isBid() ?
          (order.amountForSale()).getAmount({ real: true }) :
          (order.amountToReceive()).getAmount({ real: true })
        
        let onOrderFeeAsset = order.order.deferred_paid_fee.asset_id
        let onOrderFeeValue = order.fee / Math.pow(10, window.assets[onOrderFeeAsset].precision)
        let onOrderAsset = order.sell_price.base.asset_id
        let onOrderValue = order.isBid() ? total : amount
        
        onOrdersFund[onOrderFeeAsset] = (onOrdersFund[onOrderFeeAsset] || 0) + onOrderFeeValue
        onOrdersFund[onOrderAsset] = (onOrdersFund[onOrderAsset] || 0) + onOrderValue
        currentOrders.push(order.id)

        const user_orders_list = user_orders[ticker.join('/')]
        if (user_orders_list) {
          user_orders_list.push(order.getPrice())
          user_orders[ticker.join('/')] = user_orders_list
        } else {
          user_orders[ticker.join('/')] = [order.getPrice()]
        }

        return {
          assets: ticker.join('/'),
          pair: <Ticker ticker={ticker.join('/')} withLink={true} />,
          price: <span>{order.getPrice()} <SymbolToken name={ticker[1]} showIcon={false} /></span>,
          amount: <span>{amount} <SymbolToken name={ticker[0]} showIcon={false} /></span>,
          total: <span>{total.toLocaleString(navigator.language, {maximumFractionDigits: window.assetsBySymbol[ticker[1]].precision})} <SymbolToken name={ticker[1]} showIcon={false} /></span>,
          type: order.isBid() ? 'BUY' : 'SELL',
          date: (new Date(order.expiration.setFullYear(order.expiration.getFullYear() - 5))).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }),
          id: order.id
        }
      })
      
      const filledOrdersDataSource = processFilledOrder(action.data.filledOrders)
      
      var total_fund_value = 0
      const balances = action.data.accountData.length > 0 && action.data.accountData[0][1].balances.map((balance => {
        
        const symbol = window.assets[balance.asset_type].symbol
        const real_balance = balance.balance / (10 ** window.assets[balance.asset_type].precision)
        const total_balance = real_balance + (onOrdersFund[balance.asset_type] || 0)
        const binance = state.usd_value[balance.asset_type] > 0 ? null : window.binance_data[symbol + (state.network == "testnet" ? "/USD" : "/TUSD0X0000000000085D4780B73119B644AE5ECD22B376")]
        const usd = state.usd_value[balance.asset_type] > 0 ? 
                    total_balance * state.usd_value[balance.asset_type] 
                      : binance ? total_balance * parseFloat(binance.last_price)
                        : 0
        total_fund_value += usd
        return {
          asset: balance.asset_type,
          symbol: symbol,
          balance: real_balance,
          usd: usd
        }
      }))
      
      const vesting = action.data.accountData.length > 0 && action.data.accountData[0][1].vesting_balances
      const genesis = action.data.genesis_balance 
      const referral_paid = action.data.referral_fee || []

      return {
        ...state,
        balance: lodash.keyBy(balances, "symbol"),
        vesting: vesting,
        genesis: genesis,
        referral_paid: referral_paid,
        onOrdersFund: onOrdersFund,
        totalFundValue: total_fund_value,
        orderBook: {
          ...state.orderBook,
          user_orders
        },
        openOrders: {
          ...state.openOrders,
          dataSource: limitOrdersDataSource
        }, 
        filledOrders: {
          ...state.filledOrders,
          dataSource: filledOrdersDataSource
        }
      }

    case UPDATE_STORAGE:
      const { publicKey, name, userId, lifetime } = action.data
      return {
        ...state, publicKey, name, userId, lifetime
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

    case LOGOUT: 
      clear()
      return {
        ...state,
        private_key: null,
        userId: null,
        name: null,
        publicKey: null,
        lifetime: false
      }
    
    case UPDATE_ACCOUNT: 
      return {
        ...state,
        userId: action.data.id,
        name: action.data.name,
        publicKey: action.data.publicKey || action.data.owner.key_auths[0][0],
        lifetime: action.data.lifetime
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
        // markets: mergeTickerData(state.markets, action.data)
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

    case TOGGLE_CONNECT_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          connectDialog: action.data,
        }
    }
    case TOGGLE_BUY_QDEX_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          buyQdexDialog: action.data,
        }
    }
    case WEBSOCKET_STATUS:
      return {
        ...state,
        websocket_status: action.data
    }
    default:
      return state
  }
}

export default app
