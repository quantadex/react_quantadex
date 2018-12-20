import { Apis } from "@quantadex/bitsharesjs-ws";
import { transformPriceData } from "../common/PriceData";

/*
	This class implements interaction with UDF-compatible datafeed.

	See UDF protocol reference at
	https://github.com/tradingview/charting_library/wiki/UDF
*/

function parseJSONorNot(mayBeJSON) {
  if (typeof mayBeJSON === "string") {
    return JSON.parse(mayBeJSON);
  } else {
    return mayBeJSON;
  }
}

var Datafeeds = {};

Datafeeds.UDFCompatibleDatafeed = function(datafeedURL, updateFrequency) {
  this._datafeedURL = datafeedURL;
  this._configuration = undefined;

  this._symbolSearch = null;
  this._symbolsStorage = null;
  this._barsPulseUpdater = new Datafeeds.DataPulseUpdater(
    this,
    updateFrequency || 2 * 1000
  );
  this._quotesPulseUpdater = new Datafeeds.QuotesPulseUpdater(this);

  this._enableLogging = false;
  this._initializationFinished = false;
  this._callbacks = {};

  this._initialize();
};

Datafeeds.UDFCompatibleDatafeed.prototype.defaultConfiguration = function() {
  return {
    supports_search: false,
    supports_group_request: true,
    supported_resolutions: ["1m", "5m", "15m", "30m", "60m", "1D", "1W", "1M"],
    supports_marks: false,
    supports_timescale_marks: false
  };
};

