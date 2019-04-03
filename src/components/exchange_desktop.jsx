import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
import DepthChart from './chart_depth.jsx';
import TradingHistory from './trading_history.jsx';
import OrderBook from './order_book.jsx';
import Menu from './menu.jsx';
import Orders from './orders.jsx';
import Trade from './trade.jsx';
import Balance from './balance.jsx';
import Connect from './connect.jsx';
import Status from './status.jsx'
import ToolTip from './ui/tooltip.jsx'
import Switch from './ui/switch.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from 'react-redux'
import { css } from 'emotion'

const container = css`
	background-color: #121517;
	position: relative;
	height: 100vh;

	hr {
		border-color: #444;
	}

	section.compartment {
		background-color: #23282c;
		margin-right: 5px;
		min-height: 260px;
	}

	.content {
		.cols, .left-cols {
			flex: 0 0 260px;
		}
		.left-cols {
			padding: 10px;
			height: calc(100vh - 92px);
		}
	}

	.status {
		position: fixed;
		bottom: 0;
		justify-content: center;
		width: 100%;
		background-color: #23282c;
		z-index: 99;
	}
	
	#tv_chart_container, #depth_chart_container {
		height: calc(100vh - 390px);
		width: 100%;
	}

	.trade-toggle {
		position: absolute;
		right: 10px;
		float: right;
		display: flex;
		font-size: 16px;
		padding: 8px 10px 0px
		
		.toggle {
			margin-left: 73px;
			color: #66d7d7;
			padding-left: 14px;
			font-size: 12px;
		}
		.toggle.show {
			background: url(${devicePath('public/images/left-arrow.svg')}) no-repeat 0 4px;
		}
		.toggle.hide {
			margin-left: 80px;
			background: url(${devicePath('public/images/right-arrow.svg')}) no-repeat 0 4px;
		}
	}

	.switch-chart {
		height: 32px;
		padding-left: 10px;
		z-index: 1;

		button {
			margin: 5px 10px 0 0;
			padding: 2px 10px;
			font-size: 12px;
			border-radius: 20px;
			font-weight: bold;
			background: transparent;
			color: #ddd;
			border: 2px solid #4a4a4a;
			cursor: pointer;
		}
		button.active {
			border-color: #50b3b7;
			color: #fff;
		}
	}

	.benchmark-box {
		margin-top: 8px;
		margin-left: 10px;
	}

	.exchange-dashboard {
		border-bottom: solid 1px #121517;
	}

	.no-scroll-bar {
		position: relative;
		overflow: hidden;
		margin-right: -10px;
	}

	.pushed-margin {
		margin-left: -10px;

		th:first-child, td:first-child {
			padding-left: 10px;
		}
	}
	
	.no-scroll-bar > div {
		height: 100%;
		position: absolute;
		padding-right: 5px;
		left: 0;
		right: 0;
		overflow-y: scroll;

		::-webkit-scrollbar {
			width: 6px;
			height: 6px;
		}
		
		::-webkit-scrollbar-track {
		background: transparent; 
		}
		
		::-webkit-scrollbar-thumb {
		background: rgba(255,255,255,0.1); 
		border-radius: 10px;
		}
		
		::-webkit-scrollbar-thumb:hover {
		background: rgba(255,255,255,0.2); 
		}

		scrollbar-width: thin;
		scrollbar-color: rgba(255,255,255,0.1) transparent;
	}

	
`;

class Exchange extends Component {
	constructor(props) {
		super(props)
		this.state = {
			chart: "tv",
			toggle_trade: false,
			dialog: undefined,
			showBenchmark: true
		}
		
	}

	resizeDepthChart() {
		setTimeout(() =>{
			window.depthChartWidget.setSize(null, null, false)
		}, 0)
	}

	toggleChart(chart) {
		this.setState({ chart: chart })
		if(chart == "depth") {
			this.resizeDepthChart()
		}
	}

	toggleHistory() {
		this.setState({toggle_trade: !this.state.toggle_trade})
		this.resizeDepthChart()
	}

	toggleBenchmarkPrice() {
		this.setState({ showBenchmark: !this.state.showBenchmark })
	}

	render() {
		const Switchchart = () => {
			return(
				<div className="switch-chart d-flex">
					<button className={this.state.chart === "tv" ? "active": ""} onClick={() => this.toggleChart("tv")}>Price Chart</button>
					<button className={this.state.chart === "depth" ? "active": ""} onClick={() => this.toggleChart("depth")}>Depth Chart</button>
					{this.state.chart === "tv" ?
					<React.Fragment>
						<span className="benchmark-box">
							<Switch label="Benchmark Price " onToggle={this.toggleBenchmarkPrice.bind(this)}  active={this.state.showBenchmark}/>
						</span>
						<ToolTip style={{ float: "right", marginLeft: 13, marginTop: 10}} message="Enabling benchmark price aggregate prices from Binance/others<br/> to give more pricing information for you to make informed trades." />
					</React.Fragment>
					: null
					}
					
				</div>
			)
		}
		return (
			<div className={container}>
				<div className="d-flex">
					<Header />
					{this.props.publicKey ? <Menu /> : <Connect type="link" />}
				</div>
				<div className="content d-flex">
					<section className="compartment left-cols">
						<Trade />
						<hr/>
						{this.props.publicKey ? <Balance /> : <Connect/>}
					</section>
					<section className="compartment left-cols">
						<OrderBook />
					</section>

					<div className="d-flex flex-column justify-content-between" style={{width: "calc(100% - 530px)"}}>
						<div className="d-flex mb-2">
							<div className="trade-toggle align-items-center">
									<div className={"toggle cursor-pointer" + (this.state.toggle_trade ? " hide" : " show")}
									onClick={() => this.toggleHistory()}>
										{this.state.toggle_trade ? "HIDE" : "SHOW TRADE HISTORY"}
									</div>
								</div>
							<section className="compartment" style={this.state.toggle_trade ? {width: "calc(100% - 270px)"} : {width: "100%"}}>
								<Switchchart />
								<Chart chartTools={true} showBenchmark={this.state.showBenchmark} className={this.state.chart === "tv" ? "d-block": "d-none" } style={!this.props.publicKey && {height: "calc(100vh - 124px)"}} />
								<DepthChart className={this.state.chart === "depth" ? "d-block": "d-none"} style={!this.props.publicKey && {height: "calc(100vh - 124px)"}} />
							</section>

							<section className={"compartment cols" + (this.state.toggle_trade ? "" : " d-none")}>
								<TradingHistory />
							</section>
						</div>
						
						{this.props.publicKey ? 
							<section className="compartment">
								<Orders />
							</section>
							: null
						}
					</div>
				</div>

				<section className="status">
					<Status />
				</section>
				<ToastContainer />
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
		private_key: state.app.private_key,
		publicKey: state.app.publicKey,
		leftOpen: state.app.ui.leftOpen,
		rightOpen: state.app.ui.rightOpen,
		currentTicker: state.app.currentTicker,
	});


export default connect(mapStateToProps)(Exchange);
