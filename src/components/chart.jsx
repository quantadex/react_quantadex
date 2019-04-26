import React, { Component } from "react";
import { connect } from 'react-redux'
import Datafeeds from '../common/datafeed.js';
import { stringify } from "querystring";

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false
    };
  }
  componentDidMount() {
    if (this.props.currentTicker != null) {
      try {
        this.initChart()
      } catch (e) {
        Rollbar.error("Failed to load chart: " + this.props.currentTicker, e);
      }
    }
  }

  initChart(ticker = this.props.currentTicker) {
    const self = this;
    self.setState({init: true})
    const dataFeed = new Datafeeds.UDFCompatibleDatafeed("/api/v1");
    window.showBenchmark = this.props.showBenchmark;
    // console.log("show benchmark=", window.showBenchark);

    let disabled_features = [
      "header_saveload",
      "symbol_info",
      "symbol_search_hot_key",
      "border_around_the_chart",
      "header_symbol_search",
      "header_compare",
      "header_resolutions",
      "timeframes_toolbar"
    ];

    let enabled_features = [];

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
      disabled_features.push("symbollist_context_menu");
      disabled_features.push("show_pro_features");
    } else {
      enabled_features.push("study_templates");
      enabled_features.push("left_toolbar");
      disabled_features.push("header_screenshot");
      // enabled_features.push("keep_left_toolbar_visible_on_small_screens");
    }

    const upColor = "#50b3b7"
    const downColor = "#ff3282"
    const background_color = this.props.mobile ? "#0A121E" : "#23282c"

    // TradingView.onready(function() {
      var widget = (window.chartWidget = new TradingView.widget({
        fullscreen: false,
        symbol: ticker,
        interval: "15",
        allow_symbol_change: false,
        // height: '50px',
        autosize: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        container_id: "tv_chart_container",
        //	BEWARE: no trailing slash is expected in feed URL
        datafeed: dataFeed,
        time_frames: [
          { text: "6M", resolution: "1D", title: "6M" },
          { text: "1W", resolution: "60",  title: "1W"},
          { text: "5D", resolution: "30",  title: "5D"},
          { text: "2D", resolution: "15",  title: "2D"},
          { text: "12h", resolution: "5",  title: "12h"},
          { text: "3h", resolution: "1", title: "3h" }
        ],
        library_path: devicePath("public/vendor/charting_library/"),
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
        custom_css_url: "/public/vendor/charting_library/" + (this.props.mobile ? "theme_dark_mobile.css" : "theme_dark.css"),
        client_id: "tradingview.com",
        user_id: "public_user_id",
        overrides: {
          "paneProperties.leftAxisProperties.autoScale": true,
					"paneProperties.topMargin": 25,
          "paneProperties.bottomMargin": 25,
          "paneProperties.background": background_color,
          "paneProperties.vertGridProperties.color": "#333",
          "paneProperties.horzGridProperties.color": "#333",
          "paneProperties.vertGridProperties.style": 2,
          "paneProperties.horzGridProperties.style": 2,
          "paneProperties.crossHairProperties.color": "#444",
          "scalesProperties.backgroundColor": background_color,
          "scalesProperties.lineColor": background_color,
          "scalesProperties.textColor": "#999",
          "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
          "mainSeriesProperties.style": 1, //  Candles styles
          "mainSeriesProperties.candleStyle.upColor": upColor,
          "mainSeriesProperties.candleStyle.downColor": downColor,
          "mainSeriesProperties.candleStyle.wickUpColor": upColor,
          "mainSeriesProperties.candleStyle.wickDownColor": downColor,
          "mainSeriesProperties.candleStyle.drawBorder": false,
          "mainSeriesProperties.hollowCandleStyle.upColor": upColor,
          "mainSeriesProperties.hollowCandleStyle.downColor": downColor,
          "mainSeriesProperties.hollowCandleStyle.drawWick": true,
          "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
          "mainSeriesProperties.hollowCandleStyle.borderColor": "#C400CB",
          "mainSeriesProperties.hollowCandleStyle.borderUpColor": upColor,
          "mainSeriesProperties.hollowCandleStyle.borderDownColor": downColor,
          "mainSeriesProperties.hollowCandleStyle.wickUpColor": upColor,
          "mainSeriesProperties.hollowCandleStyle.wickDownColor": downColor,
          "study_Overlay@tv-basicstudies.barStyle.upColor": "blue",
          "study_Overlay@tv-basicstudies.barStyle.downColor": "blue",
          "study_Overlay@tv-basicstudies.lineStyle.color": "blue",
          "study_Overlay@tv-basicstudies.areaStyle.color1": "blue",
          "study_Overlay@tv-basicstudies.areaStyle.color2": "blue",
          "study_Overlay@tv-basicstudies.areaStyle.linecolor": "blue",
          "volumePaneSize": "tiny"
        },
        studies_overrides: {
          "volume.volume.plottype": "columns",
          "volume.volume.color.0": "#777",
          "volume.volume.color.1": "#777",
          "volume.volume.transparency": 80,
      }
      }));
    // });

    const custom_intervals = [
      { text: "1m", resolution: "1" },
      { text: "5m", resolution: "5" },
      { text: "15m", resolution: "15" },
      { text: "30m", resolution: "30" },
      { text: "1h", resolution: "60" },
      { text: "1D", resolution: "1D" },
    ]

    widget.onChartReady(function() {
      for (let interval of custom_intervals) {
        var button = widget.createButton()
        .on('click', (e) => {
          widget.setSymbol(ticker, interval.resolution)
          let target = e.target.classList.contains("custom-button") ? e.target : e.target.parentNode
          let header_buttons = target.parentNode.parentNode.childNodes
          for (let i of header_buttons) {
            i.classList.remove("active")
          }
          target.parentNode.classList.add("active")
        })
        .append($('<span>' + interval.text + '</span>'))
        button.addClass("custom-button")

        if(interval.resolution == "15") {
          button[0].parentNode.classList.add("active")
        }
      }
      self.setState({init: true})
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showBenchmark !== this.props.showBenchmark) window.showBenchmark = nextProps.showBenchmark;
    let nextTicker = nextProps.currentTicker + (nextProps.showBenchmark ? "@adjusted" : "")
    try {
      if (window.chartWidget) {
        window.chartWidget.setSymbol(nextTicker, "15")
      } else {
        this.initChart(nextTicker)
      }
    } catch (e) {
      Rollbar.error("Failed to load chart: " + nextProps.currentTicker, e);
    }
  }

  // componentDidUpdate() {
  //   window.chart_count = window.chart_count || 0;
  //   // TODO: reload with the same resolution
  //   if (this.state.init && window.showBenchmark != this.props.showBenchmark) {
  //     setTimeout(() => {
  //       window.showBenchmark = this.props.showBenchmark;
  //       // console.log("update benchmark= ", window.showBenchmark, window.chart_count);
  //       // window.chartWidget.setSymbol(this.props.currentTicker + "@adjusted" + window.chart_count, "15")
  //       // window.chart_count++;
  //     }, 10)
  //   }
  // }

  render() {
    return (
      <div className={this.props.className}>
        <div id="tv_chart_container" style={this.props.style || {}} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentTicker: state.app.currentTicker,
  network: state.app.network
});

export default connect(mapStateToProps)(Chart);
