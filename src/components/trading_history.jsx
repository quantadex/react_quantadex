import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'

import QTTabBar from './ui/tabBar.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	padding: 18px 21px;

	.trading-history-table-container {
		h4 {
			padding-bottom: 10px;
			border-bottom: 1px solid #333;
			margin-bottom: 10px;
		}
	}
`;

class TradingHistory extends Component {

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

				<section className="trading-history-table-container">
					<h4>TRADING HISTORY</h4>
					<QTTableViewSimple dataSource={this.props.trades.dataSource} columns={this.props.trades.columns} />
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  	trades: state.app.trades
	});

export default connect(mapStateToProps)(TradingHistory);
