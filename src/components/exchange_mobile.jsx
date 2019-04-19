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
import Status from './status.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from 'react-redux'
import Ticker from './ui/ticker.jsx';
import { css } from 'emotion'
import globalcss from './global-css.js'
import CONFIG from '../config.js'
import { UPDATE_STORAGE } from '../redux/actions/app.jsx'
import { getItem, clear } from '../common/storage.js';

const container = css`
	background-color: #0A121E;
	height: 100vh;
	width: 100%;
	
	#tv_chart_container, #depth_chart_container {
		height: calc(100vh - 350px);
		min-height: 370px !important;
	}

	.exchange-bottom {
		position: fixed;
		bottom: 0;
		background-color: #0A121E;
		width: 100%;
		z-index: 99;
	}

	.switch-chart {
		white-space: nowrap;
		z-index: 1;

		button {
			width: 50%;
			background: transparent;
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
		background: url(${devicePath('public/images/order-status.svg')} no-repeat 0 50%;
		padding-left: 35px;
	}

	#market-dropdown {
		width: max-content;
		white-space: nowrap;
		padding-right: 15px;
		background: url(${devicePath("public/images/menu-arrow-down.svg")}) no-repeat 100% 50%;
		cursor: pointer;
	}

	#market-list {
		position: fixed;
		top: 60px;
		height: 0px;
		width: 100%;
		overflow: scroll;
		background-color: #0A121E;
		transition: height 0.3s;
		z-index: 10;
	}

	#market-list.active {
		height: calc(100% - 60px);
		padding-bottom: 65px;
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
			background: #0A121E;
			z-index: 1;
		}
	}

	.trade-options {
		position: fixed;
		bottom: 0px;
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

	&.web {
		.mobile-content {
			margin-bottom: 65px;
		}

		#market-list {
			top: 91px;
		}

		#market-list.active {
			height: calc(100% - 91px);
			padding-bottom: 70px;
		}

		.trade-options {
			bottom: 65px;
		}
	}
`;

