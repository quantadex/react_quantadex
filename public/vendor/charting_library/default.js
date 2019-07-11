function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

TradingView.onready(function() {
  var widget = (window.tvWidget = new TradingView.widget({
    fullscreen: true,
    symbol: "BTC_USD",
    interval: "1",
    container_id: "tv_chart_container",
    //	BEWARE: no trailing slash is expected in feed URL
    datafeed: new Datafeeds.UDFCompatibleDatafeed("/api/1"),
    library_path: "",
    locale: "en",
    //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
    drawings_access: { type: "black", tools: [{ name: "Regression Trend" }] },
    disabled_features: ["use_localstorage_for_settings"],
    enabled_features: [],
    charts_storage_url: "http://saveload.tradingview.com",
    charts_storage_api_version: "1.1",
    client_id: "tradingview.com",
    user_id: "public_user_id"
  }));
});
