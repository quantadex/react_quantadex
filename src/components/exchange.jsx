import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
import TradingHistory from './trading_history.jsx';
import OrderBook from './order_book.jsx';
import Dashboard from './dashboard.jsx';
import Menu from './menu.jsx';
import Orders from './orders.jsx';
import Trade from './trade.jsx';
import QTTableView from './ui/tableView.jsx'
import Order from './order.jsx';
import Markets from './markets.jsx';
import OpenOrders from './open_orders.jsx';

import {switchTicker, initBalance} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

import { css } from 'emotion'
import globalcss from './global-css.js'

import { Link } from 'react-router-dom'

import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};

	.exchange-left {
		width:281px;
		padding:22px 20px;
	}

	.exchange-middle {
		padding: 21px 19px;
		flex-grow:1;
		background-color:rgba(17,20,22,1);
	}

	.exchange-right {
		width:300px;
		background-color: rgba(0,0,0,0.26)
	}

	.exchange-bottom {
		padding: 20px 35px;
		width:100%;
	}

	#tv_chart_container {
		height:370px !important;
	}

	.exchange-dashboard {
		border-bottom: solid 1px #121517;
	}

`;

class Exchange extends Component {
	componentDidMount() {
		this.props.dispatch(switchTicker("BTC/USD"));
		this.props.dispatch(initBalance());
	}

	render() {
		const windowHeight = window.screen.availHeight - 60;
		return (
		<div className={container + " container-fluid"}>
			<div className="row flex-nowrap" style={{overflow:"hidden",height:windowHeight+"px",borderBottom:"3px solid black"}}>
				<div className="exchange-left" style={{ display: this.props.leftOpen ? 'block': 'none'}}>
					<OrderBook />
				</div>
				<div className="exchange-middle">
					<Header />
					<Chart />
					<Trade />
				</div>
				<div className="exchange-right" style={{ display: this.props.rightOpen ? 'block' : 'none'}}>
					<Menu />
					<div className="exchange-dashboard">
						<Dashboard />
					</div>

					<TradingHistory />
				</div>
			</div>
			<div className="row">
				<div className="exchange-bottom">
					<Orders />
				</div>
			</div>
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
		leftOpen: state.app.ui.leftOpen,
		rightOpen: state.app.ui.rightOpen,
	});


export default connect(mapStateToProps)(Exchange);
