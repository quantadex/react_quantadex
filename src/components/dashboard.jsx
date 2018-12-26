import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import { SmallToken } from './ui/ticker.jsx'

import { css } from 'emotion'
import globalcss from './global-css.js'
import QTTabBar from './ui/tabBar.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'
import {switchTicker} from "../redux/actions/app.jsx";

const container = css`
	width: calc(100% - 360px);
	height: 100%;
	float: left;
	padding: 20px;
	overflow: auto;
	border-right: 1px solid #333;
	.coin-tabbar {
		padding:10px 21px;
	}

  .price {
		h4 {
			padding-bottom: 10px;
			border-bottom: 1px solid #333;
		}
  }
  table {
	  width: 100%;
	  thead {
		  color: #777;
	  }
	  tr {
		  border-bottom: 1px solid #222;
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
`;

class Dashboard extends Component {

	constructor(props) {
		super(props)
		this.state = {
			selectedTab:"All"
		}
	}

	switchMarket(e) {
		this.props.dispatch(switchTicker(e))
	}

	render() {
		console.log("markets ", this.props.markets);
		
		const tabs = {
			names: ['All','Trading','Favorites'],
			selectedTabIndex: 0
		}

		const subtabs = {
			names: ['BTC','ETH','XMR','USDT'],
			selectedTabIndex: 0,
		}

		return (
			<div className={container}>
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
			<h4>MARKETS</h4>
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
								this.props.markets.map((market, index) => {
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
