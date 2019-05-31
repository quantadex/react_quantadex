import utils from "./utils";
import { LimitOrder, FillOrder } from "./MarketClasses";
import Immutable from "immutable";

export function getBaseCounter(market) {
	if (!market) return {}
	const parts = market.split("/")
	return {
		base: assetsBySymbol[parts[0]],
		counter: assetsBySymbol[parts[1]]
	}
}

export function validMarketPair(a, b) {
	const pair = [a, b]
	const base = assets[a].symbol
	const counter = assets[b].symbol
	const symbolA = [base, counter]

	const foundA = window.marketsHash[symbolA.join("/")]

	return foundA ? pair : pair.reverse()
}


export function calculateStartDate(endDate, interval, ticks) {
	return new Date(endDate.getTime() - (interval * ticks))
}

export function transformPriceData(priceHistory, baseAsset, quoteAsset) {
	var prices = [];
	let open, high, low, close, volume;

	for (let i = 0; i < priceHistory.length; i++) {
		let current = priceHistory[i];
		if (!/Z$/.test(current.key.open)) {
			current.key.open += "Z";
		}
		let date = new Date(current.key.open).getTime();

		if (quoteAsset.id === current.key.quote) {
			high = utils.get_asset_price(
				current.high_base,
				baseAsset,
				current.high_quote,
				quoteAsset
			);
			low = utils.get_asset_price(
				current.low_base,
				baseAsset,
				current.low_quote,
				quoteAsset
			);
			open = utils.get_asset_price(
				current.open_base,
				baseAsset,
				current.open_quote,
				quoteAsset
			);
			close = utils.get_asset_price(
				current.close_base,
				baseAsset,
				current.close_quote,
				quoteAsset
			);
			volume = utils.get_asset_amount(
				current.quote_volume,
				quoteAsset
			);
		} else {
			low = utils.get_asset_price(
				current.high_quote,
				baseAsset,
				current.high_base,
				quoteAsset
			);
			high = utils.get_asset_price(
				current.low_quote,
				baseAsset,
				current.low_base,
				quoteAsset
			);
			open = utils.get_asset_price(
				current.open_quote,
				baseAsset,
				current.open_base,
				quoteAsset
			);
			close = utils.get_asset_price(
				current.close_quote,
				baseAsset,
				current.close_base,
				quoteAsset
			);
			volume = utils.get_asset_amount(
				current.base_volume,
				quoteAsset
			);
		}

		function findMax(a, b) {
			if (a !== Infinity && b !== Infinity) {
				return Math.max(a, b);
			} else if (a === Infinity) {
				return b;
			} else {
				return a;
			}
		}

		function findMin(a, b) {
			if (a !== 0 && b !== 0) {
				return Math.min(a, b);
			} else if (a === 0) {
				return b;
			} else {
				return a;
			}
		}

		if (low === 0) {
			low = findMin(open, close);
		}

		if (isNaN(high) || high === Infinity) {
			high = findMax(open, close);
		}

		if (close === Infinity || close === 0) {
			close = open;
		}

		if (open === Infinity || open === 0) {
			open = close;
		}

		if (high > 1.3 * ((open + close) / 2)) {
			high = findMax(open, close);
		}

		if (low < 0.7 * ((open + close) / 2)) {
			low = findMin(open, close);
		}

		prices.push({ time: date, open, high, low, close, volume });
	}

	return prices;
}

export function aggregateOrderBook(bids, asks, precision) {
	let constructBids = orderArray => {
		let bids = orderArray
			.sort((a, b) => {
				return parseFloat(a.price) - parseFloat(b.price);
			});

		// Sum bids at same price
		if (bids.length > 1) {
			for (let i = bids.length - 2; i >= 0; i--) {
				if (bids[i].price === bids[i + 1].price) {
					bids[i].base = (parseFloat(bids[i].base) + parseFloat(bids[i + 1].base)).toFixed(precision);
					bids[i].quote = (parseFloat(bids[i].quote) + parseFloat(bids[i + 1].quote)).toFixed(precision);
					bids.splice(i + 1, 1);
				}
			}
		}
		return bids;
	};
	// Loop over limit orders and return array containing asks
	let constructAsks = orderArray => {
		let asks = orderArray
			.sort((a, b) => {
				return parseFloat(a.price) - parseFloat(b.price);
			});

		// Sum asks at same price
		if (asks.length > 1) {
			for (let i = asks.length - 2; i >= 0; i--) {
				if (asks[i].price === asks[i + 1].price) {
					asks[i].base = (parseFloat(asks[i].base) + parseFloat(asks[i + 1].base)).toFixed(precision);
					asks[i].quote = (parseFloat(asks[i].quote) + parseFloat(asks[i + 1].quote)).toFixed(precision);
					asks.splice(i + 1, 1);
				}
			}
		}
		return asks;
	};

	return {
		bids: constructBids(bids),
		asks: constructAsks(asks),
	}
}

export function convertHistoryToOrderedSet(history, base) {
	let activeMarketHistory = Immutable.OrderedSet();
	history.forEach(order => {
		if (!order.op.is_maker) {
			activeMarketHistory = activeMarketHistory.add(
				new FillOrder(order, window.assets, base)
			);
		}
	})
	return activeMarketHistory
}