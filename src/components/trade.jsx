import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import { toast } from 'react-toastify';
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTDropdown from './ui/dropdown.jsx'
import QTButton from './ui/button.jsx'
import { Token, SmallToken } from './ui/ticker.jsx'
import Loader from './ui/loader.jsx'
import Utils from '../common/utils'
import lodash from 'lodash';

import { buyTransaction } from "../redux/actions/app.jsx";
import { sellTransaction } from "../redux/actions/app.jsx";
import ReactGA from 'react-ga';

const container = css`
  font-family: SFCompactTextRegular;
  width: 100%;
  display: inline-block;
  padding: 0;
  
  .buy-sell-toggle {
    width: 100%;
    margin-bottom: 20px;

    button {
      width: 50%;
      padding: 9px;
      font-size: 12px;
      color: #fff;
      cursor: pointer;
    }
    button.inactive {
      background-color: #31383d;
    }
    #buy-switch {
      border-radius: 2px 0 0 2px;
    }
    #sell-switch {
      border-radius: 0 2px 2px 0;
    }
  }
  .transac-actions {
    position: relative;

    button {
      display: block;
      width: 100%;
      padding: 8px;
      margin: 15px 0;
      font-size: 14px;
      color: #fff;
      border-radius: 2px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #31383d;
    }
  }

  .buy-btn, .sell-btn {
    height: 37px;
  }
  .buy-btn {
    background-color: #50b3b7;
  }
  .sell-btn {
    background-color: #da3c76;
  }

  .input-container {
    margin: 15px 0;
    input {
      border-radius: 2px;
      padding: 0 40px 0 10px;
      text-align: left;
    }
    input::selection {
      background-color: #fff;
      color: #333;
    }
    input:invalid {
      box-shadow: none;
    }
    span {
      position: absolute;
      right: 10px;
      line-height: 32px;
      color: #555;
    }
    span.issuer {
      display: none;
    }
    button.qt-dropdown-btn, button.qt-dropdown-item {
      font-family: SFCompactTextRegular;
      width: 57px;
      margin: 0;
      border-right: 0;
      border-radius: 2px 0 0 2px;
      padding: 5px 5px;
    }
    button.qt-dropdown-item {
      border-radius: 0;
    }
    .up .qt-dropdown-menu {
      bottom: 37px;
      width: 58px;
    }
    button.qt-dropdown-item {
      width: 56px;
      padding: 0;
    }
    input[type=number] {
      -moz-appearance:textfield;
      min-width: 0;
    }
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
  }

  .trade-left, .trade-right {
    width: calc(50% - 8px);
  }

  .trade-balance {
    color: #838f95;
    text-align: center;
    margin: 0 5px
  }

  .trade-input-row {
    margin-top: 20px;
  }

  .trade-input-container {
    margin-top:5px;
  }

  .trade-input {
    width: 100%;
		cursor:text;

		&:hover, &:focus {
			background-color:white
			background-color: #22282c;
  		border: solid 1px #55575a;
		}

  }

  .trade-input-half {
    width: calc(50% - 7px);
  }

  .trade-input-percentage input {
    border-left:none;
  }

  .trade-right .qt-dropdown-btn {
    border-radius:0;
  }

  .trade-btn-row {
    margin-top: 16px;
  }

  .trade-btn-buy, .trade-btn-sell {
    width: 100%;
    height:32px;
    text-align:center;
    line-height:32px;
    display:block;
  }

  .trade-btn-buy {
    border-radius: 2px;
    box-shadow: 0 0 14px 0 rgba(46, 212, 207, 0.08);
    border: solid 2px #1cdad8;
  }

  .fees-container {
      table {
          width: 100%;
          tr td:first-child, tr td:last-child {
              width: 1%;
          }
      }
  }

  &.mobile {
    width: 100%;
    padding: 10px;
  }
`;

