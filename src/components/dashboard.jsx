import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'
import QTTabBar from './ui/tabBar.jsx'
import {SymbolToken} from './ui/ticker.jsx'
import SearchBox from "./ui/searchBox.jsx";
import { withRouter} from "react-router-dom";
import ReactTooltip from 'react-tooltip'

const container = css`
	padding: 20px;
	flex: auto;
	overflow: auto;
	border: 3px solid #000;
	background-color: #23282c;
	cursor: initial;

 	table {
	  width: 100%;
	  thead {
		  color: #777;
	  }
	  tr {
		  border-bottom: 1px solid #333;
		  cursor: pointer;
	  }
	  tbody tr:hover {
		  background-color: rgba(52,62,68,0.3);
	  }
	  .market {
		  font-weight: bold;
		  line-height: 25px;
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
		table tr {
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

	switchMarket(e) {
		const { mobile_nav, closeSelf, history, match, location } = this.props

		if (mobile_nav) mobile_nav()
		if (closeSelf) closeSelf()

		history.push("/" + (match.params.net || "mainnet") + "/exchange/" + e.replace("/", "_") + location.search)
	}

	handleChange(e) {
		this.setState({filter: e.target.value})
	}

	switchCoin(index) {
		this.setState({selectedCoin: index})
	}

	render() {
		const { markets, mobile } = this.props
		
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
				{/* <section className="menu d-flex justify-content-start qt-font-extra-small qt-font-light text-center">
					<QTTabBar
						className="block medium fluid qt-font-regular d-flex justify-content-start"
						tabs = {tabs}
					/>
				</section> */}
				<section className="mb-3">
					<QTTabBar
						className="underline small fluid even-width qt-font-bold d-flex justify-content-start"
						width={58.3}
						tabs={subtabs}
						switchTab={this.switchCoin.bind(this)}
					/>
				</section>
				
				<section className="price">
					
					<table>
						<thead>
							<tr>
								<td>Pairs</td>
								<td className="text-right">Price</td>
								<td className="text-right">
									<img data-tip="The market depth for this<br/> token on the QUANTA Network"
										src={devicePath("public/images/question.png")} /> Depth
								</td>
							</tr>
						</thead>
						<tbody>
							{
								markets[subtabs.names[this.state.selectedCoin]] && markets[subtabs.names[this.state.selectedCoin]].filter(market => market.name.toLowerCase().includes(this.state.filter.toLowerCase())).map((market, index) => {
									let pair = market.name.split('/')
									let usd_price = pair[1] === "ETH" ? window.binance_price["ETHUSDT"] 
													: (pair[1] === "BTC" ? window.binance_price["BTCUSDT"] 
														: pair[1].startsWith("TUSD") || pair[1] == "USD" ? 1 : 0)
									return <tr key={index} onClick={() => this.switchMarket(market.name)}>
										<td className="market">
											<SymbolToken name={pair[0]} showIcon={false} withLink={false} />
										</td>
										<td className="text-right">{market.last == 0 ? "-" : market.last}</td>
										<td className="text-right">{window.allMarketsByHash[market.name].depth == 0 || usd_price == 0 ? "-" : "$" + Math.round(window.allMarketsByHash[market.name].depth * parseFloat(usd_price))}</td>
									</tr>
								})
							}
						</tbody>
					</table>
				</section>
				<ReactTooltip clickable={true} data-place="left" multiline={true}/>
			</div>
		);
	}
}

// lodash.sortBy(this.props.markets[subtabs.names[this.state.selectedCoin]], 'base_volume')

const mapStateToProps = (state) => ({
	markets: state.app.markets,
	favoriteList: state.app.favoriteList
});

export default connect(mapStateToProps)(withRouter (Dashboard));
