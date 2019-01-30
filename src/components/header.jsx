import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { TOGGLE_LEFT_PANEL, TOGGLE_RIGHT_PANEL } from '../redux/actions/app.jsx'
import { css } from 'emotion'
import Ticker from './ui/ticker.jsx';
import Dashboard from './dashboard.jsx';

const container = css`
	margin: 5px 0;
	padding: 10px 20px;
	width: 100%;
	border-right: 2px solid #444;

	.header-slogan {
		margin-left: 8.5px;
		display:inline-block;
		letter-spacing: 1px;
		font-family: Multicolore;
	}

	.header-coin-name {
		background: url('/public/images/big-arrow-down.svg') no-repeat 100%;
		padding-right: 25px;
    	font-size: 18px;
	}

	.price-stats {
		width: 100%;
		margin: 0 40px;

		label {
			margin-bottom: 0;
			color: #666;
		}
	}

	.markets {
		position: absolute;
		right: -23px;
		top: 47px;
		width: 315px;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s;
		z-index: 2;
	}
	.markets.active {
		max-height: 100vh;
	}
`;

class Header extends Component {
	constructor(props) {
		super(props)
		this.state = {
			toggle_market: false
		}
	}

	handleMarketClick() {
		this.setState({ toggle_market: !this.state.toggle_market })
	}

	render() {
		return (
			<div className={container}>
				<div className="d-flex justify-content-between">
					<div className="d-flex">
						<Link to="/exchange" className="header-logo"><img src="/public/images/logo-light.svg" width="220" /></Link>
						
					</div>
					<div className="price-stats d-flex">
						<div>
							<label>Last Price</label><br/>
							<span className="value">{this.props.currentPrice}</span>
						</div>
					</div>
					<div className="d-flex align-items-center position-relative cursor-pointer" onClick={this.handleMarketClick.bind(this)}>
						<span className="header-coin-name qt-font-normal qt-font-bold qt-color-theme">
							<Ticker ticker={this.props.currentTicker} />
						</span>
						<div className={"markets" + (this.state.toggle_market ? " active" : "")}>
							<Dashboard />
						</div>
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
