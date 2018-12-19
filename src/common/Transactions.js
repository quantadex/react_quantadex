import { ChainStore } from "@quantadex/bitsharesjs";
import { Apis } from "@quantadex/bitsharesjs-ws";
import marketUtils from "./market_utils";
import WalletApi from "./api/WalletApi";
import { Price, Asset, LimitOrderCreate} from "./MarketClasses";

export function createLimitOrder(
	account,
	sellAmount,
	sellAsset,
	buyAmount,
	buyAsset,
	expiration,
	isFillOrKill,
	fee_asset_id
) {
	var tr = WalletApi.new_transaction();

	let feeAsset = ChainStore.getAsset(fee_asset_id);
	if (
		feeAsset.getIn([
			"options",
			"core_exchange_rate",
			"base",
			"asset_id"
		]) === "1.3.0" &&
		feeAsset.getIn([
			"options",
			"core_exchange_rate",
			"quote",
			"asset_id"
		]) === "1.3.0"
	) {
		fee_asset_id = "1.3.0";
	}

	tr.add_type_operation("limit_order_create", {
		fee: {
			amount: 0,
			asset_id: fee_asset_id
		},
		seller: account,
		amount_to_sell: {
			amount: sellAmount,
			asset_id: sellAsset.get("id")
		},
		min_to_receive: {
			amount: buyAmount,
			asset_id: buyAsset.get("id")
		},
		expiration: expiration,
		fill_or_kill: isFillOrKill
	});
}

export function createLimitOrder2(order) {
	var tr = WalletApi.new_transaction();

	// let feeAsset = ChainStore.getAsset(fee_asset_id);
	// if( feeAsset.getIn(["options", "core_exchange_rate", "base", "asset_id"]) === "1.3.0" && feeAsset.getIn(["options", "core_exchange_rate", "quote", "asset_id"]) === "1.3.0" ) {
	//     fee_asset_id = "1.3.0";
	// }

	order = order.toObject();

	tr.add_type_operation("limit_order_create", order);
	return tr;
}

export function signAndBroadcast(tr, pKey) {
	return tr.set_required_fees().then(() => {
		tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
		console.log("serialized transaction:", tr.serialize().operations);
		return tr.broadcast()
			.then(() => {
				console.log("Call order update success!");
			})
			.catch(err => {
				console.error("exception ", err);
			});
	});
}

export function createLimitOrderWithPrice(user_id, is_buy, assets, base, counter, price, amount) {
	const priceObj = new Price({
		base: new Asset({
			asset_id: assets[base].id,
			precision: assets[base].precision
		}),
		quote: new Asset({
			asset_id: assets[counter].id,
			precision: assets[counter].precision
		})
	})

	priceObj.setPriceFromReal(parseFloat(price))
	const sellAmount = priceObj.base.clone()
	sellAmount.setAmount({ real: parseFloat(amount) });

	console.log("priceObj", priceObj, amount, sellAmount);

	return new LimitOrderCreate({
		for_sale: is_buy ? sellAmount : sellAmount.times(priceObj),
		expiration: null,
		to_receive: is_buy ? sellAmount.times(priceObj) : sellAmount,
		seller: user_id,
		fee: {
			asset_id: "1.3.0",
			amount: 0
		}
	});
}