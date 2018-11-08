import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'

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

class History extends Component {
	render() {
		return (
			<div className={container}>
				<div className="header">Trading History</div>
				<div className="subheader">
					<div className="col-md-4 text-center">
						Date
					</div>
					<div className="col-md-4 text-center">
						Price
					</div>
					<div className="col-md-4 text-center">
						Amount
					</div>
				</div>
				<div>
					{this.props.history.map((e, index) => {
						return <div className="row" key={index}>
										<div className="col-md-4 text-left">
											{moment(e.created).format('HH:mm:ss')}
										</div>
										<div className="col-md-4">
											{e.price}
										</div>
										<div className="col-md-4 text-center">
											{e.amount}
										</div>
									</div>
					})}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  	history: state.app.tradeHistory
	});

export default connect(mapStateToProps)(History);