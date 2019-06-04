import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'
import { SmallToken } from './ui/ticker.jsx'
import Loader from './ui/loader.jsx'
import Utils from '../common/utils'
import { buyTransaction, sellTransaction, TOGGLE_CONNECT_DIALOG } from "../redux/actions/app.jsx";
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

  button.connect-btn {
    background-color: transparent;
    border: 2px solid #66d7d7;
    border-radius: 5px;
    color: #66d7d7;
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
    display: flex;
    align-items: center;
    margin: 6px 0;

    label {
      flex: 1 1 60px;
      margin: 0;
    }

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
    
    .percent-container, input {
      flex: 1 1 calc(100% - 60px);
    }

    .amount-select {
      line-height: 17px; 
      width: 23%;
      border: 1px solid rgba(255,255,255,0.27);
      border-radius: 2px;
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

  .rounded-0-left {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
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
            trade_side: this.props.trade_side || 0,
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
      const { currentTicker, mobile, inputSetTime, currentPrice, inputBuyAmount, inputBuy} = this.props
      if (!mobile) {
        return
      }
      if (inputSetTime && currentPrice.price && (new Date() - inputSetTime) < 50) {
        this.setState({
          qty: parseFloat(inputBuyAmount),
          price: parseFloat(inputBuy),
          total: parseFloat(inputBuyAmount) * parseFloat(inputBuy),
          inputSetTime: inputSetTime,
          currentPrice: currentPrice.price,
          currentTicker: currentTicker
        })
      } else {
        this.setState({
          price: parseFloat(currentPrice.price),
          currentPrice: currentPrice.price,
          currentTicker: currentTicker
        })
      }
    }

    componentWillReceiveProps(nextProps) {
        const { inputSetTime, currentPrice, currentTicker } = this.state
        if (nextProps.inputSetTime != undefined && nextProps.inputSetTime != inputSetTime) {
            this.setState({
                qty: parseFloat(nextProps.inputBuyAmount),
                price: parseFloat(nextProps.inputBuy),
                total: parseFloat(nextProps.inputBuyAmount) * parseFloat(nextProps.inputBuy),
                inputSetTime: nextProps.inputSetTime
            })
        }
        if (currentPrice !== nextProps.currentPrice.price && (currentTicker !== nextProps.currentPrice.ticker || !currentPrice)) {
          this.setState({
            currentTicker: nextProps.currentPrice.ticker, 
            currentPrice: nextProps.currentPrice.price, 
            price: nextProps.currentPrice.price, 
            qty: 0,
            total: 0
          })
        }
    }

    handleBuy(e) {
        const { dispatch, currentTicker } = this.props
        const { price, qty } = this.state

        ReactGA.event({
            category: 'BUY',
            action: currentTicker
        });

        this.setState({ processing: true })
        dispatch(buyTransaction(currentTicker, price, qty))
            .finally(() => {
                this.setState({ processing: false })
            })
    }

    handleSell(e) {
        const { dispatch, currentTicker } = this.props
        const { price, qty } = this.state

        ReactGA.event({
            category: 'SELL',
            action: currentTicker
        });

        this.setState({ processing: true })
        dispatch(sellTransaction(currentTicker, price, qty))
            .finally(() => {
                this.setState({ processing: false })
            })
    }

    switchTradeTo(side) {
        this.setState({trade_side: side})
    }

    setPercentAmount(perc, symbol) {
      const { balance } = this.props
      const { trade_side, price} = this.state
      const amount = balance[symbol] ? balance[symbol].balance * (parseInt(perc)/100) : 0

      let qty, total
      if (trade_side == 0) {
        qty = amount / price
        total = amount
      } else {
        qty = amount
        total = qty * price
      }
      this.setState({qty, total})
    }

    render() {
        const { currentTicker, balance, mobile, mobile_nav, fee, publicKey, private_key } = this.props
        const { trade_side, price, qty, total, processing} = this.state
        const dropdown_items = {
            items: ["25%", "50%", "75%", "100%"],
            value: "25%"
        }
        
        if (currentTicker == null) {
          return <div></div>;
        }

        const tradingPair = currentTicker.split('/')
        const base = window.assetsBySymbol && window.assetsBySymbol[tradingPair[0]]
        const counter = window.assetsBySymbol && window.assetsBySymbol[tradingPair[1]]
        const precisions = [base ? base.precision : 5, counter ? counter.precision : 5] || [0,0]
        var pairBalance = []
        Object.keys(balance).forEach((symbol) => {
            if (!window.assetsBySymbol[symbol]) {
              return
            }
            var item = {}
            item.currency = symbol
            if (!tradingPair.includes(item.currency)) {
                return
            }
            item.amount = balance[symbol].balance ? balance[symbol].balance : 0
            pairBalance.push(item)
        })
        const taker_fee = (window.assetsBySymbol && window.assetsBySymbol[tradingPair[trade_side]].options.market_fee_percent/100) || 0
        const maker_fee = (window.maker_rebate_percent_of_fee && taker_fee - (taker_fee * (window.maker_rebate_percent_of_fee/10000))) || 0

        return (
            <div className={container + " container-fluid" + (mobile ? " mobile" : "")}>
                <div className="buy-sell-toggle">
                    <button id="buy-switch" className={"buy-btn" + (trade_side !== 0 ? " inactive" : "")} onClick={this.switchTradeTo.bind(this, 0)}>BUY <SmallToken name={tradingPair[0]} /></button>
                    <button id="sell-switch" className={"sell-btn" + (trade_side !== 1 ? " inactive" : "")} onClick={this.switchTradeTo.bind(this, 1)}>SELL <SmallToken name={tradingPair[0]} /></button>
                </div>

                <div className="transac-actions">
                    <div className="input-container">
                        <label>PRICE</label>
                        <input type="number" className="trade-input qt-number-bold qt-font-small" title=""
                            name="price"
                            autoComplete="off"
                            onFocus={(e) => !mobile && e.target.select()}
                            min="0"
                            value={price == "-" ? 0 : price}
                            onChange={(e) => {
                              let value = e.target.value
                              this.setState({
                              price: value,
                              total: qty * value
                            })}} />
                        <SmallToken name={tradingPair[1]} />
                    </div>
                    <div className="input-container">
                      <label>AMOUNT</label>
                        <input type="number" className="trade-input qt-number-bold qt-font-small rounded-0-left" title=""
                            name="amount"
                            autoComplete="off"
                            onFocus={(e) => !mobile && e.target.select()}
                            min="0"
                            value={Utils.maxPrecision(qty, precisions[0])}
                            onChange={(e) => {
                              let value = Utils.maxPrecision(e.target.value, precisions[0])
                              this.setState({
                              qty: value,
                              total: value * price
                            })}} />
                        <SmallToken name={tradingPair[0]} />
                    </div>
                    <div className="input-container">
                        <label className="invisible">Percent</label>
                        <div className="percent-container d-flex justify-content-between text-center">
                          {dropdown_items.items.map(item => {
                            return (
                              <div key={item} className="amount-select cursor-pointer"
                                onClick={() => balance && this.setPercentAmount(item, tradingPair[trade_side == 0 ? 1 : 0])}
                              >
                                {item}
                              </div>
                            )
                          })}
                        </div>
                    </div>
                    <div className="input-container">
                        <label>TOTAL</label>
                        <input
                            title=""
                            type="number"
                            autoComplete="off"
                            onFocus={(e) => !mobile && e.target.select()}
                            className="trade-input qt-number-bold qt-font-small"
                            min="0"
                            value={total < 1/Math.pow(10, precisions[1]) ? total : Utils.maxPrecision(total, precisions[1])}
                            onChange={(e) => {
                              let value = Utils.maxPrecision(e.target.value, precisions[1])
                              this.setState({
                              qty: value/price,
                              total: value
                            })}}
                            />
                        <SmallToken name={tradingPair[1]} />
                    </div>
                    {total < 1/Math.pow(10, precisions[1]) && !(price <= 0 || qty <= 0) ? 
                      <div className="text-danger text-right">* total must be more than {1/Math.pow(10, precisions[1])}</div> 
                      : null
                    }

                    <div className="fees-container">
                        Estimate Fees
                        <table>
                            <tbody>
                                <tr>
                                    <td>Maker</td>
                                    <td className="text-left text-muted pl-3">{maker_fee}%</td>
                                    <td className="text-right pr-2">{window.assetsBySymbol 
                                        && window.assetsBySymbol[tradingPair[trade_side]].options.market_fee_percent != 0 
                                        && ((trade_side == 0 ? qty : total)*maker_fee/100).toLocaleString(navigator.language, {maximumFractionDigits: precisions[trade_side]}) || 0}</td>
                                    <td className="text-muted"><SmallToken name={tradingPair[trade_side]} /></td>
                                </tr>
                                <tr>
                                    <td>Taker</td>
                                    <td className="text-left text-muted pl-3">{taker_fee}%</td>
                                    <td className="text-right pr-2">{window.assetsBySymbol 
                                        && window.assetsBySymbol[tradingPair[trade_side]].options.market_fee_percent != 0 
                                        && ((trade_side == 0 ? qty : total)*taker_fee/100).toLocaleString(navigator.language, {maximumFractionDigits: precisions[trade_side]}) || 0}</td>
                                    <td className="text-muted"><SmallToken name={tradingPair[trade_side]} /></td>
                                </tr>
                                <tr>
                                    <td colSpan="2">Platform Fees</td>
                                    <td className="text-right pr-2">{fee.amount}</td>
                                    <td className="text-muted"><SmallToken name={fee.symbol} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    { private_key ? 
                      <div>
                        {trade_side == 1 ?
                          <button id="sell-action" className="sell-btn" 
                            disabled={price <= 0 || qty <= 0 || total < 1/Math.pow(10, precisions[1]) || processing}
                            onClick={this.handleSell.bind(this)}>
                            {processing ? <Loader /> : 
                              <span>
                                PLACE SELL ORDER
                              </span>
                            }
                          </button>
                          :
                          <button id="buy-action" className="buy-btn" 
                            disabled={price <= 0 || qty <= 0 || total < 1/Math.pow(10, precisions[1]) || processing}
                            onClick={this.handleBuy.bind(this)}>
                            {processing ? <Loader /> : 
                              <span>
                                PLACE BUY ORDER
                              </span>
                            }
                          </button>
                        }
                      </div>

                      : 
                      mobile || publicKey ? 
                        <button className="connect-btn" 
                        onClick={mobile && mobile_nav ? () => mobile_nav() 
                          : 
                          () => this.props.dispatch({
                            type: TOGGLE_CONNECT_DIALOG,
                            data: "connect"
                          })
                        }>
                        CONNECT WALLET TO TRADE
                      </button> 
                      : null
                    }

                    { mobile && publicKey ?
                      <div className="d-flex justify-content-around flex-wrap qt-font-light qt-font-small text-secondary">
                        <span className="mx-2">{base.symbol.split("0X")[0]} Balance: {balance[base.symbol] ? balance[base.symbol].balance : 0}</span>
                        <span className="mx-2">{counter.symbol.split("0X")[0]} Balance: {balance[counter.symbol] ? balance[counter.symbol].balance : 0}</span>
                      </div>
                      : null
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
    publicKey: state.app.publicKey,
    requestedPrice: 0,
    requestedQty: 0,
    bids: state.app.tradeBook.bids,
    asks: state.app.tradeBook.asks,
    currentTicker: state.app.currentTicker,
    currentPrice: state.app.mostRecentTrade,
    balance: state.app.balance || {},
    inputBuy: state.app.inputBuy,
    inputBuyAmount: state.app.inputBuyAmount,
    inputSetTime: state.app.setTime,
    inputSide: state.app.inputSide,
    fee: state.app.fee
});

export default connect(mapStateToProps)(Trade);
