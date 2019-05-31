import lodash from 'lodash';
import { FillOrder, LimitOrder } from "../../common/MarketClasses";
import { validMarketPair } from "../../common/PriceData";
import CONFIG from '../../config.js'

export async function processOrderHistory(data, userId) {
	const my_history = []
	const cancels = []
	var limitOrders = []

	data.filter((op) => op.operation_type == 2).map(item => {
		cancels.push(item.operation_history.op_object.order)
	})

	if (cancels.length > 0) {
		limitOrders = await fetch(CONFIG.getEnv().API_PATH + `/account?operation_type=1&account_id=${userId}&size=100&filter_field=operation_history__operation_result&filter_value=${cancels.join(',')}`, { mode: "cors" })
			.then(e => e.json())
			.then(e => {
				return lodash.keyBy(e, (o) => o.operation_history.operation_result.split(',')[1].replace(/"/g, '').replace(']', ''))
			})
	}
	data.forEach((filled) => {
		if (filled.operation_type == 2 && filled.operation_history.operation_result == "[0,{}]") {
			return
		}
		let baseId
		var order
		const type = filled.operation_type
		let op = filled.operation_history
		op.time = filled.block_data.block_time
		op.block_num = filled.block_data.block_num

		if (type == 2) {
			let limitOp = limitOrders[op.op_object.order].operation_history.op_object
			limitOp.sell_price = { base: limitOp.amount_to_sell, quote: limitOp.min_to_receive }
			limitOp.id = op.op_object.order
			limitOp.time = op.time

			baseId = validMarketPair(limitOp.amount_to_sell.asset_id, limitOp.min_to_receive.asset_id)[0]
			order = new LimitOrder(
				limitOp,
				window.assets,
				baseId
			);
		} else {
			baseId = validMarketPair(op.op_object.fill_price.base.asset_id, op.op_object.fill_price.quote.asset_id)[0]
			op.op = [{}, op.op_object]
			order = new FillOrder(
				op,
				window.assets,
				baseId
			);
		}
		my_history.push(order)
	})
	return my_history
}

