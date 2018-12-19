import utils from "./utils";

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
		let date = new Date(current.key.open);

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

		prices.push({ time: date.getTime(), open, high, low, close, volume });
	}

	return prices;
}