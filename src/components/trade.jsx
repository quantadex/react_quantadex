import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTDropdown from './ui/dropdown.jsx'
import QTButton from './ui/button.jsx'
import {Token, SmallToken} from './ui/ticker.jsx'
import Loader from './ui/loader.jsx'

import {buyTransaction} from "../redux/actions/app.jsx";
import {sellTransaction} from "../redux/actions/app.jsx";
import ReactGA from 'react-ga';

const container = css`
  font-family: SFCompactTextRegular;
  width: 360px;
  display: inline-block;
  padding: 20px;
  
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
    .inactive {
      display: none;
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
    display: flex;
    margin: 15px 0;
    label {
      flex: 0 0 70px;
      line-height: 32px;
    }
    input {
      border-radius: 2px;
      padding-right: 40px;
    }
    input::selection {
      background-color: #fff;
      color: #333;
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
`;

class Trade extends Component {
  constructor(props) {
    super(props);
    this.state = {
        processing: false,
        qty: 0.05,
        price: 1,
        inputSetTime: 0
      };
  }

	componentWillReceiveProps(nextProps) {
    if (nextProps.inputSetTime != undefined && nextProps.inputSetTime != this.state.inputSetTime) {
      this.setState({
        qty: nextProps.inputBuyAmount,
        price: nextProps.inputBuy,
        inputSetTime: nextProps.inputSetTime
      })
      this.switchTradeTo(nextProps.inputSide)
    }
	}

  notify_success = (toastId, msg) => toast.update(toastId, {
    render: msg,
    type: toast.TYPE.SUCCESS,
    autoClose: 5000,
    className: css({
      transform: "rotateY(360deg)",
      transition: "transform 0.6s"
    }),
    position: toast.POSITION.TOP_CENTER
  });
  notify_failed = (toastId, msg) => toast.update(toastId, {
    render: msg,
    type: toast.TYPE.ERROR,
    autoClose: 5000,
    className: css({
      transform: "rotateY(360deg)",
      transition: "transform 0.6s"
    }),
    position: toast.POSITION.TOP_CENTER
  });

  toastMsg(label, success, e) {
    const msg = ( <div>
      <span>{label}</span><br/>
      <span>{success ? "OrderId: " + e.id.substr(0,10) : 
                      "Failed order: " +  (e.message.includes("insufficient balance") ? "Insufficient Balance" : "Unable to place order")}</span>
      </div> )
    return msg
  }

	handleBuy(e) {
    const label = this.props.currentTicker.split('/')[1] + " " + this.state.price + " @ " + this.state.qty
    const toastId = toast("BUYING " + label, { autoClose: false, position: toast.POSITION.TOP_CENTER });

    ReactGA.event({
      category: 'BUY',
      action: this.props.currentTicker
    });

    this.setState({processing: true})
    this.props.dispatch(buyTransaction(this.props.currentTicker, this.state.price, this.state.qty))
    .then((e) => {
      const msg = this.toastMsg("BUY " + label, true, e)
      this.notify_success(toastId, msg)
    }).catch((e) => {
      const msg = this.toastMsg("BUY " + label, false, e)
      this.notify_failed(toastId, msg)
    }).finally(() => {
      this.setState({processing: false})
    })
	}

	handleSell(e) {
    const label = this.props.currentTicker.split('/')[1] + " " + this.state.price + " @ " + this.state.qty
    const toastId = toast("SELLING " + label, { autoClose: false, position: toast.POSITION.TOP_CENTER });

    ReactGA.event({
      category: 'SELL',
      action: this.props.currentTicker
    });

    this.setState({processing: true})
    this.props.dispatch(sellTransaction(this.props.currentTicker, this.state.price, this.state.qty))
    .then((e) => {
      const msg = this.toastMsg("SELL " + label, true, e)
      this.notify_success(toastId, msg)
    }).catch((e) => {
      const msg = this.toastMsg("SELL " + label, false, e)
      this.notify_failed(toastId, msg)
    }).finally(() => {
      this.setState({processing: false})
    })
	}

	handlePriceInputChange(e) {
         this.setState({
           price: e.target.value
         });
   	}

	handleQtyInputChange(e) {
         this.setState({
           qty: e.target.value
         });
  }