class Exchange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTabIndex: 0,
			headerIndex: window.isApp ? "markets" : "chart",
			contentIndex: window.isApp ? "markets" : "chart",
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
		const self = this;
		fetch(CONFIG.getEnv().ANNOUNCEMENT_JSON, {mode: "cors"}).then(e => e.json())
		.then(data => {
				const entries = data.entries
				if (entries && entries.length > 0) {
						self.setState({announcements: entries.slice(0,3)})
				}
		}).catch(e=>{
			console.error("Failed " + e.name)
		})

		document.addEventListener("deviceready", async ()=> {
			document.addEventListener("backbutton", (e) => {
				// console.log("back", this.props.history)
			}, false);

			try {
				const env = await getItem("env")
				if (env !== this.props.network) await clear()
				const publicKey = await getItem("publicKey")
				const name = await getItem("name")
				const userId = await getItem("id")
				const lifetime = await getItem("lifetime")
				self.props.dispatch({
					type: UPDATE_STORAGE,
					data: {
						publicKey: publicKey || "", 
						name, 
						userId, 
						lifetime: lifetime === "true"
					}
				})
			} catch(e) {
				console.log(e)
			}

		}, false);

		
	}

	handleSwitch(index, params = {}) {
		var contentIndex = index
		var tabIndex = typeof index === "number"
		if (tabIndex) {
			contentIndex = window.isApp ? ["markets", "trade", "wallet", "settings"][index] : ["chart", "trade", "orders", "wallet"][index]
		}

		var data = {contentIndex: contentIndex, headerIndex: contentIndex, showMarkets: false, params}
		if (tabIndex) {
			data.selectedTabIndex = index
		}
		this.setState(data)
		document.getElementById("content").scrollTo({top: 0})
	}

	Switchchart() {
		const { chart } = this.state
		return(
			<div className="switch-chart d-flex align-items-center">
				<button className={chart === "tv" ? "active": ""} onClick={() => this.setState({ chart: "tv" })}>Price Chart</button>
				<button className={chart === "depth" ? "active": ""} onClick={() => this.setState({ chart: "depth" })}>Depth Chart</button>
				{!window.isApp ? <this.MarketsList /> : null}
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
			<div id="market-dropdown" className={"mx-3" + (window.isApp ? "" : " qt-font-small")} onClick={() => this.setState({showMarkets: !this.state.showMarkets})}>
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
		const { currentTicker } = this.props
		if (!currentTicker) return null
		const coin = currentTicker.split('/')[0].split('0X')
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
			case "markets": 
				return {header: <img src={devicePath("public/images/logo.svg")} alt="QUANTADEX" />}
			case "trade": 
				return {header: <this.MarketsList />, 
					left: () => this.handleSwitch("chart"),
					left_icon: devicePath("public/images/chart-icon.svg"),
					right: publicKey ? {label: <this.OrderStatus />, action: () => this.handleSwitch("orders")} : null }
			case "wallet": 
				return {header: "Wallet"}
			case "settings": 
				return {header: "Settings"}

			case "chart": 
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
			case "markets": 
			return (
				<React.Fragment>
					{announcements ? <Announcement announcements={announcements} className="border-bottom border-dark" /> : null}
					<Dashboard mobile={true} mobile_nav={() => this.handleSwitch("chart")} />
				</React.Fragment>
			)
		case "trade": 
			return (
				<React.Fragment>
					{!window.isApp ? <div className="mt-3"><this.MarketsList /></div> : null}
					<Trade mobile={true} mobile_nav={() => this.handleSwitch("connect")} trade_side={params.trade_side || 0}/>
					<OrderBook mobile={true} mirror={true}/>
					<TradingHistory mobile={true}/>
				</React.Fragment>
			)
		case "wallet": 
			if (publicKey) {
				return <Fund />
			} 
			return (
				<div className="d-flex h-100 mx-auto" style={{maxWidth: "225px"}}>
					<Connect mobile_nav={this.handleSwitch.bind(this)} />
				</div>
			)
			
		case "settings": 
			return (
				<Settings mobile_nav={this.handleSwitch.bind(this)} />
			)

		case "chart": 
			return(
				<div style={{paddingBottom: window.isApp ? "0px" : "50px"}}>
					<this.ChartContent />
					<OrderBook mobile={true} mirror={true}/>
					<this.TradeButtons />
				</div>
			)
		case "connect": 
			return (
				<ConnectDialog default="connect" network={network} dispatch={dispatch} isMobile={true} 
					mobile_nav={() => this.handleSwitch(window.isApp && selectedTabIndex === 3 ? 2 : selectedTabIndex)} />
			)
		case "create": 
			return (
				<ConnectDialog default="create" network={network} dispatch={dispatch} isMobile={true} 
					mobile_nav={() => this.handleSwitch(selectedTabIndex)} />
			)
		case "message": 
			return (
				<Message />
			)
		case "orders": 
			if (publicKey) {
				return <Orders mobile={true}/>
			} 
			return (
				<div className="d-flex h-100 mx-auto" style={{maxWidth: "225px"}}>
					<Connect mobile_nav={this.handleSwitch.bind(this)} />
				</div>
			)
		}
	}

	render() {
		const { showMarkets, selectedTabIndex, contentIndex, headerIndex } = this.state
		const tabs = {	names: ["Markets", "Trade", "Wallet", "Settings"] }
		const web_tabs = { names: ["Chart", "Trade", "Orders", "Wallet"] }

		return (
		<div className={container + " d-flex flex-column" + (window.isApp ? " app" : " web")}>
			<MobileHeader header={this.Header(headerIndex)} mobile_nav={this.handleSwitch.bind(this)} />
			
			<div id="content" className="mobile-content">
				<div id="market-list" className={showMarkets ? "active" : ""}>
					<Dashboard mobile={true} mobile_nav={() => this.setState({showMarkets: false})} />
				</div>
				{this.Content(contentIndex)}
			</div>
			<div className="exchange-bottom">
				<MobileNav 
					hide={window.isApp && contentIndex === "chart"}
					tabs={window.isApp ? tabs : web_tabs} 
					selectedTabIndex={selectedTabIndex} 
					switchTab={this.handleSwitch.bind(this)} 
				/>
				{window.isApp ? null : <Status mobile={true}/>}
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
		currentTicker: state.app.currentTicker,
		inputSetTime: state.app.setTime,
	});


export default connect(mapStateToProps)(Exchange);
