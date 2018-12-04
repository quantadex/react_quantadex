import React, { Component } from "react";

class Chart extends Component {
  componentDidMount() {
    TradingView.onready(function() {
      var widget = (window.tvWidget = new TradingView.widget({
        fullscreen: false,
        symbol: "BTC/USD",
        interval: "5",
        allow_symbol_change: false,
        // height: '50px',
        autosize: true,
        container_id: "tv_chart_container",
        //	BEWARE: no trailing slash is expected in feed URL
        datafeed: new Datafeeds.UDFCompatibleDatafeed("/api/v1"),
        time_frames: [
          { text: "1d", resolution: "1D" },
          { text: "1h", resolution: "60" },
          { text: "30m", resolution: "30" },
          { text: "15m", resolution: "15" },
          { text: "5m", resolution: "5" },
          { text: "1d", resolution: "1", title: "1m" }
        ],
        library_path: "/public/vendor/charting_library/",
        locale: "en",
        debug: false,
        //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
        drawings_access: {
          type: "black",
          tools: [{ name: "Regression Trend" }]
				},
				loading_screen: { backgroundColor: 'black' },
        disabled_features: ["use_localstorage_for_settings", "left_toolbar"],
        enabled_features: [],
        charts_storage_url: "http://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        custom_css_url: "/public/vendor/charting_library/theme_dark.css",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        overrides: {
          "paneProperties.leftAxisProperties.autoScale": true,
					"paneProperties.topMargin": 25,
          "paneProperties.bottomMargin": 25,
          "paneProperties.background": "black",
          "paneProperties.vertGridProperties.color": "black",
          "paneProperties.horzGridProperties.color": "black",
          "paneProperties.crossHairProperties.color": "black",
          "scalesProperties.backgroundColor": "black",
          "scalesProperties.lineColor": "black",
          "scalesProperties.textColor": "black",
          "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
          "mainSeriesProperties.style": 1, //  Candles styles
          "mainSeriesProperties.hollowCandleStyle.upColor": "black",
          "mainSeriesProperties.hollowCandleStyle.downColor": "black",
          "mainSeriesProperties.hollowCandleStyle.drawWick": true,
          "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
          "mainSeriesProperties.hollowCandleStyle.borderColor": "#C400CB",
          "mainSeriesProperties.hollowCandleStyle.borderUpColor": "black",
          "mainSeriesProperties.hollowCandleStyle.borderDownColor": "black",
          "mainSeriesProperties.hollowCandleStyle.wickUpColor": "black",
          "mainSeriesProperties.hollowCandleStyle.wickDownColor": "black",
          "study_Overlay@tv-basicstudies.barStyle.upColor": "blue",
          "study_Overlay@tv-basicstudies.barStyle.downColor": "blue",
          "study_Overlay@tv-basicstudies.lineStyle.color": "blue",
          "study_Overlay@tv-basicstudies.areaStyle.color1": "blue",
          "study_Overlay@tv-basicstudies.areaStyle.color2": "blue",
          "study_Overlay@tv-basicstudies.areaStyle.linecolor": "blue"
        }
      }));
    });
  }
  render() {
    return (
      <div {...this.props}>
        <div id="tv_chart_container"/>
      </div>
    );
  }
}

export default Chart;
