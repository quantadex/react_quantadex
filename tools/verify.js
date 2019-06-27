var fs = require('fs');
import { hash } from "@quantadex/bitsharesjs";
import createHash from "create-hash";
import createHmac from "create-hmac";
import { BigNumber } from "bignumber.js";
const BN = require('bn.js');


//const chainId = "bb2aeb9eebaaa29d79ed81699ee49a912c19c59b9350f8f8d3d81b12fa178495"
const chainId = "9809209586f5aef6c4c8f5c24ee2d7c4104b64f951b1c32355e3d7d93fe16daa"

function convertToByteBuffer(arr) {
	var buf = new Buffer(arr.length*4);
	arr.forEach((e, index) => {
		buf.writeUInt32LE(e,index);
	})
	return buf
}

function randomN(secret, buffer, min, max) {
	const digest = createHmac("sha512", secret)
		.update(buffer)
		.digest();
	var bigNum = new BN(digest);
	//bigNum = bigNum.xor(new BN(buffer))
	return bigNum.mod(new BN(max - min)).add(new BN(min)).toNumber()
}

fs.readFile('./282.txt', 'utf8', function (err, data) {
	if (err) throw err;
	//console.log(data);
	const js = JSON.parse(data);
	// console.log(js);

	const out = []
	js.forEach(e=> {
			const str = e.blocksig + "," + e.tx + ",0";
		const digest = createHmac("sha512", secret)
			.update(buffer)
			.digest();
			
		const n = randomN(chainId, Buffer.from(str), 1, 10000)
		console.error(str, parseInt(n/100), e.outcome);
		out.push(n)
	})
	//console.log(out);
	console.log(convertToByteBuffer(out).toString());
});
