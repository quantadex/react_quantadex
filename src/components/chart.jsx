import React, { Component } from "react";
import { connect } from 'react-redux'
import Datafeeds from '../common/datafeed.js';

class Chart extends Component {
  componentDidMount() {
    const dataFeed = new Datafeeds.UDFCompatibleDatafeed("/api/v1");

    let disabled_features = [
      "header_saveload",
      "symbol_info",
      "symbol_search_hot_key",
      "border_around_the_chart",
      "header_symbol_search",
      "header_compare"
    ];

    let enabled_features = [];

    if (this.props.mobile || !this.props.chartZoom) {
      disabled_features.push("chart_scroll");
      disabled_features.push("chart_zoom");
    }

    if (this.props.mobile || !this.props.chartTools) {
      disabled_features.push("left_toolbar");
      disabled_features.push("chart_crosshair_menu");
      disabled_features.push("chart_events");
      disabled_features.push("footer_share_buttons");
      disabled_features.push("footer_screenshot");
      disabled_features.push("header_screenshot");
      disabled_features.push("footer_publish_idea_button");
      disabled_features.push("caption_buttons_text_if_possible");
      disabled_features.push("line_tool_templates");
      disabled_features.push("widgetbar_tabs");
      disabled_features.push("support_manage_drawings");
      disabled_features.push("support_multicharts");
      disabled_features.push("right_bar_stays_on_scroll");
      disabled_features.push("charts_auto_save");
      disabled_features.push("edit_buttons_in_legend");
      disabled_features.push("context_menus");
      disabled_features.push("control_bar");
      disabled_features.push("header_fullscreen_button");
      disabled_features.push("header_widget");
      disabled_features.push("symbollist_context_menu");
      disabled_features.push("show_pro_features");
    } else {
      enabled_features.push("study_templates");
      enabled_features.push("left_toolbar");
      disabled_features.push("header_screenshot");
      // enabled_features.push("keep_left_toolbar_visible_on_small_screens");
    }

    const self = this;
    // TradingView.onready(function() {
      var widget = (window.chartWidget = new TradingView.widget({
        fullscreen: false,
        symbol: self.props.currentTicker,
        interval: "60",
        allow_symbol_change: false,
        // height: '50px',
        autosize: true,
        container_id: "tv_chart_container",
        //	BEWARE: no trailing slash is expected in feed URL
        datafeed: dataFeed,
        time_frames: [
          { text: "1d", resolution: "86400", title: "1D" },
          { text: "1h", resolution: "3600",  title: "60m"},
          { text: "30m", resolution: "1800",  title: "30m"},
          { text: "15m", resolution: "900",  title: "15m"},
          { text: "5m", resolution: "300",  title: "5m"},
          { text: "1m", resolution: "60", title: "1m" }
        ],
        library_path: "/public/vendor/charting_library/",
        locale: "en",
        debug: false,
        //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
        drawings_access: {
          type: "black",
          tools: [{ name: "Regression Trend" }]
				},
				loading_screen: { backgroundColor: '#23282c' },
        disabled_features: disabled_features,
        enabled_features: enabled_features,
        charts_storage_url: "https://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        custom_css_url: "/public/vendor/charting_library/theme_dark.css",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        overrides: {
          "paneProperties.leftAxisProperties.autoScale": true,
					"paneProperties.topMargin": 25,
          "paneProperties.bottomMargin": 25,
          "paneProperties.background": "#23282c",
          "paneProperties.vertGridProperties.color": "#333",
          "paneProperties.horzGridProperties.color": "#333",
          "paneProperties.vertGridProperties.style": 2,
          "paneProperties.horzGridProperties.style": 2,
          "paneProperties.crossHairProperties.color": "#444",
          "scalesProperties.backgroundColor": "#23282c",
          "scalesProperties.lineColor": "#23282c",
          "scalesProperties.textColor": "#999",
          "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
          "mainSeriesProperties.style": 1, //  Candles styles
          "mainSeriesProperties.candleStyle.upColor": "#50b3b7",
          "mainSeriesProperties.candleStyle.downColor": "#ff3282",
          "mainSeriesProperties.candleStyle.wickUpColor": "#50b3b7",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ff3282",
          "mainSeriesProperties.candleStyle.drawBorder": false,
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
    // });
  }

  componentDidUpdate() {
    // console.log("change chart to ", this.props.currentTicker);
    setTimeout(() => {
      window.chartWidget.setSymbol(this.props.currentTicker, "60")
    }, 0)
  }
  
  render() {
    return (
      <div className={this.props.className}>
        <div id="tv_chart_container"/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentTicker: state.app.currentTicker,
});

export default connect(mapStateToProps)(Chart);
