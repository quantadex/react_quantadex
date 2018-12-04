import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'
import QTTabBar from './ui/tabBar.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	background-color: #22282c;
	.coin-tabbar {
		padding:10px 21px;
	}

  .price {
		padding:20px 21px;
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

        <section className="menu d-flex justify-content-start qt-font-extra-small qt-font-light text-center">
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
				</section>

        <section className="price">
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
