import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTButton from './ui/button.jsx'

const container = css`
  width: 100%;
  padding: 20px 35px;

  .order-list {
    margin-top: 35px;
  }

  .order-list.inactive {
    display: none;
  }

  .order-list-pairs {
    min-width: 64px;
  }

  .order-list-sloss, .order-list-limit, .order-list-amount, .order-list-total-btc {
    min-width: 82px;
  }

  .order-list-type {
    min-width: 28px;
  }

  .order-list-status {
    min-width: 42px;
  }

  .order-list-date {
    min-width: 96px;
  }

  .order-list-empty {
    width: 66px;
  }

  .order-list-btn {
    width: 66px;
    height:19px;
    line-height:17px;
    color: rgba(255, 255, 255, 0.62);
    border-radius: 2px;
    border: solid 1px #ffffff;
    opacity: 0.27;
    text-align:center;
  }

  .order-list-data {
    height:20px;
    cursor:pointer;

    &:hover {
      border-radius: 2px;
      background-color: rgba(52, 62, 68, 0.4);
    }
  }
`;

class Orders extends Component {
  handleSwitch(index, selected) {
    const list = document.getElementsByClassName("order-list")[0]
    if (index != selected || list.classList.contains("inactive")) {
      list.classList.remove("inactive")
    } else {
      list.classList.add("inactive")
    }
  }

  render() {
    // const orders_data = [
    //   ["BNCBTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","BUY","Filled","12 JAN, 12:34:15"],
    //   ["BNCBTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","BUY","Filled","12 JAN, 12:34:15"]
    // ]
    const tabs = {
      names: ['ACTIVE ORDERS','CLOSED ORDERS','CANCELLED ORDERS'],//,'ALERT'],
      selectedTabIndex: 0,
    }

    return (
      <div className={container}>
        <QTTabBar
          className="underline small static set-width qt-font-bold d-flex justify-content-center"
          width={200}
          gutter={10}
          tabs = {tabs}
          switchTab = {this.handleSwitch.bind(this)}
        />
        <section className="order-list container-fluid inactive">
					<div className="row qt-opacity-half justify-content-between qt-number-base qt-font-semibold">
						<span className="order-list-pairs text-left">Pair</span>
						<span className="order-list-sloss text-right">STOP LOSS</span>
						<span className="order-list-limit text-right">LIMIT</span>
            <span className="order-list-amount text-right">AMOUNT BTC</span>
            <span className="order-list-total-btc text-right">TOTAL BTC</span>
            <span className="order-list-type text-right">TYPE</span>
            <span className="order-list-status text-right">STATUS</span>
            <span className="order-list-date text-right">Date Time</span>
            <span className="order-list-empty"></span>
					</div>
					{
						this.props.openOrders.map((order,index) => {
							return (
								<div className="order-list-data row justify-content-between align-items-center qt-font-extra-small qt-font-normal">
                  <span className="order-list-pairs text-left">{order.base + order.counter}</span>
      						<span className="order-list-sloss text-right">-</span>
      						<span className="order-list-limit text-right">-</span>
                  <span className="order-list-amount text-right">{order.amount}</span>
                  <span className="order-list-total-btc text-right">{order.amount * order.price}</span>
                  <span className="order-list-type text-right">{order.type}</span>
                  <span className="order-list-status text-right">-</span>
                  <span className="order-list-date text-right">-</span>
                  <QTButton className="grey inverse qt-font-semibold qt-font-base" borderWidth="1" width="66" height="18" label="CANCEL"/>
								</div>
							)
						})
					}
				</section>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  	bids: state.app.tradeBook.bids,
  	asks: state.app.tradeBook.asks,
		currentPrice: state.app.currentPrice,
    openOrders:state.app.openOrders
	});

export default connect(mapStateToProps)(Orders);
