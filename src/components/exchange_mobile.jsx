import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
import DepthChart from './chart_depth.jsx';
import TradingHistory from './trading_history.jsx';
import OrderBook from './order_book.jsx';
import Dashboard from './dashboard.jsx';
import MobileHeader from './ui/mobileHeader.jsx';
import Orders from './orders.jsx';
import Trade from './trade.jsx';
import ConnectDialog, { ConnectLink, Connect } from './connect.jsx';
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

	.exchange-bottom {
		position: fixed;
		width: 100%;
		bottom: 0;
		background-color: #23282c;
		z-index: 99;
	}
	
	#tv_chart_container, #depth_chart_container {
		height: calc(100vh - 180px);
		min-height: 370px !important;
	}

	.switch-chart {
		position: absolute;
		flex-flow: column;
		right: 20px;
		margin-top: 10px;
		z-index: 1;

		button {
			margin-bottom: 10px;
			padding: 5px 10px;
			font-size: 12px;
			border-radius: 20px;
			font-weight: bold;
			background: #111;
			color: #ddd;
			border: 2px solid #333;
			cursor: pointer;
		}
		button.active {
			color: #50b3b7;
			border-color: #50b3b7;
		}
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
			selectedTabIndex: 2,
			chart: "tv"
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

	toggleChart(chart) {
		this.setState({ chart: chart })
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

		const ChartContent = () => {
			return (
				<div>
					<Switchchart />
					<Chart chartTools={false}  className={this.state.chart === "tv" ? "d-block": "d-none"} />
					<DepthChart  className={this.state.chart === "depth" ? "d-block": "d-none"} />
				</div>
			)
		}
		const content = [this.props.private_key ? <Trade mobile={true} /> : <Connect />, 
						this.props.private_key ? <Orders mobile={true}/> : <Connect /> , 
						<ChartContent />, <OrderBook mobile={true}/>, <TradingHistory mobile={true}/>]
		const Switchchart = () => {
			return(
				<div className="switch-chart d-flex">
					<button className={this.state.chart === "tv" ? "active": ""} onClick={() => this.toggleChart("tv")}>Price</button>
					<button className={this.state.chart === "depth" ? "active": ""} onClick={() => this.toggleChart("depth")}>Depth</button>
				</div>
			)
		}
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
			{this.props.private_key ? "" : <ConnectDialog isMobile={true}/>}
			{/* { localStorage.getItem("firstTimeComplete") ? null : <FirstTime mobile={true}/> } */}
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