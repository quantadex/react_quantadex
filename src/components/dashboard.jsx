import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import QTTabBar from './ui/tabBar.jsx'
import {SymbolToken} from './ui/ticker.jsx'
import SearchBox from "./ui/searchBox.jsx";
import { withRouter} from "react-router-dom";
import ReactTooltip from 'react-tooltip'
import Loader from './ui/loader.jsx'

const container = css`
	padding: 20px;
	flex: auto;
	overflow: auto;
	border: 3px solid #000;
	background-color: #23282c;
	cursor: initial;

	.head {
		color: #777;
	}

	.row-item {
		flex: 1;
		line-height: 25px;
		border-bottom: 1px solid #333;
		cursor: pointer;
	}

	.market {
		font-weight: bold;
		.issuer {
			background-color: #5b5a69;
			font-size: 10px;
			font-weight: 100;
			border-radius: 3px;
			padding: 1px 4px;
			margin: 0 3px;
			opacity: 0.7;
		}
	}

	.table-row:hover {
		background-color: rgba(52,62,68,0.3);
	}
	
	&.mobile {
		border: 0;
		background: transparent;
		
		h4 {
			display: none;
		}
		input {
			flex: auto;
		}
		.row-item {
			border-bottom: 1px solid #333;
			line-height: 40px;
		}
	}
`;

class Dashboard extends Component {

	constructor(props) {
		super(props)
		this.state = {
			selectedTab:"All",
			selectedCoin: 0,
			filter: ""
		}
	}

	switchMarket() {
		const { mobile_nav, closeSelf } = this.props
		setTimeout(() => {
			if (mobile_nav) mobile_nav()
			if (closeSelf) closeSelf()
		}, 0)
	}

	handleChange(e) {
		this.setState({filter: e.target.value})
	}

	switchCoin(index) {
		this.setState({selectedCoin: index})
	}

	shortName(market) {
		const pairs = market.split('/')
		const base = pairs[0].split('0X')
		const counter = pairs[1].split('0X')
		
		return `${base[0]}${base[1] ? "0X" + base[1].substr(0,4) : ""}/${counter[0]}${counter[1] ? "0X" + counter[1].substr(0,4) : ""}`
	}

	render() {
		const { markets, mobile, announcements } = this.props
		
		const subtabs = {
			names: Object.keys(markets),
			selectedTabIndex: 0,
		}
		
		return (
			<div className={container + (mobile ? " mobile qt-font-small" : "")} onClick={e => e.stopPropagation()}>
				<div className="d-flex justify-content-between border-bottom border-dark mb-3">
					<h4>MARKETS</h4>
					<SearchBox onChange={this.handleChange.bind(this)} placeholder="Search Pairs" 
						style={{margin: "-7px 0 7px", border: 0, backgroundColor: "rgba(255,255,255,0.07)"}} />
				</div>
				{ announcements ?
					<div className="mb-5" style={{margin: "0 -20px"}}>
						{announcements}
					</div>
				: null
				}
				
				<section className="mb-3">
					<QTTabBar
						className="underline small fluid even-width qt-font-bold d-flex justify-content-start"
						width={58.3}
						tabs={subtabs}
						switchTab={this.switchCoin.bind(this)}
					/>
				</section>
				
				{ markets.length != 0 ?
					<section className="price">
						<div className="head d-flex">
							<div className="row-item">Pairs</div>
							<div className="row-item text-right">Price</div>
							<div className="row-item text-right">
								<img data-tip="The market depth for this<br/> token on the QUANTA Network"
									src={devicePath("public/images/question.png")} /> Depth
							</div>
						</div>
						<ReactTooltip clickable={true} html={true} />
						
						{
							markets[subtabs.names[this.state.selectedCoin]] && markets[subtabs.names[this.state.selectedCoin]].filter(market => this.shortName(market.name).toLowerCase().includes(this.state.filter.toLowerCase())).map((market, index) => {
								
								const { match, location } = this.props
								const url = ("/" + (match.params.net || "mainnet") + "/exchange/" + market.name.replace("/", "_") + location.search)

								let pair = market.name.split('/')
								let usd_price = pair[1] === "ETH" ? window.binance_price["ETHUSDT"] 
												: (pair[1] === "BTC" ? window.binance_price["BTCUSDT"] 
													: pair[1].startsWith("TUSD") || pair[1] == "USD" ? 1 : 0)
								return (
									<Link key={index} to={url} className="table-row d-flex" onClick={() => this.switchMarket()}>
										<div className="row-item market"><SymbolToken name={pair[0]} showIcon={false} withLink={false} /></div>
										<div className="row-item text-right">{market.last == 0 ? "-" : market.last}</div>
										<div className="row-item text-right">{window.allMarketsByHash[market.name].depth == 0 || usd_price == 0 ? "-" : "$" + Math.round(window.allMarketsByHash[market.name].depth * parseFloat(usd_price))}</div>
									</Link>
								)
							})
						}
					</section>
				: <Loader size="50px" />
				}
			</div>
		);
	}
}

// lodash.sortBy(this.props.markets[subtabs.names[this.state.selectedCoin]], 'base_volume')

const mapStateToProps = (state) => ({
	markets: state.app.markets
});

export default connect(mapStateToProps)(withRouter (Dashboard));
