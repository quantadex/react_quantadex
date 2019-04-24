import { ops } from "@quantadex/bitsharesjs";

var trans = {
	"ref_block_num": 18517,
	"ref_block_prefix": 532182519,
	"expiration": "2019-01-03T22:12:12",
	"operations": [[
		10, {
			"fee": {
				"amount": 500000000,
				"asset_id": "1.3.0"
			},
			"issuer": "1.2.23",
			"symbol": "ETHERTEST2",
			"precision": 5,
			"common_options": {
				"max_supply": "100000000000",
				"market_fee_percent": 0,
				"max_market_fee": 1000,
				"issuer_permissions": 79,
				"flags": 0,
				"core_exchange_rate": {
					"base": {
						"amount": 1,
						"asset_id": "1.3.0"
					},
					"quote": {
						"amount": 1,
						"asset_id": "1.3.1"
					}
				},
				"whitelist_authorities": [],
				"blacklist_authorities": [],
				"whitelist_markets": [],
				"blacklist_markets": [],
				"description": "My fancy description",
				"extensions": []
			},
			"is_prediction_market": false,
			"extensions": []
		}
	]],
	"extensions": []
};

function test() {
	var b = ops.transaction.toBuffer(trans);
	console.log(b.toString('hex'));
}

test()