import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'

import QTTabBar from './ui/tabBar.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	padding: 18px 21px;

	.trading-history-table-container {
		margin-top: 22px;
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
				<QTTabBar
					className="underline small fluid even-width qt-font-bold d-flex justify-content-between"
					width={122.9}
					tabs = {tabs}
				/>

				<section className="trading-history-table-container">
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
