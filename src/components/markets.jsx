import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import lodash from 'lodash';
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

class Markets extends Component {
	render() {
		return (
			<div className={container}>
				<div className="header">Markets</div>
				<div className="subheader">
					<div className="col-md-4 text-center">
						Pair
					</div>
					<div className="col-md-4 text-center">
						Price
					</div>
					<div className="col-md-4 text-center">
						Change
					</div>
				</div>
				<div>
					{this.props.markets.map((e) => {
						const fmtChange = lodash.round(e.change*100, 2);

						return <div className="row" key={e.ticker}>
										<div className="col-md-4">
											{e.ticker}
										</div>
										<div className="col-md-4 text-center">
											{e.close}
										</div>
										<div className="col-md-4 text-right">
											{isNaN(fmtChange) ? "N/A" : fmtChange + "%" }
										</div>
									</div>
					})}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  	markets: state.app.markets || []
	});

export default connect(mapStateToProps)(Markets);