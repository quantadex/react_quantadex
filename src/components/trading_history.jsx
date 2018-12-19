import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'

import QTTabBar from './ui/tabBar.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	height: 360px;
	padding: 18px 21px;

	.trading-history-table-container {
		height: 100%;
		h4 {
			padding-bottom: 10px;
			border-bottom: 1px solid #333;
			margin-bottom: 10px;
		}
		thead th {
			position: sticky;
			position: -webkit-sticky;
			top: 0;
			background: #191e21;
			z-index: 1;
		}
	}
`;

class TradingHistory extends Component {
	setAmount(e) {
		console.log(e)
		const set_time = new Date();
		this.props.dispatch({
			type: 'SET_AMOUNT',
			data: {
				inputBuy: e.price,
				inputBuyAmount: e.amount,
				inputSide: e.color_key,
				setTime: set_time
			}
		})
	}

	render() {
		const tabs = {
			names: ['TRADING HISTORY','MY TRADES'],
			selectedTabIndex: 0,
		}

		return (
			<div className={container}>
				{/* <QTTabBar
					className="underline small fluid even-width qt-font-bold d-flex justify-content-between"
					width={122.9}
					tabs = {tabs}
				/> */}

				<section className="trading-history-table-container no-scroll-bar">
					<h4>TRADING HISTORY</h4>
					<div>
						<QTTableViewSimple dataSource={this.props.trades.dataSource} columns={this.props.trades.columns}
											onAction={this.setAmount.bind(this)} />
					</div>
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  	trades: state.app.trades
	});

export default connect(mapStateToProps)(TradingHistory);
