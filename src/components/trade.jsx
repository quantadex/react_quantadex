import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTDropdown from './ui/dropdown.jsx'
import QTButton from './ui/button.jsx'
import {Token} from './ui/ticker.jsx'

import {buyTransaction} from "../redux/actions/app.jsx";
import {sellTransaction} from "../redux/actions/app.jsx";

const container = css`
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
      padding-right: 35px;
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
  }

  .trade-balance:first-child {
    margin-right:28px;
  }

  .trade-input-row {
    margin-top: 20px;
  }

  .trade-input-container {
    margin-top:5px;
  }

  .trade-input {
    width: 100%;
		cursor:pointer;

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
        qty: 0.05,
        price: 1};
  }

	handleBuy(e) {
		this.props.dispatch(buyTransaction(this.props.currentTicker, this.state.price, this.state.qty))
	}

	handleSell(e) {
		this.props.dispatch(sellTransaction(this.props.currentTicker, this.state.price, this.state.qty))
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

  switchTradeTo(e) {
    var to_hide = e.target.id == "sell-switch" ? document.getElementsByClassName('buy-btn') : 
                                                  document.getElementsByClassName('sell-btn');
    var to_show = e.target.id == "sell-switch" ? document.getElementsByClassName('sell-btn') : 
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
		var pairBalance = []
		tradingPair.forEach((currency) => {
			var item = {}
			item.currency = currency
			item.amount = this.props.balance[currency] ? this.props.balance[currency].balance : 0
			pairBalance.push(item)
		})

    return (
      <div className={container + " container-fluid"}>
        <div className="buy-sell-toggle">
          <button id="buy-switch" className="buy-btn" onClick={this.switchTradeTo}>BUY</button>
          <button id="sell-switch" className="sell-btn inactive" onClick={this.switchTradeTo}>SELL</button>
        </div>

        <div className="transac-actions">
          
            <div className="input-container">
              <label>PRICE</label>
              <input type="number" className="trade-input qt-number-bold qt-font-small"
                    onFocus={this.handleInputFocus.bind(this)}
                     value={this.state.price}
                     onChange={this.handlePriceInputChange.bind(this)} />
              <span>BTC</span>
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
                      onFocus={this.handleInputFocus.bind(this)}
                       value={this.state.qty}
                       onChange={this.handleQtyInputChange.bind(this)} />
              <span>BNB</span>
            </div>
            <div className="input-container">
               <label>TOTAL {/*<Token name={tradingPair[1]}/> */}</label>
              <input
										type="number"
                    className="trade-input qt-number-bold qt-font-small"
                    onFocus={this.handleInputFocus.bind(this)}
										value={pairBalance[1].amount * 0.2}
									 />
              <span>BTC</span>
            </div>

          <button id="sell-action" className="sell-btn inactive" onClick={this.handleSell.bind(this)}>PLACE SELL ORDER</button>
          <button id="buy-action" className="buy-btn" onClick={this.handleBuy.bind(this)}>PLACE BUY ORDER</button>
        </div>
        <div className="d-flex justify-content-center align-items-center qt-font-small">
						{
							pairBalance.map((item) => {

								return (
									<span className="trade-balance"><Token name={item.currency}/> Balance: {item.amount}</span>
								)
							})
						}
          </div>
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
		balance:state.app.balance
	});

export default connect(mapStateToProps)(Trade);
