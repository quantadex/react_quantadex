import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import { SmallToken } from './ui/ticker.jsx'

import { css } from 'emotion'
import globalcss from './global-css.js'
import QTTabBar from './ui/tabBar.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'
import {switchTicker} from "../redux/actions/app.jsx";
import SearchBox from "./ui/searchBox.jsx";

const container = css`
	padding: 20px;
	flex: auto;
	overflow: auto;
	border: 3px solid #000;
	background-color: #23282c;
	cursor: initial;
	
	.coin-tabbar {
		padding:10px 21px;
	}

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
		h4 {
			display: none;
		}
		input {
			flex: auto;
		}
		table tr {
			border-bottom: 1px solid #333;
		}
	}
`;

class Dashboard extends Component {

	constructor(props) {
		super(props)
		this.state = {
			selectedTab:"All",
			filter: ""
		}
	}

	switchMarket(e) {
		this.props.dispatch(switchTicker(e))
		if (this.props.mobile) {
			const list = document.getElementById("market-list")
			if (list.classList.contains("active")) {
				list.classList.remove("active")
			} else {
				list.classList.add("active")
			}
		}
	}

	handleChange(e) {
		this.setState({filter: e.target.value})
	}

	render() {
		const tabs = {
			names: ['All','Trading','Favorites'],
			selectedTabIndex: 0
		}

		const subtabs = {
			names: ['BTC','ETH','XMR','USDT'],
			selectedTabIndex: 0,
		}

		return (
			<div className={container + (this.props.mobile ? " mobile" : "")}>
        {/* <section className="menu d-flex justify-content-start qt-font-extra-small qt-font-light text-center">
					<QTTabBar
						className="block medium fluid qt-font-regular d-flex justify-content-start"
					 	tabs = {tabs}
					/>
        </section>
				<section className="coin-tabbar">
					<QTTabBar
						className="underline small fluid even-width qt-font-bold d-flex justify-content-between"
						width={58.3}
						tabs = {subtabs}
					/>
				</section> */}
				
        <section className="price">
			<div className="d-flex justify-content-between border-bottom border-dark mb-3">
				<h4>MARKETS</h4>
				<SearchBox onChange={this.handleChange.bind(this)} placeholder="Search Pairs" 
					style={{margin: "-7px 0 7px", border: 0, backgroundColor: "rgba(255,255,255,0.07)"}} />
			</div>
			
			<table>
				<thead>
					<tr>
						<td>Pairs</td>
						<td className="text-right">Price</td>
						<td className="text-right">Volume</td>
					</tr>
				</thead>
				<tbody>
							{
								this.props.markets.filter(market => market.name.toLowerCase().includes(this.state.filter)).map((market, index) => {
									return <tr key={index} onClick={this.switchMarket.bind(this, market.name)}>
										<td className="market">
											{market.name}
										</td>
										<td className="text-right">{market.last}</td>
										<td className="text-right">{market.base_volume}</td>
									</tr>
								})
							}
				</tbody>
			</table>
        </section>
			</div>
		);
	}
}


const mapStateToProps = (state) => ({
	markets: state.app.markets,
	favoriteList: state.app.favoriteList
});

export default connect(mapStateToProps)(Dashboard);
