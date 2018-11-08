import React, { Component } from 'react';

class Chart extends Component {
	componentDidMount() {
		TradingView.onready(function() {
		var widget = (window.tvWidget = new TradingView.widget({
			fullscreen: false,
			symbol: "BTC_USD",
			interval: "5",
            allow_symbol_change: false,
			// height: '50px',
			autosize: true,
			container_id: "tv_chart_container",
			//	BEWARE: no trailing slash is expected in feed URL
			datafeed: new Datafeeds.UDFCompatibleDatafeed(
				"/api/v1"
			),
			library_path: "/assets/charting_library/",
			locale: "en",
			debug: false,
			//	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
			drawings_access: { type: "black", tools: [{ name: "Regression Trend" }] },
			disabled_features: ["use_localstorage_for_settings","left_toolbar"],
			enabled_features: [],
			charts_storage_url: "http://saveload.tradingview.com",
			charts_storage_api_version: "1.1",
			client_id: "tradingview.com",
			user_id: "public_user_id",
            // overrides: {
            //     "paneProperties.background": "#222222",
            //     "paneProperties.vertGridProperties.color": "#454545",
            //     "paneProperties.horzGridProperties.color": "#454545",
            //     "symbolWatermarkProperties.transparency": 20,
            //     "scalesProperties.textColor" : "#AAA"
            // }
		}));
	});
	
	}
	render() {
		return (
			<div {...this.props} >
				<div id="tv_chart_container"  style={{height: '450px'}}/>
			</div>
		);
	}
}

export default Chart;