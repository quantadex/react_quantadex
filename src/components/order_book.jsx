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
		height: 40vh;
		min-height:260px;
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
		padding: 0 15px;
		.orderbook-ask, .orderbook-bid {
			height: calc(50vh - 132px);
			min-height: auto;
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
		const set_time = new Date();
		this.props.dispatch({
			type: 'SET_AMOUNT',
			data: {
				inputBuy: e.price,
				inputBuyAmount: e.amount,
				inputSide: side,
				setTime: set_time
			}
		})
	}

	render() {
		// const asksDataSource = lodash.takeRight(this.props.asks.dataSource,20).map((ask) => {
		// 	return {
		// 		...ask,
		// 		price: parseFloat(ask.price).toFixed(this.props.decimals.value),
		// 		total: parseFloat(ask.total).toFixed(this.props.decimals.maxTotalDecimals)
		// 	}
		// })
		
		var asksIterator = this.props.asks.dataSource.beginIterator();
		var asksDataSource = []
		while (asksIterator.value() !== null && asksDataSource.length < 20) {
			const ask = asksIterator.value()
			asksDataSource.push({
				...ask,
				price: parseFloat(ask.price).toFixed(this.props.decimals.value),
				total: parseFloat(ask.total).toFixed(this.props.decimals.maxTotalDecimals)
			})
			asksIterator = asksIterator.next()
		}

		asksDataSource.reverse()


		var bidsIterator = this.props.bids.dataSource.beginIterator();
		var bidsDataSource = []
		while (bidsIterator.value() !== null && bidsDataSource.length < 20) {
			const bid = bidsIterator.value()
			bidsDataSource.push({
				...bid,
				price: parseFloat(bid.price).toFixed(this.props.decimals.value),
				total: parseFloat(bid.total).toFixed(this.props.decimals.maxTotalDecimals)
			})
			bidsIterator = bidsIterator.next()
		}

		return (
			<div className={container + (this.props.mobile ? " mobile" : "")}>
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
				<section className="orderbook-ask no-scroll-bar">
					<div id="ask-section">
						<QTTableViewSimple key="ask_tv" dataSource={asksDataSource} 
							columns={this.props.asks.columns} 
							ticker={this.props.currentTicker}
							onAction={this.setAmount.bind(this, 1)}
						/>
					</div>
				</section>
				<section className="orderbook-middle d-flex justify-content-between">
					<div className="d-flex flex-column justify-content-center">
						<div className="qt-color-theme qt-font-huge qt-font-light">{this.props.mostRecentTrade.price}</div>
						{/* <div className="qt-number-normal qt-opacity-64">{this.props.spreadDollar}</div> */}
					</div>
					<div className="d-flex flex-column justify-content-center">
						<div className="qt-opacity-half qt-font-base text-right">Spread</div>
						<div className="qt-number-small text-right">{this.props.spread != undefined ? this.props.spread.toFixed(2) + "%" : "N/A"}</div>
					</div>
				</section>
				<section className="orderbook-bid no-scroll-bar">
					<div>
						<QTTableViewSimple key="bid_tv"
							dataSource={bidsDataSource}
							columns={this.props.bids.columns}
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
  	bids: state.app.orderBook.bids,
  	asks: state.app.orderBook.asks,
	decimals: state.app.orderBook.decimals,
	spread: state.app.orderBook.spread,
	spreadDollar:state.app.orderBook.spreadDollar,
	mostRecentTrade: state.app.mostRecentTrade,
	currentTicker:state.app.currentTicker,
	});

export default connect(mapStateToProps)(OrderBook);
