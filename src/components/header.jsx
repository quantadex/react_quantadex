import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import Ticker from './ui/ticker.jsx';
import Dashboard from './dashboard.jsx';
import { ConnectDialog } from './connect.jsx';
import BuyQdex from './buy_qdex.jsx'

const container = css`
	margin: 5px 0;
	height: 52px;
	padding: 10px 20px;
	width: 100%;
	border-right: 2px solid #444;

	.header-slogan {
		margin-left: 8.5px;
		display:inline-block;
		letter-spacing: 1px;
		font-family: Multicolore;
	}

	.leaderboard-link, .header-coin-name {
		padding-right: 25px;
    	font-size: 18px;
	}

	.header-coin-name {
		white-space: nowrap;
		background: url(${devicePath("public/images/big-arrow-down.svg")}) no-repeat 100%;
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
		top: 44px;
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
		super(props);
		this.state = {
			showMarkets: false
		}
	}

	render() {
		const { network, currentTicker, dispatch, connectDialog, buyQdexDialog } = this.props
		const { showMarkets } = this.state
		return (
			<div className={container}>
				<div className="d-flex justify-content-between align-items-center">
					<div className="w-100">
						<Link to={"/" + network + "/exchange/" + (currentTicker ? currentTicker.replace("/", "_") : "")} className="header-logo">
							<img src={network == "mainnet" ? devicePath("public/images/logo.svg") : devicePath("public/images/qdex-fantasy-light.svg")} width="220" />
						</Link>
						
					</div>
					{/* <div className="price-stats d-flex">
						<div>
							<label>Last Price</label><br/>
							<span className="value">{this.props.currentPrice}</span>
						</div>
					</div> */}

					{network == "testnet" ?
						<div className="leaderboard-link">
							<Link to={"/" + network + "/leaderboard"}>LEADERBOARD</Link>
						</div>
					: "" }

					<div className="d-flex align-items-center position-relative cursor-pointer" 
						onClick={() => this.setState({showMarkets: !showMarkets})}>
						<span className="header-coin-name qt-font-normal qt-font-bold qt-color-theme">
							<Ticker ticker={currentTicker} />
						</span>
						<div id="market-list" className={"markets" + (showMarkets ? " active" : "")}>
							<Dashboard closeSelf={() => this.setState({showMarkets: false})} />
						</div>
					</div>
					
        		</div>
				{ connectDialog ? 
					<ConnectDialog default={connectDialog} 
						network={network} 
						dispatch={dispatch}/> 
					: null
				}
				{ buyQdexDialog ?
                    <BuyQdex />
                    : null
                }
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
		network: state.app.network,
		private_key: state.app.private_key,
		currentTicker: state.app.currentTicker,
		currentPrice: state.app.mostRecentTrade.price,
		connectDialog: state.app.ui.connectDialog,
		buyQdexDialog: state.app.ui.buyQdexDialog,
	});

export default connect(mapStateToProps)(Header);
