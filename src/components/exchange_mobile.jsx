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
import Connect, { ConnectDialog } from './connect.jsx'
import Message from './message.jsx'
import Fund from './fund.jsx'
import Settings from './settings.jsx'
import MobileNav from './ui/mobileNav.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from 'react-redux'
import Ticker from './ui/ticker.jsx';
import { css } from 'emotion'
import globalcss from './global-css.js'
import CONFIG from '../config.js'

const container = css`
	background-color: #121517;
	height: 100vh;
	width: 100%;
	
	#tv_chart_container, #depth_chart_container {
		height: calc(100vh - 350px);
		min-height: 370px !important;
	}

	.switch-chart {
		margin-top: 10px;
		z-index: 1;

		button {
			width: 50%;
			background: transparent;
			margin-bottom: 10px;
			padding: 5px 10px;
			font-size: 12px;
			font-weight: bold;
			color: #ddd;
			border-bottom: 1px solid #333;
			cursor: pointer;
		}
		button.active {
			color: #fff;
			border-bottom: 2px solid #fff;
		}
	}

	.order-status-btn {
		width: min-content;
		min-height: 26px;
		background: url('/public/images/order-status.svg') no-repeat 0 50%;
		padding-left: 35px;
	}

	#market-dropdown {
		padding-right: 15px;
		background: url(${devicePath("public/images/menu-arrow-down.svg")}) no-repeat 100% 50%;
		cursor: pointer;
	}

	#market-list {
		position: fixed;
		top: 50px;
		height: 0px;
		width: 100%;
		overflow: hidden;
		background-color: #121517;
		transition: height 0.3s;
		z-index: 10;
	}

	#market-list.active {
		height: calc(100% - 112px);
	}

	.mobile-content {
		height: 100%;
		margin-bottom: 63px;
		overflow-y: scroll;
		.tabs {
			width: 100%;
			font-size: 12px;
		}
	
		.tab-row {
			background-color: transparent;
			margin: 0;
			height: auto;
			border: none;
			font-size: 12px;
			white-space: nowrap;
			position: -webkit-sticky;
			position: sticky;
			top: 0;
			background: #121517;
			z-index: 1;
		}
	}

	.trade-options {
		position: fixed;
		bottom: 63px;
		text-align: center;
		padding: 5px 10px;
		background-color: #222730;
		
		button {
			display: block;
			height: 37px;
      width: 100%;
      padding: 8px;
      font-size: 14px;
      color: #fff;
		}
		
		.buy-btn {
			background-color: #50b3b7;
			border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
		}
		.sell-btn {
			background-color: #da3c76;
			border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
		}
	}
`;

