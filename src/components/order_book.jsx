import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import { UPDATE_DIGITS } from '../redux/actions/app.jsx'
import QTDropdown from './ui/dropdown.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'
import lodash from 'lodash';

import { css } from 'emotion'
import globalcss from './global-css.js'

const container = css`

	.orderbook-ask, .orderbook-bid {
		height: calc(50vh - 96px);
		thead th{
			position: -webkit-sticky;
			position: sticky;
			top: 0;
			background: #22282c;
			z-index: 1;
		}
	}

	.orderbook-middle {
		height:57px;
		border-top: 1px solid rgba(255, 255, 255, .09);
		border-bottom: 1px solid rgba(255, 255, 255, .09);
	}

	&.mobile {
		padding: 0 10px;
		.orderbook-ask, .orderbook-bid {
			height: calc(50vh - 132px);
			min-height: auto;
		}

		.perc-bar.left {
			left: 0;
		}

		.perc-bar.right {
			right: 0;
		}
	}
`;

class OrderBook extends Component {
	constructor(props) {
			super(props)
			this.updateDigits = this.updateDigits.bind(this)
	}

	updateDigits(value) {
		this.props.dispatch({
			type: 'UPDATE_DIGITS',
			value: value
		})
	}

	setAmount(side, e) {
		const { mobile_nav } = this.props
		if (mobile_nav) {
			mobile_nav()
		}
		const set_time = new Date();
		this.props.dispatch({
			type: 'SET_AMOUNT',
			data: {
				inputBuy: e.price,
				inputBuyAmount: e.volume,
				inputSide: side,
				setTime: set_time
			}
		})
	}