Datafeeds.UDFCompatibleDatafeed.prototype.getServerTime = function(callback) {
  if (this._configuration.supports_time) {
    this._send(this._datafeedURL + "/time", {})
      .done(function(response) {
        var time = +response;
        if (!isNaN(time)) {
          callback(time);
        }
      })
      .fail(function() {});
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype.on = function(event, callback) {
  if (!this._callbacks.hasOwnProperty(event)) {
    this._callbacks[event] = [];
  }

  this._callbacks[event].push(callback);
  return this;
};

Datafeeds.UDFCompatibleDatafeed.prototype._fireEvent = function(
  event,
  argument
) {
  if (this._callbacks.hasOwnProperty(event)) {
    var callbacksChain = this._callbacks[event];
    for (var i = 0; i < callbacksChain.length; ++i) {
      callbacksChain[i](argument);
    }

    this._callbacks[event] = [];
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype.onInitialized = function() {
  this._initializationFinished = true;
  this._fireEvent("initialized");
};

Datafeeds.UDFCompatibleDatafeed.prototype._logMessage = function(message) {
  if (this._enableLogging) {
    var now = new Date();
    console.log(
      now.toLocaleTimeString() + "." + now.getMilliseconds() + "> " + message
    );
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype._send = function(url, params) {
  var request = url;
  if (params) {
    for (var i = 0; i < Object.keys(params).length; ++i) {
      var key = Object.keys(params)[i];
      var value = encodeURIComponent(params[key]);
      request += (i === 0 ? "?" : "&") + key + "=" + value;
    }
  }

  this._logMessage("New request: " + request);
  var myInit = {
    method: "GET",
    mode: "cors",
    type: "json",
    cache: "default"
  };

  var myRequest = new Request(request, myInit);

  return $.ajax({
    type: "GET",
    url: request,
    contentType: "application/json",

    xhrFields: {
      withCredentials: false
    }
  });
};

Datafeeds.UDFCompatibleDatafeed.prototype._sendCors = function(url, params) {
  var request = url;
  if (params) {
    for (var i = 0; i < Object.keys(params).length; ++i) {
      var key = Object.keys(params)[i];
      var value = encodeURIComponent(params[key]);
      request += (i === 0 ? "?" : "&") + key + "=" + value;
    }
  }

  this._logMessage("New request: " + request);
  var myInit = {
    method: "GET",
    mode: "cors",
    type: "json",
    cache: "default"
  };

  var myRequest = new Request(request, myInit);

  return fetch(myRequest, myInit);
};

Datafeeds.UDFCompatibleDatafeed.prototype._initialize = function() {
  var that = this;

  this._send("/public/vendor/charting_library/datafeed/udf/config.json")
    .done(function(response) {
      var configurationData = parseJSONorNot(response);
      that._setupWithConfiguration(configurationData);
    })
    .fail(function(reason) {
      that._setupWithConfiguration(that.defaultConfiguration());
    });
};

Datafeeds.UDFCompatibleDatafeed.prototype.onReady = function(callback) {
  var that = this;
  if (this._configuration) {
    setTimeout(function() {
      callback(that._configuration);
    }, 0);
  } else {
    this.on("configuration_ready", function() {
      callback(that._configuration);
    });
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype._setupWithConfiguration = function(
  configurationData
) {
  this._configuration = configurationData;

  if (!configurationData.exchanges) {
    configurationData.exchanges = [];
  }

  //	@obsolete; remove in 1.5
  var supportedResolutions =
    configurationData.supported_resolutions ||
    configurationData.supportedResolutions;
  configurationData.supported_resolutions = supportedResolutions;

  //	@obsolete; remove in 1.5
  var symbolsTypes =
    configurationData.symbols_types || configurationData.symbolsTypes;
  configurationData.symbols_types = symbolsTypes;

  if (
    !configurationData.supports_search &&
    !configurationData.supports_group_request
  ) {
    throw new Error(
      "Unsupported datafeed configuration. Must either support search, or support group request"
    );
  }

  if (!configurationData.supports_search) {
    this._symbolSearch = new Datafeeds.SymbolSearchComponent(this);
  }

  if (configurationData.supports_group_request) {
    //	this component will call onInitialized() by itself
    this._symbolsStorage = new Datafeeds.SymbolsStorage(this);
  } else {
    this.onInitialized();
  }

  this._fireEvent("configuration_ready");
  this._logMessage("Initialized with " + JSON.stringify(configurationData));
};

//	===============================================================================================================================
//	The functions set below is the implementation of JavaScript API.

Datafeeds.UDFCompatibleDatafeed.prototype.getMarks = function(
  symbolInfo,
  rangeStart,
  rangeEnd,
  onDataCallback,
  resolution
) {
  if (this._configuration.supports_marks) {
    this._send(this._datafeedURL + "/marks", {
      symbol: symbolInfo.ticker.toUpperCase(),
      from: rangeStart,
      to: rangeEnd,
      resolution: resolution
    })
      .done(function(response) {
        onDataCallback(parseJSONorNot(response));
      })
      .fail(function() {
        onDataCallback([]);
      });
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype.getTimescaleMarks = function(
  symbolInfo,
  rangeStart,
  rangeEnd,
  onDataCallback,
  resolution
) {
  if (this._configuration.supports_timescale_marks) {
    this._send(this._datafeedURL + "/timescale_marks", {
      symbol: symbolInfo.ticker.toUpperCase(),
      from: rangeStart,
      to: rangeEnd,
      resolution: resolution
    })
      .done(function(response) {
        onDataCallback(parseJSONorNot(response));
      })
      .fail(function() {
        onDataCallback([]);
      });
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype.searchSymbols = function(
  searchString,
  exchange,
  type,
  onResultReadyCallback
) {
  var MAX_SEARCH_RESULTS = 30;

  if (!this._configuration) {
    onResultReadyCallback([]);
    return;
  }

  if (this._configuration.supports_search) {
    this._send(this._datafeedURL + "/search", {
      limit: MAX_SEARCH_RESULTS,
      query: searchString.toUpperCase(),
      type: type,
      exchange: exchange
    })
      .done(function(response) {
        var data = parseJSONorNot(response);

        for (var i = 0; i < data.length; ++i) {
          if (!data[i].params) {
            data[i].params = [];
          }

          data[i].exchange = data[i].exchange || "";
        }

        if (typeof data.s == "undefined" || data.s !== "error") {
          onResultReadyCallback(data);
        } else {
          onResultReadyCallback([]);
        }
      })
      .fail(function(reason) {
        onResultReadyCallback([]);
      });
  } else {
    if (!this._symbolSearch) {
      throw new Error(
        "Datafeed error: inconsistent configuration (symbol search)"
      );
    }

    var searchArgument = {
      searchString: searchString,
      exchange: exchange,
      type: type,
      onResultReadyCallback: onResultReadyCallback
    };

    if (this._initializationFinished) {
      this._symbolSearch.searchSymbols(searchArgument, MAX_SEARCH_RESULTS);
    } else {
      var that = this;

      this.on("initialized", function() {
        that._symbolSearch.searchSymbols(searchArgument, MAX_SEARCH_RESULTS);
      });
    }
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype._symbolResolveURL = "/symbols";

//	BEWARE: this function does not consider symbol's exchange
Datafeeds.UDFCompatibleDatafeed.prototype.resolveSymbol = function(
  symbolName,
  onSymbolResolvedCallback,
  onResolveErrorCallback
) {
  var that = this;

  if (!this._initializationFinished) {
    this.on("initialized", function() {
      that.resolveSymbol(
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback
      );
    });

    return;
  }

  var resolveRequestStartTime = Date.now();
  that._logMessage("Resolve requested");

  function onResultReady(data) {
    var postProcessedData = data;
    if (that.postProcessSymbolInfo) {
      postProcessedData = that.postProcessSymbolInfo(postProcessedData);
    }

    that._logMessage(
      "Symbol resolved: " + (Date.now() - resolveRequestStartTime)
    );

    onSymbolResolvedCallback(postProcessedData);
  }

  if (!this._configuration.supports_group_request) {
    //console.log("NOT GROUP REQUEST");
    // this._send(
    //   this._datafeedURL +
    //     "/symbol_info/" +
    //     symbolName.replace("_", "/").toUpperCase()
    // )
    //   .done(function(response) {
    //     var data = parseJSONorNot(response);

    //     if (data.s && data.s !== "ok") {
    //       onResolveErrorCallback("unknown_symbol");
    //     } else {
    //       onResultReady(data);
    //     }
    //   })
    //   .fail(function(reason) {
    //     that._logMessage("Error resolving symbol: " + JSON.stringify([reason]));
    //     onResolveErrorCallback("unknown_symbol");
    //   });
    setTimeout(function() {
      onResultReady({
        name: symbolName,
        ticker: symbolName,
        description: "Price",
        exchange: "QDEX",
        timezone: "America/Los_Angeles",
        has_intraday: true
      });
    }, 500)
  } else {
    if (this._initializationFinished) {
      this._symbolsStorage.resolveSymbol(
        symbolName,
        onResultReady,
        onResolveErrorCallback
      );
    } else {
      this.on("initialized", function() {
        that._symbolsStorage.resolveSymbol(
          symbolName,
          onResultReady,
          onResolveErrorCallback
        );
      });
    }
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype._historyURL = "/chart";

function getBaseCounter(market) {
  const parts = market.split("/")
  return {
    base: assetsBySymbol[parts[0]],
    counter: assetsBySymbol[parts[1]]
  }
}

Datafeeds.UDFCompatibleDatafeed.prototype.getBars = function(
  symbolInfo,
  resolution,
  rangeStartDate,
  rangeEndDate,
  onDataCallback,
  onErrorCallback
) {
  //	timestamp sample: 1399939200
  if (rangeStartDate > 0 && (rangeStartDate + "").length > 10) {
    throw new Error([
      "Got a JS time instead of Unix one.",
      rangeStartDate,
      rangeEndDate
    ]);
  }

  const { base, counter } = getBaseCounter(symbolInfo.ticker);

  console.log("Load prices ", symbolInfo, resolution, rangeStartDate, rangeEndDate);
  Apis.instance()
    .history_api()
    .exec("get_market_history", [
      base.id,
      counter.id,
      resolution,
      new Date(rangeStartDate*1000).toISOString().slice(0, -5),
      new Date(rangeEndDate*1000).toISOString().slice(0, -5)
    ]).then((data) => {

      console.log("chart data", data);
      const no_data = data.length == 0;
      const bars = transformPriceData(data, base, counter);
      console.log("Bars ", bars);

      onDataCallback(bars, {
        noData: no_data,
        nextTime: null
      });
    })

};

Datafeeds.UDFCompatibleDatafeed.prototype.subscribeBars = function(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  listenerGUID,
  onResetCacheNeededCallback
) {
  this._barsPulseUpdater.subscribeDataListener(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    listenerGUID,
    onResetCacheNeededCallback
  );
};

Datafeeds.UDFCompatibleDatafeed.prototype.unsubscribeBars = function(
  listenerGUID
) {
  this._barsPulseUpdater.unsubscribeDataListener(listenerGUID);
};

Datafeeds.UDFCompatibleDatafeed.prototype.calculateHistoryDepth = function(
  period,
  resolutionBack,
  intervalBack
) {};

Datafeeds.UDFCompatibleDatafeed.prototype.getQuotes = function(
  symbols,
  onDataCallback,
  onErrorCallback
) {
  this._send(this._datafeedURL + "/quotes", { symbols: symbols })
    .done(function(response) {
      var data = parseJSONorNot(response);
      if (data.s === "ok") {
        //	JSON format is {s: "status", [{s: "symbol_status", n: "symbol_name", v: {"field1": "value1", "field2": "value2", ..., "fieldN": "valueN"}}]}
        if (onDataCallback) {
          onDataCallback(data.d);
        }
      } else {
        if (onErrorCallback) {
          onErrorCallback(data.errmsg);
        }
      }
    })
    .fail(function(arg) {
      if (onErrorCallback) {
        onErrorCallback("network error: " + arg);
      }
    });
};

Datafeeds.UDFCompatibleDatafeed.prototype.subscribeQuotes = function(
  symbols,
  fastSymbols,
  onRealtimeCallback,
  listenerGUID
) {
  this._quotesPulseUpdater.subscribeDataListener(
    symbols,
    fastSymbols,
    onRealtimeCallback,
    listenerGUID
  );
};

Datafeeds.UDFCompatibleDatafeed.prototype.unsubscribeQuotes = function(
  listenerGUID
) {
  this._quotesPulseUpdater.unsubscribeDataListener(listenerGUID);
};

//	==================================================================================================================================================
//	==================================================================================================================================================
//	==================================================================================================================================================

/*
	It's a symbol storage component for ExternalDatafeed. This component can
	  * interact to UDF-compatible datafeed which supports whole group info requesting
	  * do symbol resolving -- return symbol info by its name
*/
Datafeeds.SymbolsStorage = function(datafeed) {
  this._datafeed = datafeed;

  this._exchangesList = ["NYSE", "FOREX", "AMEX"];
  this._exchangesWaitingForData = {};
  this._exchangesDataCache = {};

  this._symbolsInfo = {};
  this._symbolsList = [];

  //this._requestFullSymbolsList();
};

Datafeeds.SymbolsStorage.prototype._requestFullSymbolsList = function() {
  var that = this;

  for (var i = 0; i < this._exchangesList.length; ++i) {
    var exchange = this._exchangesList[i];

    if (this._exchangesDataCache.hasOwnProperty(exchange)) {
      continue;
    }

    this._exchangesDataCache[exchange] = true;

    this._exchangesWaitingForData[exchange] = "waiting_for_data";

    this._datafeed
      ._send(this._datafeed._datafeedURL + "/symbol_info", {
        group: exchange
      })
      .done(
        (function(exchange) {
          return function(response) {
            that._onExchangeDataReceived(exchange, parseJSONorNot(response));
            that._onAnyExchangeResponseReceived(exchange);
          };
        })(exchange)
      )
      .fail(
        (function(exchange) {
          return function(reason) {
            that._onAnyExchangeResponseReceived(exchange);
          };
        })(exchange)
      );
  }
};

Datafeeds.SymbolsStorage.prototype._onExchangeDataReceived = function(
  exchangeName,
  data
) {
  function tableField(data, name, index) {
    return data[name] instanceof Array ? data[name][index] : data[name];
  }

  try {
    for (var symbolIndex = 0; symbolIndex < data.symbol.length; ++symbolIndex) {
      var symbolName = data.symbol[symbolIndex];
      var listedExchange = tableField(data, "exchange-listed", symbolIndex);
      var tradedExchange = tableField(data, "exchange-traded", symbolIndex);
      var fullName = tradedExchange + ":" + symbolName;

      //	This feature support is not implemented yet
      //	var hasDWM = tableField(data, "has-dwm", symbolIndex);

      var hasIntraday = tableField(data, "has-intraday", symbolIndex);

      var tickerPresent = typeof data.ticker != "undefined";
      var symbolInfo = {
        name: "symbolName",
        base_name: [listedExchange + ":" + symbolName],
        description: tableField(data, "description", symbolIndex),
        full_name: fullName,
        legs: [fullName],
        has_intraday: hasIntraday,
        has_no_volume: tableField(data, "has-no-volume", symbolIndex),
        listed_exchange: listedExchange,
        exchange: tradedExchange,
        minmov:
          tableField(data, "minmovement", symbolIndex) ||
          tableField(data, "minmov", symbolIndex),
        minmove2:
          tableField(data, "minmove2", symbolIndex) ||
          tableField(data, "minmov2", symbolIndex),
        fractional: tableField(data, "fractional", symbolIndex),
        pointvalue: tableField(data, "pointvalue", symbolIndex),
        pricescale: tableField(data, "pricescale", symbolIndex),
        type: tableField(data, "type", symbolIndex),
        session: tableField(data, "session-regular", symbolIndex),
        ticker: tickerPresent
          ? tableField(data, "ticker", symbolIndex)
          : symbolName,
        timezone: tableField(data, "timezone", symbolIndex),
        supported_resolutions:
          tableField(data, "supported-resolutions", symbolIndex) ||
          this._datafeed.defaultConfiguration().supported_resolutions,
        force_session_rebuild:
          tableField(data, "force-session-rebuild", symbolIndex) || false,
        has_daily: tableField(data, "has-daily", symbolIndex) || true,
        intraday_multipliers: tableField(
          data,
          "intraday-multipliers",
          symbolIndex
        ) || ["1", "5", "15", "30", "60"],
        has_weekly_and_monthly:
          tableField(data, "has-weekly-and-monthly", symbolIndex) || false,
        has_empty_bars:
          tableField(data, "has-empty-bars", symbolIndex) || false,
        volume_precision: tableField(data, "volume-precision", symbolIndex) || 0
      };

      this._symbolsInfo[symbolInfo.ticker] = this._symbolsInfo[
        symbolName
      ] = this._symbolsInfo[fullName] = symbolInfo;
      this._symbolsList.push(symbolName);
    }
  } catch (error) {
    throw new Error(
      "API error when processing exchange `" +
        exchangeName +
        "` symbol #" +
        symbolIndex +
        ": " +
        error
    );
  }
};

Datafeeds.SymbolsStorage.prototype._onAnyExchangeResponseReceived = function(
  exchangeName
) {
  delete this._exchangesWaitingForData[exchangeName];

  var allDataReady = Object.keys(this._exchangesWaitingForData).length === 0;

  if (allDataReady) {
    this._symbolsList.sort();
    this._datafeed._logMessage("All exchanges data ready");
    this._datafeed.onInitialized();
  }
};

//	BEWARE: this function does not consider symbol's exchange
Datafeeds.SymbolsStorage.prototype.resolveSymbol = function(
  symbolName,
  onSymbolResolvedCallback,
  onResolveErrorCallback
) {
  var that = this;

  setTimeout(function() {
    if (!that._symbolsInfo.hasOwnProperty(symbolName)) {
      onResolveErrorCallback("invalid symbol");
    } else {
      onSymbolResolvedCallback(that._symbolsInfo[symbolName]);
    }
  }, 0);
};

//	==================================================================================================================================================
//	==================================================================================================================================================
//	==================================================================================================================================================

/*
	It's a symbol search component for ExternalDatafeed. This component can do symbol search only.
	This component strongly depends on SymbolsDataStorage and cannot work without it. Maybe, it would be
	better to merge it to SymbolsDataStorage.
*/

Datafeeds.SymbolSearchComponent = function(datafeed) {
  this._datafeed = datafeed;
};

//	searchArgument = { searchString, onResultReadyCallback}
Datafeeds.SymbolSearchComponent.prototype.searchSymbols = function(
  searchArgument,
  maxSearchResults
) {
  if (!this._datafeed._symbolsStorage) {
    throw new Error(
      "Cannot use local symbol search when no groups information is available"
    );
  }

  var symbolsStorage = this._datafeed._symbolsStorage;

  var results = []; // array of WeightedItem { item, weight }
  var queryIsEmpty =
    !searchArgument.searchString || searchArgument.searchString.length === 0;
  var searchStringUpperCase = searchArgument.searchString.toUpperCase();

  for (var i = 0; i < symbolsStorage._symbolsList.length; ++i) {
    var symbolName = symbolsStorage._symbolsList[i];
    var item = symbolsStorage._symbolsInfo[symbolName];

    if (
      searchArgument.type &&
      searchArgument.type.length > 0 &&
      item.type !== searchArgument.type
    ) {
      continue;
    }

    if (
      searchArgument.exchange &&
      searchArgument.exchange.length > 0 &&
      item.exchange !== searchArgument.exchange
    ) {
      continue;
    }

    var positionInName = item.name.toUpperCase().indexOf(searchStringUpperCase);
    var positionInDescription = item.description
      .toUpperCase()
      .indexOf(searchStringUpperCase);

    if (queryIsEmpty || positionInName >= 0 || positionInDescription >= 0) {
      var found = false;
      for (var resultIndex = 0; resultIndex < results.length; resultIndex++) {
        if (results[resultIndex].item === item) {
          found = true;
          break;
        }
      }

      if (!found) {
        var weight =
          positionInName >= 0 ? positionInName : 8000 + positionInDescription;
        results.push({ item: item, weight: weight });
      }
    }
  }

  searchArgument.onResultReadyCallback(
    results
      .sort(function(weightedItem1, weightedItem2) {
        return weightedItem1.weight - weightedItem2.weight;
      })
      .map(function(weightedItem) {
        var item = weightedItem.item;
        return {
          symbol: item.name,
          full_name: item.full_name,
          description: item.description,
          exchange: item.exchange,
          params: [],
          type: item.type,
          ticker: item.name
        };
      })
      .slice(0, Math.min(results.length, maxSearchResults))
  );
};

//	==================================================================================================================================================
//	==================================================================================================================================================
//	==================================================================================================================================================

/*
	This is a pulse updating components for ExternalDatafeed. They emulates realtime updates with periodic requests.
*/

Datafeeds.DataPulseUpdater = function(datafeed, updateFrequency) {
  this._datafeed = datafeed;
  this._subscribers = {};
};

Datafeeds.DataPulseUpdater.prototype.unsubscribeDataListener = function(
  listenerGUID
) {
  this._datafeed._logMessage("Unsubscribing " + listenerGUID);

  this._subscribers[listenerGUID].sockets.forEach(ws => {
    ws.close();
  });

  delete this._subscribers[listenerGUID];
};

Datafeeds.DataPulseUpdater.prototype.subscribeDataListener = function(
  symbolInfo,
  resolution,
  newDataCallback,
  listenerGUID
) {
  this._datafeed._logMessage("Subscribing " + listenerGUID);

  if (!this._subscribers.hasOwnProperty(listenerGUID)) {
    this._subscribers[listenerGUID] = {
      symbolInfo: symbolInfo,
      resolution: resolution,
      lastBarTime: NaN,
      sockets: []
    };
  }

  // minutes don't have suffix, add it
  if (Number.isInteger(parseInt(resolution))) {
    resolution = resolution + "m";
  }

  var streamUrl = "http://testnet-02.quantachain.io:7200/stream/chart/" + symbolInfo.ticker + "?interval=" + resolution.toLowerCase()
  console.log("Stream Subscribe ", symbolInfo, streamUrl);
  var stream = new EventSource(streamUrl);

  stream.onmessage = function(event) {
    const data = JSON.parse(event.data);
    const res = {
      time: data.time*1000,
      volume: +data.volume,
      open: +data.open,
      high: +data.high,
      low: +data.low,
      close: +data.close
    }
    console.log(data, res);
    newDataCallback(res);
  };

  this._subscribers[listenerGUID].sockets.push(stream);
};

Datafeeds.DataPulseUpdater.prototype.periodLengthSeconds = function(
  resolution,
  requiredPeriodsCount
) {
  console.log("periodLengthSeconds", resolution);
  var daysCount = 0;

  if (resolution === "D") {
    daysCount = requiredPeriodsCount;
  } else if (resolution === "M") {
    daysCount = 31 * requiredPeriodsCount;
  } else if (resolution === "W") {
    daysCount = 7 * requiredPeriodsCount;
  } else {
    daysCount = requiredPeriodsCount * resolution / (24 * 60);
  }

  return daysCount * 24 * 60 * 60;
};

Datafeeds.QuotesPulseUpdater = function(datafeed) {
  this._datafeed = datafeed;
  this._subscribers = {};
  this._updateInterval = 60 * 1000;
  this._fastUpdateInterval = 10 * 1000;
  this._requestsPending = 0;

  var that = this;

  setInterval(function() {
    that._updateQuotes(function(subscriptionRecord) {
      return subscriptionRecord.symbols;
    });
  }, this._updateInterval);

  setInterval(function() {
    that._updateQuotes(function(subscriptionRecord) {
      return subscriptionRecord.fastSymbols.length > 0
        ? subscriptionRecord.fastSymbols
        : subscriptionRecord.symbols;
    });
  }, this._fastUpdateInterval);
};

Datafeeds.QuotesPulseUpdater.prototype.subscribeDataListener = function(
  symbols,
  fastSymbols,
  newDataCallback,
  listenerGUID
) {
  if (!this._subscribers.hasOwnProperty(listenerGUID)) {
    this._subscribers[listenerGUID] = {
      symbols: symbols,
      fastSymbols: fastSymbols,
      listeners: []
    };
  }

  this._subscribers[listenerGUID].listeners.push(newDataCallback);
};

Datafeeds.QuotesPulseUpdater.prototype.unsubscribeDataListener = function(
  listenerGUID
) {
  delete this._subscribers[listenerGUID];
};

Datafeeds.QuotesPulseUpdater.prototype._updateQuotes = function(symbolsGetter) {
  if (this._requestsPending > 0) {
    return;
  }

  var that = this;
  for (var listenerGUID in this._subscribers) {
    this._requestsPending++;

    var subscriptionRecord = this._subscribers[listenerGUID];
    this._datafeed.getQuotes(
      symbolsGetter(subscriptionRecord),

      // onDataCallback
      (function(subscribers, guid) {
        // eslint-disable-line
        return function(data) {
          that._requestsPending--;

          // means the subscription was cancelled while waiting for data
          if (!that._subscribers.hasOwnProperty(guid)) {
            return;
          }

          for (var i = 0; i < subscribers.length; ++i) {
            subscribers[i](data);
          }
        };
      })(subscriptionRecord.listeners, listenerGUID),
      // onErrorCallback
      function(error) {
        that._requestsPending--;
      }
    );
  }
};


export default Datafeeds;