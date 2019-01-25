import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
import DepthChart from './chart_depth.jsx';
import TradingHistory from './trading_history.jsx';
import OrderBook from './order_book.jsx';
import Dashboard from './dashboard.jsx';
import Menu from './menu.jsx';
import Orders from './orders.jsx';
import Trade from './trade.jsx';
import Leaderboard from './leaderboard.jsx'
import Status from './status.jsx'
import FirstTime from './first_time.jsx'
import QTTableView from './ui/tableView.jsx'
import Order from './order.jsx';
import Markets from './markets.jsx';
import OpenOrders from './open_orders.jsx';

import {switchTicker, initBalance, getMarketQuotes} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

import { css } from 'emotion'
import globalcss from './global-css.js'

import { Link } from 'react-router-dom'

import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
	position: relative;

	.exchange-left {
		width:281px;
		padding:22px 20px;
	}

	.exchange-middle {
		position: relative;
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
		bottom: 0;
		background-color: #23282c;
		justify-content: center;
		border-top: 3px solid black;
		z-index: 99;
	}
	
	#tv_chart_container, #depth_chart_container {
		height: calc(100vh - 530px);
		min-height: 370px !important;
		padding-bottom: 20px;
		border-bottom: 1px solid #333;
	}

	.switch-chart {
		position: absolute;
		right: 20px;
		margin-top: 10px;
		z-index: 1;

		button {
			margin-left: 10px;
			padding: 5px 10px;
			font-size: 12px;
			border-radius: 20px;
			font-weight: bold;
			background: #111;
			color: #ddd;
			border: 2px solid #333;
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
		margin-right: -10px;
	}
	.no-scroll-bar > div {
		height: 100%;
		position: absolute;
		padding-right: 5px;
		left: 0;
		right: 0;
		overflow-y: scroll;

		::-webkit-scrollbar {
			width: 6px;
			height: 6px;
		}
		
		::-webkit-scrollbar-track {
		background: transparent; 
		}
		
		::-webkit-scrollbar-thumb {
		background: rgba(255,255,255,0.1); 
		border-radius: 10px;
		}
		
		::-webkit-scrollbar-thumb:hover {
		background: rgba(255,255,255,0.2); 
		}

		scrollbar-width: thin;
		scrollbar-color: rgba(255,255,255,0.1) transparent;
	}

	
`;

class Exchange extends Component {
	constructor(props) {
		super(props)
		this.state = {
			chart: "tv"
		}
		
	}

	toggleChart(chart) {
		console.log(chart)
		this.setState({ chart: chart })
	}

	render() {
		const Switchchart = () => {
			return(
				<div className="switch-chart d-flex" >
					<button className={this.state.chart === "tv" ? "active": ""} onClick={() => this.toggleChart("tv")}>TradingView</button>
					<button className={this.state.chart === "depth" ? "active": ""} onClick={() => this.toggleChart("depth")}>Depth</button>
				</div>
			)
		}
		return (
		<div className={container + " container-fluid"}>
			<div className="row flex-nowrap" style={{overflow:"hidden",minHeight:"calc(100vh - 120px)"}}>
				<div className="exchange-left" style={{ display: this.props.leftOpen ? 'block': 'none'}}>
					<OrderBook />
				</div>
				<div className="exchange-middle">
					<Header />
						<Switchchart />
						<Chart chartTools={true} className={this.state.chart === "tv" ? "d-block": "d-none"} />
						<DepthChart  className={this.state.chart === "depth" ? "d-block": "d-none"} />
					<div className="d-flex">
						<Dashboard />
						<Trade />
					</div>
					
				</div>
				<div className="exchange-right" style={{ display: this.props.rightOpen ? 'block' : 'none'}}>
					<Menu />
					<Leaderboard />

					<TradingHistory />
				</div>
			</div>
			<div className="row exchange-bottom">
				<Orders />
				<Status />
			</div>
			{ localStorage.getItem("firstTimeComplete") ? null : <FirstTime /> }
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
		private_key: state.app.private_key,
		leftOpen: state.app.ui.leftOpen,
		rightOpen: state.app.ui.rightOpen,
		currentTicker: state.app.currentTicker,
	});


export default connect(mapStateToProps)(Exchange);