  handleInputFocus(e) {
    e.target.select();
  }

  switchTradeTo(side) {
    var to_hide = side === 1 ? document.getElementsByClassName('buy-btn') : 
                                                  document.getElementsByClassName('sell-btn');
    var to_show = side === 1 ? document.getElementsByClassName('sell-btn') : 
                                                  document.getElementsByClassName('buy-btn');

    for (let i=0; i < to_hide.length; i++) {
      to_hide[i].classList.add("inactive");
    }
    for (let i=0; i < to_show.length; i++) {
      to_show[i].classList.remove("inactive");
    }
  }

  render() {
    const tabs = {
      names: ['LIMIT','MARKET','STOP-LIMIT'],
      selectedTabIndex: 0,
    }

    const dropdown_items = {
        items: ["10%","20%","25%","50%","75%","90%","100%"],
        value: "20%"
    }

    const tradingPair = this.props.currentTicker.split('/')
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
      <div className={container + " container-fluid"}>
        <div className="buy-sell-toggle">
          <button id="buy-switch" className="buy-btn" onClick={this.switchTradeTo.bind(this, 0)}>BUY {tradingPair[0]}</button>
          <button id="sell-switch" className="sell-btn inactive" onClick={this.switchTradeTo.bind(this, 1)}>SELL {tradingPair[0]}</button>
        </div>

        <div className="transac-actions">
          
            <div className="input-container">
              <label>PRICE</label>
              <input type="number" className="trade-input qt-number-bold qt-font-small"
                    name="price"
                    onFocus={this.handleInputFocus.bind(this)}
                    min="0"
                    step="0.0000001"
                     value={this.state.price}
                     onChange={this.handlePriceInputChange.bind(this)} />
              <SmallToken name={tradingPair[1]}/>
            </div>
            <div className="input-container">
               <label>AMOUNT {/*<Token name={tradingPair[0]}/>*/}</label> 
              <QTDropdown
									items={dropdown_items.items}
									value={dropdown_items.value}
									className="up bordered dark qt-font-base qt-font-bold"
									reverse={true}
									width="50"
									height="32"
									onChange={() => {console.log("dropdown changed value")}}/>
              <input type="number" className="trade-input qt-number-bold qt-font-small"
                      name="amount"
                      onFocus={this.handleInputFocus.bind(this)}
                      min="0"
                      step="0.0000001"
                       value={this.state.qty}
                       onChange={this.handleQtyInputChange.bind(this)} />
              <SmallToken name={tradingPair[0]}/>
            </div>
            <div className="input-container">
               <label>TOTAL {/*<Token name={tradingPair[1]}/> */}</label>
              <input
										type="number"
                    className="trade-input qt-number-bold qt-font-small"
                    name="total"
                    min="0"
                    step="0.0000001"
                    onFocus={this.handleInputFocus.bind(this)}
										value={((this.state.qty*10000000) * (this.state.price*10000000))/100000000000000}
									 />
              <SmallToken name={tradingPair[1]}/>
            </div>

          <button id="sell-action" className="sell-btn inactive" onClick={this.handleSell.bind(this)}>{this.state.processing ? <Loader /> : "PLACE SELL ORDER"}</button>
          <button id="buy-action" className="buy-btn" onClick={this.handleBuy.bind(this)}>{this.state.processing ? <Loader /> : "PLACE BUY ORDER"}</button>
        </div>
        <div className="d-flex justify-content-center align-items-center qt-font-small">
						{
							pairBalance.map((item) => {
                
								return (
									<span className="trade-balance">{item.currency} Balance: {item.amount}</span>
								)
							})
						}
          </div>
          <ToastContainer />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
    requestedPrice: 0,
    requestedQty: 0,
    state: state,
  	bids: state.app.tradeBook.bids,
  	asks: state.app.tradeBook.asks,
		currentPrice: state.app.mostRecentTrade.price,
		currentTicker:state.app.currentTicker,
    balance:state.app.balance,
    inputBuy: state.app.inputBuy,
    inputBuyAmount: state.app.inputBuyAmount,
    inputSetTime: state.app.setTime,
    inputSide: state.app.inputSide
	});

export default connect(mapStateToProps)(Trade);
