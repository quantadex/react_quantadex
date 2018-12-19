import { ChainStore } from "@quantadex/bitsharesjs";
import { Apis } from "@quantadex/bitsharesjs-ws";
import marketUtils from "./market_utils";
import WalletApi from "./api/WalletApi";

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