class Exchange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTabIndex: 0,
			headerIndex: 0,
			contentIndex: 0,
			params: {},
			showMarkets: false,
			chart: "tv",
			dialog: undefined,
			showBenchmark: true,
			announcements: false,
		}

		this.MarketsList = this.MarketsList.bind(this)
		this.Switchchart = this.Switchchart.bind(this)
		this.ChartContent = this.ChartContent.bind(this)
		this.TradeButtons = this.TradeButtons.bind(this)
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

	handleSwitch(index, params = {}) {
		var data = {contentIndex: index, headerIndex: index, showMarkets: false, params}

		if (typeof index === "number") {
			data.selectedTabIndex = index
		}
		this.setState(data)
		document.getElementById("content").scrollTo({top: 0})
	}

	Switchchart() {
		const { chart } = this.state
		return(
			<div className="switch-chart d-flex">
				<button className={chart === "tv" ? "active": ""} onClick={() => this.setState({ chart: "tv" })}>Price Chart</button>
				<button className={chart === "depth" ? "active": ""} onClick={() => this.setState({ chart: "depth" })}>Depth Chart</button>
			</div>
		)
	}

	ChartContent() {
		const { showBenchmark, chart } = this.state
		return (
			<div>
				<this.Switchchart />
				<Chart chartTools={false} mobile={true} showBenchmark={showBenchmark} className={chart === "tv" ? "d-block": "d-none"} />
				<DepthChart mobile={true} className={chart === "depth" ? "d-block": "d-none"} />
			</div>
		)
	}

	MarketsList() {
		return (
			<div id="market-dropdown" onClick={() => this.setState({showMarkets: !this.state.showMarkets})}>
				<Ticker ticker={this.props.currentTicker} />
			</div>
		)
	}

	OrderStatus() {
		return (
			<div className="order-status-btn">
				Order Status
			</div>
		)
	}

	TradeButtons() {
		const coin = this.props.currentTicker.split('/')[0].split('0X')
		const coin_label = coin[0] + (coin[1] ? '0x' + coin[1].substr(0,4) : "")
		return (
			<div className="trade-options d-flex w-100">
				<button className="buy-btn" onClick={() => this.handleSwitch(1, {trade_side: 0})}>BUY {coin_label}</button>
				<button className="sell-btn" onClick={() => this.handleSwitch(1, {trade_side: 1})}>SELL {coin_label}</button>
			</div>
		)
	}

	Header(index) {
		const { publicKey } = this.props
		const { selectedTabIndex } = this.state

		switch (index) {
			case 0: 
				return {header: <img src="/public/images/logo.svg" alt="QUANTADEX" />}
			case 1: 
				return {header: <this.MarketsList />, 
					left: () => this.handleSwitch("market_detail"),
					left_icon: "/public/images/chart-icon.svg",
					right: publicKey ? {label: <this.OrderStatus />, action: () => this.handleSwitch("orders")} : null }
			case 2: 
				return {header: "Wallet"}
			case 3: 
				return {header: "Settings"}

			case "market_detail": 
				return {header: <this.MarketsList />, left: () => this.handleSwitch(selectedTabIndex)}
			case "connect": 
				return {header: "Connect", left: () => this.handleSwitch(selectedTabIndex)}
			case "create": 
				return {header: "Connect", left: () => this.handleSwitch(selectedTabIndex)}
			case "message": 
				return {header: "Sign / Verify", left: () => this.handleSwitch(selectedTabIndex)}
			case "orders": 
				return {header: "Orders", left: () => this.handleSwitch(selectedTabIndex)}
		}
	}

	Content(index) {
		const { network, dispatch, publicKey } = this.props
		const { announcements, params, selectedTabIndex } = this.state
		switch (index) {
			case 0: 
			return (
				<React.Fragment>
					{announcements ? <Announcement announcements={announcements} className="border-bottom border-dark" /> : null}
					<Dashboard mobile={true} mobile_nav={() => this.handleSwitch("market_detail")} />
				</React.Fragment>
			)
		case 1: 
			return (
				<React.Fragment>
					<Trade mobile={true} mobile_nav={() => this.handleSwitch("connect")} trade_side={params.trade_side || 0}/>
					<OrderBook mobile={true} mirror={true}/>
					<TradingHistory mobile={true}/>
				</React.Fragment>
			)
		case 2: 
			if (publicKey) {
				return <Fund />
			} 
			return (
				<div className="d-flex h-100 mx-auto" style={{maxWidth: "225px"}}>
					<Connect mobile_nav={this.handleSwitch.bind(this)} />
				</div>
			)
			
		case 3: 
			return (
				<Settings mobile_nav={this.handleSwitch.bind(this)} />
			)

		case "market_detail": 
			return(
				<div style={{paddingBottom: "50px"}}>
					<this.ChartContent />
					<OrderBook mobile={true} mirror={true}/>
					<this.TradeButtons />
				</div>
			)
		case "connect": 
			return (
				<ConnectDialog default="connect" network={network} dispatch={dispatch} isMobile={true} mobile_nav={() => this.handleSwitch(selectedTabIndex)} />
			)
		case "create": 
			return (
				<ConnectDialog default="create" network={network} dispatch={dispatch} isMobile={true} mobile_nav={() => this.handleSwitch(selectedTabIndex)} />
			)
		case "message": 
			return (
				<Message />
			)
		case "orders": 
			return (
				<Orders mobile={true}/>
			)
		}
	}

	render() {
		const { showMarkets, selectedTabIndex, contentIndex, headerIndex } = this.state
		const tabs = {	names: ["Markets", "Trade", "Wallet", "Settings"],
										selectedTabIndex: selectedTabIndex }

		return (
		<div className={container + " d-flex flex-column"}>
			<MobileHeader header={this.Header(headerIndex)} />
			
			<div id="content" className="mobile-content">
				<div id="market-list" className={showMarkets ? "active" : ""}>
					<Dashboard mobile={true} mobile_nav={() => this.setState({showMarkets: false})} />
				</div>
				{this.Content(contentIndex)}
			</div>

			<MobileNav tabs={tabs} selectedTabIndex={selectedTabIndex} switchTab={this.handleSwitch.bind(this)} />
			
			<ToastContainer />
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
		network: state.app.network,
		private_key: state.app.private_key,
		publicKey: state.app.publicKey,
		currentTicker: state.app.currentTicker,
		inputSetTime: state.app.setTime,
	});


export default connect(mapStateToProps)(Exchange);
