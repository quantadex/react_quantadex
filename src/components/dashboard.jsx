import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'
import QTTabBar from './ui/tabBar.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'

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
`;

class Dashboard extends Component {

	constructor(props) {
		super(props)
		this.state = {
			selectedTab:"All"
		}
	}

	toggleStar(e) {
		if (e.target.src.includes("white")) {
			e.target.src = e.target.src.replace("white","grey")
		} else {
			e.target.src = e.target.src.replace("grey","white")
		}
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
			<h4>ETH MARKET</h4>
					<QTTableViewSimple
						dataSource={this.props.dashboard.dataSource}
						columns={this.props.dashboard.columns}
						{...this.props} />
        </section>
			</div>
		);
	}
}


const mapStateToProps = (state) => ({
  dashboard: state.app.dashboard,
	favoriteList: state.app.favoriteList
});

export default connect(mapStateToProps)(Dashboard);
