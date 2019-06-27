const fetch = require('node-fetch');
//var wsString = "ws://testnet-01.quantachain.io:8090";
var wsString = "wss://mainnet-lb.quantachain.io";

import { Apis } from "@quantadex/bitsharesjs-ws";
import { hash } from "@quantadex/bitsharesjs";
import createHash from "create-hash";

var url ="https://wya99cec1d.execute-api.us-east-1.amazonaws.com/mainnet/account?filter_field=operation_type&filter_value=50&size=1000"

async function main() {
	await Apis.instance(wsString, true, 3000, { enableOrders: false }).init_promise

	const data = await fetch(url)
		.then(e => e.json())
		.then(async e => {
			const data = []
			for (var i=0; i < e.length; i++) {
				const block = await Apis.instance().db_api().exec("get_block", [e[i].operation_history.op_object.block_id])
				data.push({
					outcome: e[i].operation_history.op_object.outcome,
					blockid: e[i].operation_history.op_object.block_id,
					tx: e[i].operation_history.op_object.tx,
					blockhash: block.previous,
					blocksig: block.witness_signature
				})
			}
			return data;
		})


			// var buf = new Buffer(10001);
			// data.forEach((e, index) => {
			// 	buf.writeUInt8(e, index);
			// })
			// console.log(buf.toString())
		// 	return data;
		// })

		console.log(JSON.stringify(data));
}

//12789986 -> 00c328e2ae45aaf9d76c39182ab25da4a1dc2f3d
// 00c328e17177b2f155e49823d0685e8718548124
// 00c328e2ae45aaf9d76c39182ab25da4a1dc2f3d
// 						20a92d1aa3ad29a7e7c43d2b4df378dcd1117f500a87625b3b167b7d
function reverseEndian(x) {
	return (((x >> 0x18) & 0xFF))
		| (((x >> 0x10) & 0xFF) << 0x08)
		| (((x >> 0x08) & 0xFF) << 0x10)
		| (((x) & 0xFF) << 0x18)
		;
}

function toBytesInt32View(num) {
	const arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
	const view = new DataView(arr);
	view.setUint32(0, num, true); // byteOffset = 0; litteEndian = false
	console.log(arr,view)
	return view;
}

function toBytesInt32(num) {
	const arr = new Uint8Array([
		(num & 0xff000000) >> 24,
		(num & 0x00ff0000) >> 16,
		(num & 0x0000ff00) >> 8,
		(num & 0x000000ff)
	]);
	return arr.buffer;
}

// console.log(toBytesInt32(reverseEndian(12789986)));
// const previous = "00c328e17177b2f155e49823d0685e8718548124";
// const prevBuff = Buffer.from(previous,'hex')
// const read32 = prevBuff.readInt32BE(0) + 1;
// console.log("read32", read32);

// const buf = Buffer.allocUnsafe(4);
// buf.writeInt32LE(reverseEndian(12789986), 0);
// const h = createHash("sha224")
// 	.update(toBytesInt32View(reverseEndian(12789986)))
// 	.digest()

// console.log(h.slice(0,20).toString('hex'));

main().then(() =>{process.exit()})