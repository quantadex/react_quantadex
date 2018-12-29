import React, { Component } from 'react';
import { connect } from 'react-redux'
import { TOGGLE_LEFT_PANEL, TOGGLE_RIGHT_PANEL } from '../redux/actions/app.jsx'
import { css } from 'emotion'
import Ticker from './ui/ticker.jsx';

const container = css`
	padding-bottom:10px;

	.header-logo {
		margin-left: 18px;
	}

	.header-slogan {
		margin-left: 8.5px;
		display:inline-block;
		letter-spacing: 1px;
		font-family: Multicolore;
	}

	.header-coin-name {
		margin-right: 8px;
	}

	.header-coin-value {
		margin-right: 20px;
	}
`;

class Header extends Component {
	render() {
		return (
			<div className={container}>
				<div className="d-flex justify-content-between">
					<div className="d-flex align-items-center">
						<a><img src="/public/images/close-left.svg" width="20" height="20" onClick={() => {
								this.props.dispatch({
									type: TOGGLE_LEFT_PANEL
								})
							}}/></a>
						<a href="/exchange" className="header-logo"><img src="/public/images/qdex-fantasy-light.svg" width="220" height="26" /></a>
					</div>
					<div className="d-flex align-items-center">
						<span className="header-coin-name qt-font-normal qt-font-bold"><Ticker ticker={this.props.currentTicker} /></span>
						<span className="header-coin-value qt-font-normal qt-font-light qt-color-theme">{this.props.currentPrice}</span>
						<a><img src="/public/images/close-right.svg" width="20" height="20" onClick={() => {
								this.props.dispatch({
									type: TOGGLE_RIGHT_PANEL
								})
							}} /></a>
					</div>
        </div>
			</div>
		);
	}
}

/*
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
*/


const mapStateToProps = (state) => ({
		currentTicker: state.app.currentTicker,
		currentPrice: state.app.mostRecentTrade.price
	});

export default connect(mapStateToProps)(Header);
