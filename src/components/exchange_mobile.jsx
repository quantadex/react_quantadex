import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
import TradingHistory from './trading_history.jsx';
import OrderBook from './order_book.jsx';
import Dashboard from './dashboard.jsx';
import MobileHeader from './ui/mobileHeader.jsx';
import Orders from './orders.jsx';
import Trade from './trade.jsx';
import Leaderboard from './leaderboard.jsx'
import Status from './status.jsx'
import FirstTime from './first_time.jsx'
import QTTableView from './ui/tableView.jsx'
import Order from './order.jsx';
import Markets from './markets.jsx';
import OpenOrders from './open_orders.jsx';
import MobileNav from './ui/mobileNav.jsx'

import {switchTicker, initBalance, getMarketQuotes} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

import { css } from 'emotion'
import globalcss from './global-css.js'

import { Link } from 'react-router-dom'

import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
	position: relative;
	height: 100vh;
	width: 100%;

	.exchange-left {
		width:281px;
		padding:22px 20px;
	}

	.exchange-middle {
		padding: 21px 19px;
		flex-grow:1;
		background-color:rgba(17,20,22,1);
		padding-bottom: 0;
	}

	.exchange-right {
		width:300px;
		background-color: rgba(0,0,0,0.26)
	}

	.exchange-bottom {
		position: absolute;
		width: 100%;
		bottom: 0;
		background-color: #23282c;
		z-index: 99;
	}
	
	#tv_chart_container {
		height: calc(100vh - 180px);
		min-height: 370px !important;
	}

	.exchange-dashboard {
		border-bottom: solid 1px #121517;
	}

	.no-scroll-bar {
		position: relative;
		overflow: hidden;
	}
	.no-scroll-bar > div {
		height: 100%;
		box-sizing: content-box;
		position: absolute;
		left: 0;
		right: 0;
		overflow-y: scroll;
	}

	#market-dropdown {
		padding-right: 15px;
		background: url('../public/images/menu-arrow-down.svg') no-repeat 100% 50%;
		cursor: pointer;
	}

	#market-list {
		position: absolute;
		width: 100%;
		height: 0;
		overflow: hidden;
		background-color: #222
		transition: height 0.3s;
		z-index: 10;
	}

	#market-list.active {
		height: calc(100% - 182px);
	}

	.content {
		height: calc(100% - 182px);
	}
`;

class Exchange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTabIndex: 2
		};
	  }

	componentWillReceiveProps(nextProps) {
		if (nextProps.inputSetTime != undefined && nextProps.inputSetTime != this.state.inputSetTime) {
			this.setState({
				inputSetTime: nextProps.inputSetTime,
				selectedTabIndex: 0
			  })
		}
	}

	handleSwitch(index) {
		this.setState({selectedTabIndex: index})
		this.toggleMarketsList(null, true)
	}

	toggleMarketsList(e, force = false) {
		const list = document.getElementById("market-list")
		if (force) {
			list.classList.remove("active")
			return
		}

		if (list.classList.contains("active")) {
			list.classList.remove("active")
		} else {
			list.classList.add("active")
		}
	}

	render() {
		const tabs = {	names: ["Trade", "Orders", "Chart", "Book", "History"],
						selectedTabIndex: 2 }
		const content = [<Trade mobile={true}/>, <Orders mobile={true}/>, <Chart chartTools={false}/>,
						 <OrderBook mobile={true}/>, <TradingHistory mobile={true}/>]
		return (
		<div className={container}>
			<MobileHeader />
			<div className="d-flex qt-font-normal qt-font-bold p-4 justify-content-between border-bottom border-dark">
				<div id="market-dropdown" onClick={this.toggleMarketsList}>MARKETS</div>
				<div>{this.props.currentTicker}</div>
			</div>
			<div id="market-list">
				<Dashboard mobile={true}/>
			</div>
			

			<div className="content">
				{content[this.state.selectedTabIndex]}
			</div>

			<div className="exchange-bottom">
				<MobileNav tabs={tabs} selectedTabIndex={this.state.selectedTabIndex} switchTab={this.handleSwitch.bind(this)} />
				<Status mobile={true} />
			</div>

			{/* { localStorage.getItem("firstTimeComplete") ? null : <FirstTime /> } */}
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
		private_key: state.app.private_key,
		leftOpen: state.app.ui.leftOpen,
		rightOpen: state.app.ui.rightOpen,
		currentTicker: state.app.currentTicker,
		inputSetTime: state.app.setTime,
	});


export default connect(mapStateToProps)(Exchange);