	render() {
		const { currentTicker, asks, bids, decimals, mobile, mostRecentTrade, spread, mirror, usd_value } = this.props
		const user_orders = this.props.user_orders[currentTicker]
		if (currentTicker == null) {
			return <div></div>;
		}
		var asksIterator = asks.dataSource.beginIterator();
		var asksDataSource = []
		var askVolume = 0
		while (asksIterator.value() !== null && asksDataSource.length < 20) {
			const ask = asksIterator.value()
			askVolume += parseFloat(ask.amount)
			asksDataSource.push({
				...ask,
				price: parseFloat(ask.price).toFixed(decimals.value),
				total: parseFloat(ask.total).toFixed(decimals.maxTotalDecimals),
				volume: askVolume,
				is_user: user_orders && user_orders.includes(parseFloat(ask.price))
			})
			asksIterator = asksIterator.next()
		}
		asksDataSource.reverse()

		var bidsIterator = bids.dataSource.beginIterator();
		var bidsDataSource = []
		var bidVolume = 0
		while (bidsIterator.value() !== null && bidsDataSource.length < 20) {
			const bid = bidsIterator.value()
			bidVolume += parseFloat(bid.amount)
			bidsDataSource.push({
				...bid,
				price: parseFloat(bid.price).toFixed(decimals.value),
				total: parseFloat(bid.total).toFixed(decimals.maxTotalDecimals),
				volume: bidVolume,
				is_user: user_orders && user_orders.includes(parseFloat(bid.price))
			})
			bidsIterator = bidsIterator.next()
		}

		let usd = 0
		if (window.assetsBySymbol) {
			const counter = window.assetsBySymbol[currentTicker.split('/')[1]].id
			usd = usd_value[counter]
		}
		
		if (mirror) {
			const bids_columns = [{
				name: (ticker) => {return "Bids " + ticker.split('/')[0].split('0X')[0]},
				key:"amount",
				type:"number",
				sortable:false,
				color: (value) => {return "theme"},
				fontSize:"base",
				fontWeight:"light",
				float:"left"
			  },{
				name: (ticker) => {return "Price " + ticker.split('/')[1].split('0X')[0]},
				key:"price",
				type:"number",
				sortable:false,
				color: (value) => {return "white"},
				fontSize:"base",
				fontWeight:"light",
				float:"right pr-2"
			  }]

			const asks_columns = [{
				name: (ticker) => {return "Price " + ticker.split('/')[1].split('0X')[0]},
				key:"price",
				type:"number",
				sortable:false,
				color: (value) => {return "white"},
				fontSize:"base",
				fontWeight:"light",
				float:"left pl-2"
			  },{
				name: (ticker) => {return "Asks " + ticker.split('/')[0].split('0X')[0]},
				key:"amount",
				type:"number",
				sortable:false,
				color: (value) => {return "red"},
				fontSize:"base",
				fontWeight:"light",
				float:"right"
			  }]
			return (
				<div className={container + (mobile ? " mobile" : "")}>
				<div className="qt-font-bold qt-font-normal my-3">ORDER BOOK</div>
				<div className="d-flex">
					<QTTableViewSimple key="bid_tv"
						max={bids.max}
						barColor="33,224,219"
						barDir="right"
						dataSource={bidsDataSource}
						columns={bids_columns}
						ticker={currentTicker}
						onAction={this.setAmount.bind(this, 0)}
					/>
					<QTTableViewSimple key="ask_tv" dataSource={asksDataSource.reverse()} 
						max={asks.max}
						barColor="255,35,116"
						barDir="left"
						columns={asks_columns} 
						ticker={currentTicker}
						onAction={this.setAmount.bind(this, 1)}
					/>
				</div>
				</div>
			)
		}

		return (
			<div className={container + (mobile ? " mobile" : "")}>
				<section className="orderbook-title">
					<div className="d-flex justify-content-between align-items-center">
						<div className="qt-font-bold qt-font-normal">ORDER BOOK</div>
						{/* <QTDropdown
							items={this.props.decimals.allowedDecimals}
							value={this.props.decimals.value}
							className="icon-after down light qt-font-small qt-font-semibold"
							width="31"
							height="31"
							onChange={this.updateDigits}/> */}
					</div>
				</section>
				<section className="orderbook-ask no-scroll-bar pushed-margin">
					<div id="ask-section">
						<QTTableViewSimple key="ask_tv" dataSource={asksDataSource} 
							max={asks.max}
							barColor="255,35,116"
							barDir="left"
							columns={asks.columns} 
							ticker={currentTicker}
							onAction={this.setAmount.bind(this, 1)}
						/>
					</div>
				</section>
				<section className="orderbook-middle d-flex justify-content-between">
					<div className="d-flex flex-column justify-content-center">
						<div className="qt-color-theme qt-font-huge qt-font-light">{mostRecentTrade.price}</div>
						{ usd ?
							<div className="text-secondary qt-font-small qt-font-light">
								${(mostRecentTrade.price * usd).toLocaleString(navigator.language, {maximumFractionDigits: 5, minimumFractionDigits: 2})}
								</div>
							: null
						}
					</div>
					<div className="d-flex flex-column justify-content-center">
						<div className="qt-opacity-half qt-font-base text-right">Spread</div>
						<div className="qt-number-small text-right">{spread != undefined ? spread.toFixed(2) + "%" : "-"}</div>
					</div>
				</section>
				<section className="orderbook-bid no-scroll-bar pushed-margin">
					<div>
						<QTTableViewSimple key="bid_tv"
							max={bids.max}
							barColor="33,224,219"
							barDir="left"
							dataSource={bidsDataSource}
							columns={bids.columns}
							HideHeader={true}
							onAction={this.setAmount.bind(this, 0)}
						/>
					 </div>
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	user_orders: state.app.orderBook.user_orders,
  	bids: state.app.orderBook.bids,
  	asks: state.app.orderBook.asks,
	decimals: state.app.orderBook.decimals,
	spread: state.app.orderBook.spread,
	spreadDollar:state.app.orderBook.spreadDollar,
	mostRecentTrade: state.app.mostRecentTrade,
	currentTicker: state.app.currentTicker,
	usd_value: state.app.usd_value,
});

export default connect(mapStateToProps)(OrderBook);
