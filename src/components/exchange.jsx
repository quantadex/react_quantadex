import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
import History from './history.jsx';
import BidAsk from './bidask.jsx';
import Order from './order.jsx';
import Markets from './markets.jsx';
import OpenOrders from './open_orders.jsx';

import {switchTicker} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

class Exchange extends Component {
	componentDidMount() {
		this.props.dispatch(switchTicker("BTC/USD"));
	}

	render() {
		return (
    <div className="">
      <div className="col-md-10" style={{padding: 0}}>
        <Header className="col-md-12 row p0"/>
				<div className="row">
					<div className="col-md-3 p0" style={{height: '100%'}}>
						<BidAsk />
					</div>        
					<div className="col-md-9">
						<Chart />
						<Order />
					</div>
				</div>
      </div>
      <div className="col-md-2 p0">
				<Markets/>
        <History/>
      </div>
      <div className="col-md-12 row">
				<OpenOrders/>
			</div>			
    </div>
		);
	}
}

export default connect()(Exchange);