import React, { Component } from 'react';
import Chart from './chart.jsx';
import DepthChart from './chart_depth.jsx';
import TradingHistory from './trading_history.jsx';
import OrderBook from './order_book.jsx';
import Dashboard from './dashboard.jsx';
import MobileHeader from './ui/mobileHeader.jsx';
import Announcement from './announcement.jsx'
import Orders from './orders.jsx';
import Trade from './trade.jsx';
import Balance from './balance.jsx'
import Connect from './connect.jsx';
import Status from './status.jsx'
import MobileNav from './ui/mobileNav.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from 'react-redux'
import Ticker from './ui/ticker.jsx';
import { css } from 'emotion'
import globalcss from './global-css.js'
import CONFIG from '../config.js'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
	position: relative;
	height: 100vh;
	width: 100%;

	.exchange-bottom {
		position: fixed;
		width: 100%;
		bottom: 0;
		background-color: #23282c;
		z-index: 99;
	}
	
	#tv_chart_container, #depth_chart_container {
		height: calc(100vh - 180px);
		min-height: 370px !important;
	}

	.switch-chart {
		position: absolute;
		flex-flow: column;
		right: 10px;
		margin-top: 10px;
		z-index: 1;

		button {
			margin-bottom: 10px;
			padding: 5px 10px;
			font-size: 12px;
			border-radius: 20px;
			font-weight: bold;
			background: #111;
			color: #ddd;
			border: 2px solid #333;
			cursor: pointer;
		}
		button.active {
			color: #50b3b7;
			border-color: #50b3b7;
		}
	}

	.exchange-dashboard {
		border-bottom: solid 1px #121517;
	}

	.no-scroll-bar {
		position: relative;
		overflow: hidden;
	}

	.pushed-margin {
		margin-left: -10px;

		th:first-child, td:first-child {
			padding-left: 10px;
		}
	}
	
	.no-scroll-bar > div {
		height: 100%;
		box-sizing: content-box;
		position: absolute;
		left: 0;
		right: 0;
		overflow-y: scroll;
	}

	#market-dropdown {
		padding-right: 15px;
		background: url(${devicePath("public/images/menu-arrow-down.svg")}) no-repeat 100% 50%;
		cursor: pointer;
	}

	#market-list {
		position: absolute;
		width: 100%;
		height: 0;
		overflow: hidden;
		background-color: #222;
		transition: height 0.3s;
		z-index: 10;
	}

	#market-list.active {
		height: calc(100% - 182px);
	}

	.content {
		height: calc(100% - 182px);
		overflow-y: scroll;
	}

	&.has-announcement {
		.content {
			height: calc(100% - 208px);
		}

		#tv_chart_container, #depth_chart_container {
			height: calc(100vh - 208px);
		}
		
		.orderbook-ask, .orderbook-bid {
			height: calc(50vh - 110px);
		}
	}
`;

class Exchange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTabIndex: 2,
			chart: "tv",
			dialog: undefined,
			showBenchmark: true,
			announcements: false
		};
	  }

	componentDidMount() {
        fetch(CONFIG.getEnv().ANNOUNCEMENT_JSON).then(e => e.json())
        .then(data => {
            const entries = data.entries
            if (entries && entries.length > 0) {
                this.setState({announcements: entries.slice(0,3)})
            }
        })
	}
	
	componentWillReceiveProps(nextProps) {
		if (nextProps.inputSetTime != undefined && nextProps.inputSetTime != this.state.inputSetTime) {
			this.setState({
				inputSetTime: nextProps.inputSetTime,
				selectedTabIndex: 0
			  })
		}
	}

	toggleChart(chart) {
		this.setState({ chart: chart })
	}

	handleSwitch(index) {
		this.setState({selectedTabIndex: index})
		this.toggleMarketsList(null, true)
	}

	toggleMarketsList(e, force = false) {
		const list = document.getElementById("market-list")
		if (force) {
			list.classList.remove("active")
			return
		}

		if (list.classList.contains("active")) {
			list.classList.remove("active")
		} else {
			list.classList.add("active")
		}
	}

	render() {
		const tabs = {	names: ["Trade", "Orders", "Chart", "Book", "History"],
						selectedTabIndex: 2 }

		const ChartContent = () => {
			return (
				<div>
					<Switchchart />
					<Chart chartTools={false} showBenchmark={this.state.showBenchmark} className={this.state.chart === "tv" ? "d-block": "d-none"} />
					<DepthChart  className={this.state.chart === "depth" ? "d-block": "d-none"} />
				</div>
			)
		}
		const content = [this.props.publicKey ? <div><Trade mobile={true} /><Balance /></div> : <Connect />, 
						this.props.publicKey ? <Orders mobile={true}/> : <Connect /> , 
						<ChartContent />, <OrderBook mobile={true}/>, <TradingHistory mobile={true}/>]
		const Switchchart = () => {
			return(
				<div className="switch-chart d-flex">
					<button className={this.state.chart === "tv" ? "active": ""} onClick={() => this.toggleChart("tv")}>Price</button>
					<button className={this.state.chart === "depth" ? "active": ""} onClick={() => this.toggleChart("depth")}>Depth</button>
				</div>
			)
		}

		const {announcements} = this.state
		return (
		<div className={container + (announcements ? " has-announcement" : "")}>
			<MobileHeader />
			{announcements ? <Announcement announcements={announcements} className="border-bottom border-dark" /> : null}
			<div className="d-flex qt-font-normal qt-font-bold p-4 justify-content-between border-bottom border-dark">
				<div id="market-dropdown" onClick={this.toggleMarketsList}>MARKETS</div>
				<div><Ticker ticker={this.props.currentTicker} /></div>
			</div>
			<div id="market-list">
				<Dashboard mobile={true}/>
			</div>
			
			<div className="content">
				{content[this.state.selectedTabIndex]}
			</div>

			<div className={"exchange-bottom"}>
				<MobileNav tabs={tabs} selectedTabIndex={this.state.selectedTabIndex} switchTab={this.handleSwitch.bind(this)} />
				<Status mobile={true} />
			</div>
			
			<ToastContainer />
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
		network: state.app.network,
		private_key: state.app.private_key,
		publicKey: state.app.publicKey,
		leftOpen: state.app.ui.leftOpen,
		rightOpen: state.app.ui.rightOpen,
		currentTicker: state.app.currentTicker,
		inputSetTime: state.app.setTime,
	});


export default connect(mapStateToProps)(Exchange);