class Trade extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trade_side: 0,
            processing: false,
            qty: 0,
            price: 0,
            total: 0,
            price_set: false,
            inputSetTime: 0,
            currentPrice: undefined,
            currentTicker: undefined
        };
    }

    componentDidMount() {
      if (!this.props.mobile) {
        return
      }
      if (this.props.inputSetTime && this.props.currentPrice.price && (new Date() - this.props.inputSetTime) < 50) {
        this.setState({
          qty: parseFloat(this.props.inputBuyAmount),
          price: parseFloat(this.props.inputBuy),
          total: parseFloat(this.props.inputBuyAmount) * parseFloat(this.props.inputBuy),
          inputSetTime: this.props.inputSetTime,
          currentPrice: this.props.currentPrice.price,
          currentTicker: this.props.currentTicker
        })
      } else {
        this.setState({
          price: parseFloat(this.props.currentPrice.price),
          currentPrice: this.props.currentPrice.price,
          currentTicker: this.props.currentTicker
        })
      }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.mobile && nextProps.inputSetTime != undefined && nextProps.inputSetTime != this.state.inputSetTime) {
            this.setState({
                qty: parseFloat(nextProps.inputBuyAmount),
                price: parseFloat(nextProps.inputBuy),
                total: parseFloat(nextProps.inputBuyAmount) * parseFloat(nextProps.inputBuy),
                inputSetTime: nextProps.inputSetTime
            })
        }
        if (this.state.currentPrice !== nextProps.currentPrice.price && (this.state.currentTicker !== nextProps.currentPrice.ticker || !this.state.currentPrice)) {
          this.setState({
            currentTicker: nextProps.currentPrice.ticker, 
            currentPrice: nextProps.currentPrice.price, 
            price: nextProps.currentPrice.price, 
            qty: 0
          })
        }
    }

    notify_success = (toastId, msg) => toast.update(toastId, {
        render: msg,
        type: toast.TYPE.SUCCESS,
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER
    });
    notify_failed = (toastId, msg) => toast.update(toastId, {
        render: msg,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER
    });

    toastMsg(label, success, e) {
        const msg = (<div>
            <span>{label}</span><br />
            <span>{success ? "Order ID: " + e.trx.operation_results[0][1] :
                "Failed order: " + (e.message.includes("insufficient balance") ? "Insufficient Balance" : "Unable to place order")}</span>
        </div>)
        return msg
    }

    handleBuy(e) {
        const label = this.props.currentTicker.split('/')[1] + " " + this.state.price + " @ " + this.state.qty
        const toastId = toast("BUYING " + label, { autoClose: false, position: toast.POSITION.TOP_CENTER });

        ReactGA.event({
            category: 'BUY',
            action: this.props.currentTicker
        });

        this.setState({ processing: true })
        let price = Utils.maxPrecision(this.state.price, window.assetsBySymbol[this.props.currentTicker.split('/')[1]].precision)
        let amount = Utils.maxPrecision(this.state.qty, window.assetsBySymbol[this.props.currentTicker.split('/')[0]].precision)
        this.props.dispatch(buyTransaction(this.props.currentTicker, price, amount))
            .then((e) => {
                const msg = this.toastMsg("BUY " + label, true, e)
                this.notify_success(toastId, msg)
            }).catch((e) => {
                const msg = this.toastMsg("BUY " + label, false, e)
                this.notify_failed(toastId, msg)
            }).finally(() => {
                this.setState({ processing: false })
            })
    }

    handleSell(e) {
        const label = this.props.currentTicker.split('/')[1] + " " + this.state.price + " @ " + this.state.qty
        const toastId = toast("SELLING " + label, { autoClose: false, position: toast.POSITION.TOP_CENTER });

        ReactGA.event({
            category: 'SELL',
            action: this.props.currentTicker
        });

        this.setState({ processing: true })
        let price = Utils.maxPrecision(this.state.price, window.assetsBySymbol[this.props.currentTicker.split('/')[1]].precision)
        let amount = Utils.maxPrecision(this.state.qty, window.assetsBySymbol[this.props.currentTicker.split('/')[0]].precision)
        this.props.dispatch(sellTransaction(this.props.currentTicker, price, amount))
            .then((e) => {
                const msg = this.toastMsg("SELL " + label, true, e)
                this.notify_success(toastId, msg)
            }).catch((e) => {
                const msg = this.toastMsg("SELL " + label, false, e)
                this.notify_failed(toastId, msg)
            }).finally(() => {
                this.setState({ processing: false })
            })
    }

    switchTradeTo(side) {
        this.setState({trade_side: side})
    }

    setPercentAmount(perc, symbol) {
      const coin = window.assetsBySymbol[symbol].id
      const amount = this.props.balance[coin].balance * (parseInt(perc)/100)

      let qty, total
      if (this.state.trade_side == 0) {
        qty = amount / this.state.price
        total = amount
      } else {
        qty = amount
        total = qty * this.state.price
      }
      this.setState({qty, total})
    }

    render() {
        // const tabs = {
        //     names: ['LIMIT', 'MARKET', 'STOP-LIMIT'],
        //     selectedTabIndex: 0,
        // }

        const dropdown_items = {
            items: ["25%", "50%", "75%", "100%"],
            value: "25%"
        }

        const tradingPair = this.props.currentTicker.split('/')
        const precisions = window.assetsBySymbol && [window.assetsBySymbol[tradingPair[0]].precision, window.assetsBySymbol[tradingPair[1]].precision] || [0,0]
        const balance = this.props.balance
        var pairBalance = []
        Object.keys(balance).forEach((currency) => {
            var item = {}
            item.currency = window.assets[balance[currency].asset].symbol
            if (!tradingPair.includes(item.currency)) {
                return
            }
            item.amount = balance[currency].balance ? balance[currency].balance : 0
            pairBalance.push(item)
        })
        
        return (
            <div className={container + " container-fluid" + (this.props.mobile ? " mobile" : "")}>
                <div className="buy-sell-toggle">
                    <button id="buy-switch" className={"buy-btn" + (this.state.trade_side !== 0 ? " inactive" : "")} onClick={this.switchTradeTo.bind(this, 0)}>BUY {tradingPair[0]}</button>
                    <button id="sell-switch" className={"sell-btn" + (this.state.trade_side !== 1 ? " inactive" : "")} onClick={this.switchTradeTo.bind(this, 1)}>SELL {tradingPair[0]}</button>
                </div>

                <div className="transac-actions">
                    <div className="input-container">
                        <label>PRICE</label>
                        <input type="number" className="trade-input qt-number-bold qt-font-small" title=""
                            name="price"
                            autoComplete="off"
                            onFocus={(e) => e.target.select()}
                            min="0"
                            value={Utils.maxPrecision(this.state.price, precisions[1])}
                            onChange={(e) => {
                              let value = Utils.maxPrecision(e.target.value, precisions[1])
                              this.setState({
                              price: value,
                              total: this.state.qty * value
                            })}} />
                        <SmallToken name={tradingPair[1]} />
                    </div>
                    <div className="input-container">
                        <label>AMOUNT</label>
                        <div className="d-flex">
                          <QTDropdown
                            items={dropdown_items.items}
                            value={dropdown_items.value}
                            className="down bordered dark qt-font-base qt-font-bold"
                            reverse={true}
                            width="58"
                            height="32"
                            onChange={(e) => this.props.balance && this.setPercentAmount(e, tradingPair[this.state.trade_side == 0 ? 1 : 0])}/>
                          <input type="number" className="trade-input qt-number-bold qt-font-small" title=""
                              name="amount"
                              autoComplete="off"
                              onFocus={(e) => e.target.select()}
                              min="0"
                              value={Utils.maxPrecision(this.state.qty, precisions[0])}
                              onChange={(e) => {
                                let value = Utils.maxPrecision(e.target.value, precisions[0])
                                this.setState({
                                qty: value,
                                total: value * this.state.price
                              })}} />
                          <SmallToken name={tradingPair[0]} />
                        </div>
                        
                    </div>
                    <div className="input-container">
                        <label>TOTAL</label>
                        <input
                            title=""
                            type="number"
                            autoComplete="off"
                            onFocus={(e) => e.target.select()}
                            className="trade-input qt-number-bold qt-font-small"
                            min="0"
                            value={Utils.maxPrecision(this.state.total, precisions[1])}
                            onChange={(e) => {
                              let value = Utils.maxPrecision(e.target.value, precisions[1])
                              this.setState({
                              qty: value/this.state.price,
                              total: value
                            })}}
                            />
                        <SmallToken name={tradingPair[1]} />
                    </div>

                    <div className="fees-container">
                        Estimate Fees
                        <table>
                            <tbody>
                                <tr>
                                    <td>Maker</td>
                                    <td className="text-left text-muted pl-3">{window.assetsBySymbol && (window.assetsBySymbol[tradingPair[this.state.trade_side]].options.market_fee_percent)/100}%</td>
                                    <td className="text-right pr-2">{window.assetsBySymbol 
                                        && window.assetsBySymbol[tradingPair[this.state.trade_side]].options.market_fee_percent != 0 
                                        && ((((this.state.qty * Math.pow(10, 6)) * (this.state.price * Math.pow(10, 6))) / Math.pow(10, 12))*((window.assetsBySymbol[tradingPair[this.state.trade_side]].options.market_fee_percent)/10000)).toLocaleString(navigator.language, {maximumFractionDigits: 6}) || 0}</td>
                                    <td className="text-muted">{tradingPair[this.state.trade_side]}</td>
                                </tr>
                                <tr>
                                    <td>Taker</td>
                                    <td className="text-left text-muted pl-3">{window.assetsBySymbol && window.assetsBySymbol[tradingPair[this.state.trade_side]].options.market_fee_percent}%</td>
                                    <td className="text-right pr-2">{window.assetsBySymbol 
                                        && window.assetsBySymbol[tradingPair[this.state.trade_side]].options.market_fee_percent != 0 
                                        && ((((this.state.qty * Math.pow(10, 6)) * (this.state.price * Math.pow(10, 6))) / Math.pow(10, 12))*((window.assetsBySymbol[tradingPair[this.state.trade_side]].options.market_fee_percent)/10000).toLocaleString(navigator.language, {maximumFractionDigits: 6})) || 0}</td>
                                    <td className="text-muted">{tradingPair[this.state.trade_side]}</td>
                                </tr>
                                <tr>
                                    <td colSpan="2">Platform Fees</td>
                                    <td className="text-right pr-2">{this.props.fee.amount}</td>
                                    <td className="text-muted">{this.props.fee.symbol}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    { this.props.private_key ? 
                        <div>
                            {this.state.trade_side == 1 ?
                                <button id="sell-action" className="sell-btn" disabled={this.state.price <= 0 || this.state.qty <= 0 || this.state.processing}
                                    onClick={this.handleSell.bind(this)}>
                                    {this.state.processing ? <Loader /> : "PLACE SELL ORDER"}
                                </button>
                                :
                                <button id="buy-action" className="buy-btn" disabled={this.state.price <= 0 || this.state.qty <= 0 || this.state.processing}
                                    onClick={this.handleBuy.bind(this)}>
                                    {this.state.processing ? <Loader /> : "PLACE BUY ORDER"}
                                </button>
                            }
                        </div>
                    : "" }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
    requestedPrice: 0,
    requestedQty: 0,
    bids: state.app.tradeBook.bids,
    asks: state.app.tradeBook.asks,
    currentTicker: state.app.currentTicker,
    currentPrice: state.app.mostRecentTrade,
    balance: state.app.balance && lodash.keyBy(state.app.balance, "asset"),
    inputBuy: state.app.inputBuy,
    inputBuyAmount: state.app.inputBuyAmount,
    inputSetTime: state.app.setTime,
    inputSide: state.app.inputSide,
    fee: state.app.fee
});

export default connect(mapStateToProps)(Trade);
