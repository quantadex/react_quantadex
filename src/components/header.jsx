import React, { Component } from 'react';
import { connect } from 'react-redux'

import { css } from 'emotion'

const container = css`
	font-size: 12px;
	height: 50px;
	padding-top: 5px;

	div.ticker {
		font-size: 18px;
	}
	div.headerLabel {
		color: #666;
	}
`;

class Header extends Component {
	render() {
		return (
			<div  className={this.props.className}>
				<div className={container + " row"}>
					<div className="col-md-2 text-left ticker">
						{this.props.currentTicker}
					</div>
					<div className="col-md-2">
						<div className="headerLabel">Last Price</div>
						<div className="headerValue">{this.props.currentPrice}</div>
					</div>
					<div className="col-md-2">
						<div className="headerLabel">24h Change</div>
						<div className="headerValue"></div>
					</div>
					<div className="col-md-2">
						<div className="headerLabel">24h High</div>
						<div className="headerValue"></div>
					</div>
					<div className="col-md-2">
						<div className="headerLabel">24h Low</div>
						<div className="headerValue"></div>
					</div>
					<div className="col-md-2">
						<div className="headerLabel">24h Volume</div>
						<div className="headerValue"></div>
					</div>				
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
		currentTicker: state.app.currentTicker,
		currentPrice: state.app.currentPrice		
	});

export default connect(mapStateToProps)(Header);