import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTDropdown from './ui/dropdown.jsx'
import QTButton from './ui/button.jsx'

import {buyTransaction} from "../redux/actions/app.jsx";
import {sellTransaction} from "../redux/actions/app.jsx";

const container = css`
  width: 50%;
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
      width: 100%;
      padding: 8px;
      margin: 15px 0;
      font-size: 14px;
      color: #fff;
      border-radius: 2px;
      cursor: pointer;
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
      padding-right: 25px;
    }
    span {
      position: absolute;
      right: 10px;
      line-height: 32px;
      color: #555;
    }
    button.qt-dropdown-btn, button.qt-dropdown-item {
      font-family: SFCompactTextRegular;
      margin: 0;
      border-right: 0;
      border-radius: 2px 0 0 2px;
      padding: 5px 15px;
    }
    .up .qt-dropdown-menu {
      bottom: 37px;
      width: 58px;
    }
    button.qt-dropdown-item {
      width: 56px;
      padding: 0;
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
        qty: 1,
        price: 8800};
  }




	handleBuy(e) {
		var publicKey = localStorage.getItem("quanta_sender_publicKey")
		var secretKey = localStorage.getItem("quanta_sender_secretKey")
		var issuerKey = localStorage.getItem("quanta_issuer_publicKey")

		this.props.dispatch(buyTransaction(publicKey,secretKey,issuerKey, this.state.qty, this.state.price))
	}

	handleSell(e) {
		var publicKey = localStorage.getItem("quanta_sender_publicKey")
		var secretKey = localStorage.getItem("quanta_sender_secretKey")
		var issuerKey = localStorage.getItem("quanta_issuer_publicKey")

		this.props.dispatch(sellTransaction(publicKey,secretKey,issuerKey, this.state.qty, this.state.price))
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
  
  switchToBuy(e) {
    document.getElementById('sell-switch').classList.add('inactive');
    e.target.classList.remove('inactive');
    document.getElementById('buy-action').style.display = 'block';
    document.getElementById('sell-action').style.display = 'none';
  }

  switchToSell(e) {
    document.getElementById('buy-switch').classList.add('inactive');
    e.target.classList.remove('inactive');
    document.getElementById('sell-action').style.display = 'block';
    document.getElementById('buy-action').style.display = 'none';
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
          <button id="buy-switch" className="buy-btn inactive" onClick={this.switchToBuy}>BUY</button>
          <button id="sell-switch" className="sell-btn" onClick={this.switchToSell}>SELL</button>
        </div>

        {/* <div className="row justify-content-between">
          <div className="trade-left">
						<QTTabBar
							className="underline small fluid even-width qt-font-bold d-flex justify-content-between"
							width={85}
							tabs = {tabs}
						/>
          </div>
          <div className="trade-right d-flex justify-content-end align-items-center qt-font-small">
						{
							pairBalance.map((item) => {

								return (
									<span className="trade-balance">{item.currency} Balance: {item.amount}</span>
								)
							})
						}
          </div>
        </div> */}
        {/* <div className="row trade-input-row justify-content-between">
          <div className="trade-left">
            <div className="qt-opacity-64 qt-font-semibold">PRICE</div>
            <div className="trade-input-container">
              <input type="number" className="trade-input qt-number-bold qt-font-small"
                     value={this.state.price}
                     onChange={this.handlePriceInputChange.bind(this)} />
            </div>
          </div>
          <div className="trade-right d-flex justify-content-between">
            <div className="trade-input-half">
              <div className="qt-opacity-64 qt-font-semibold">AMOUNT {tradingPair[0]}</div>
              <div className="trade-input-container">
                <input type="number" className="trade-input qt-number-bold qt-font-small"
                       value={this.state.qty}
                       onChange={this.handleQtyInputChange.bind(this)} />
              </div>
            </div>
            <div className="trade-input-half">
              <div className="qt-opacity-64 qt-font-semibold">TOTAL {tradingPair[1]}</div>
              <div className="trade-input-container d-flex justify-content-between align-items-center">
								<QTDropdown
									items={dropdown_items.items}
									value={dropdown_items.value}
									className="up bordered dark qt-font-base qt-font-bold"
									reverse={true}
									width="50"
									height="32"
									onChange={() => {console.log("dropdown changed value")}}/>
                <div className="trade-input-percentage">
                  <input
										type="number"
										className="trade-input qt-number-bold qt-font-small"
										value={pairBalance[1].amount * 0.2}
									 />
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="row trade-btn-row justify-content-between">
          <div className="trade-left">
            <QTButton
							className="theme inverse fluid qt-font-small qt-font-bold"
							borderWidth="2"
							height="32"
							label="BUY"
							onClick={this.handleBuy.bind(this)}
						/>
          </div>
          <div className="trade-right">
            <QTButton
                            className="red inverse fluid qt-font-small qt-font-bold"
							borderWidth="2"
							height="32"
							label="SELL"
							onClick={this.handleSell.bind(this)}
						/>
          </div>
        </div> */}

        <div className="transac-actions">
          
            <div className="input-container">
              <label>PRICE</label>
              <input type="number" className="trade-input qt-number-bold qt-font-small"
                     value={this.state.price}
                     onChange={this.handlePriceInputChange.bind(this)} />
              <span>BTC</span>
            </div>
            <div className="input-container">
              <label>AMOUNT</label>
              <QTDropdown
									items={dropdown_items.items}
									value={dropdown_items.value}
									className="up bordered dark qt-font-base qt-font-bold"
									reverse={true}
									width="50"
									height="32"
									onChange={() => {console.log("dropdown changed value")}}/>
              <input type="number" className="trade-input qt-number-bold qt-font-small"
                       value={this.state.qty}
                       onChange={this.handleQtyInputChange.bind(this)} />
              <span>BNB</span>
            </div>
            <div className="input-container">
              <label>TOTAL</label>
              <input
										type="number"
										className="trade-input qt-number-bold qt-font-small"
										value={pairBalance[1].amount * 0.2}
									 />
              <span>BTC</span>
            </div>

          <button id="sell-action" className="sell-btn" onClick={this.handleSell.bind(this)} style={{display: 'block'}}>PLACE SELL ORDER</button>
          <button id="buy-action" className="buy-btn" onClick={this.handleBuy.bind(this)} style={{display: 'none'}}>PLACE BUY ORDER</button>
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
