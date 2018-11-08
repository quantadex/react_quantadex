import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'
import moment from 'moment';
import API from "../api.jsx"

const container = css`
	font-size: 12px;
	border: 1px solid #ccc;
	padding: 5px;

	div.header {
		font-weight: bold;
		background-color: #f4f4f4;
		margin: -5px;
		padding: 5px;
		margin-bottom: 5px;
	}

	div.subheader {
		color: #666;
	}


`;


class OpenOrders extends Component {

	onCancel(id) {
		console.log("Cancel ", id)
		API.cancel(id).then((e) => {
			$.pnotify({
					title: Messages("java.api.messages.trade.tradecancelled"),
					text: Messages("java.api.messages.trade.tradecancelledsuccessfully"),
					styling: 'bootstrap',
					type: 'success',
					text_escape: true
			});
		});
	}

	render() {
		return (
			<div className={container}>
				<div className="header">Open Orders</div>
				<div className="subheader row">
					<div className="col-md-2 text-left">
						DATE
					</div>
					<div className="col-md-1 text-left">
						PAIR
					</div>
					<div className="col-md-1 text-left">
						TYPE
					</div>
					<div className="col-md-1 text-left">
						SIDE
					</div>
					<div className="col-md-1 text-left">
						PRICE
					</div>					
					<div className="col-md-1 text-left">
						AMOUNT
					</div>		
					<div className="col-md-1 text-left">
						FILLED
					</div>							
					<div className="col-md-2 text-left">
						TOTAL
					</div>							
					<div className="col-md-2 text-left">
						ACTION
					</div>							
				</div>
				<div>
					{this.props.openOrders.map((e) => {
						return (<div className="row" key={e.id.toString()}>
							<div className="col-md-2 text-left">
								{moment(e.created).format("M-D LTS")}
							</div>
							<div className="col-md-1 text-left">
								{e.base}/{e.counter}
							</div>
							<div className="col-md-1 text-left">
								Limit
							</div>
							<div className="col-md-1 text-left">
								{e.typ == "bid" ? "BUY" : "SELL"}
							</div>
							<div className="col-md-1 text-left">
								{e.price}
							</div>					
							<div className="col-md-1 text-left">
								{e.total}
							</div>		
							<div className="col-md-1 text-left">
								{Math.round((1 - (parseFloat(e.unfilled) / parseFloat(e.total))) * 100)} %
							</div>							
							<div className="col-md-2 text-left">
								{e.price * parseFloat(e.total)}
							</div>							
							<div className="col-md-2 text-left">
								<button className="btn btn-xs btn-default" onClick={() => this.onCancel(e.id)}>Cancel</button>
							</div>							
					</div>);
					})}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	openOrders: state.app.openOrders
});

export default connect(mapStateToProps)(OpenOrders);