import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
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
	
	#tv_chart_container {
		height: calc(100vh - 530px);
		min-height: 370px !important;
		padding-bottom: 20px;
		border-bottom: 1px solid #333;
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
		padding-right: 10px;
		box-sizing: content-box;
		position: absolute;
		left: 0;
		right: -25px;
		overflow-y: scroll;
	}
`;

class Exchange extends Component {
	componentDidMount() {
		if (!this.props.private_key) {
			this.props.history.push("/login")
		} else {
			this.props.dispatch(switchTicker("QDEX/ETH"));
			//this.props.dispatch(initBalance());
		}

		// document.getElementsByClassName("row flex-nowrap")[0].style.paddingBottom = document.getElementsByClassName("exchange-bottom")[0].offsetHeight + "px";
	}

	render() {
		return (
		<div className={container + " container-fluid"}>
			<div className="row flex-nowrap" style={{overflow:"hidden",minHeight:"calc(100vh - 120px)"}}>
				<div className="exchange-left" style={{ display: this.props.leftOpen ? 'block': 'none'}}>
					<OrderBook />
				</div>
				<div className="exchange-middle">
					<Header />
						<Chart chartTools={true}/>
					<Dashboard />
					<Trade />
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
	});


export default connect(mapStateToProps)(Exchange);
