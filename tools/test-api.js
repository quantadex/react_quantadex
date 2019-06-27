const fetch = require('node-fetch');
//var wsString = "ws://testnet-01.quantachain.io:8090";
var wsString = "wss://mainnet-lb.quantachain.io";
import GrapheneApi from "@quantadex/bitsharesjs-ws/cjs/src/GrapheneApi";
import ChainWebSocket from "@quantadex/bitsharesjs-ws/cjs/src/ChainWebSocket";

import { hash } from "@quantadex/bitsharesjs";
// import GrapheneApi from "@quantadex/bitsharesjs-ws/es/src/GrapheneApi";
import createHash from "create-hash";

var url = "https://wya99cec1d.execute-api.us-east-1.amazonaws.com/testnet/account?filter_field=operation_type&filter_value=50&size=1000"

async function main() {
	// await Apis.instance(wsString, true, 3000, { enableOrders: false }).init_promise
	let conn = new ChainWebSocket(wsString, () => { }, 3000, true,() =>{});
	await conn.login("","")

	var api = new GrapheneApi(conn,"asset");
	console.log("connect?");
	try {
		const out = await api.init()
		console.log("connected");
		const block = await api.exec("get_asset_holders", ["1.3.10", 0, 100])
		console.log(block);
		
		const count = await api.exec("get_asset_holders_count", ["1.3.10"])
		console.log("Count",count);

	}catch(e) {
		console.log(e);
	}
}

main().then(e=> {})