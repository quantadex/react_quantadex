var fs = require('fs');
var crypto = require('crypto');
import { hash } from "@quantadex/bitsharesjs";
import createHash from "create-hash";
import createHmac from "create-hmac";
import { BigNumber } from "bignumber.js";
const BN = require('bn.js');

var wsString = "wss://mainnet-lb.quantachain.io";
import { Apis } from "@quantadex/bitsharesjs-ws";
var aesjs = require('aes-js');
import MersenneTwister from "./mersene.js"
var readRandom = require('read-random')

//const chainId = "bb2aeb9eebaaa29d79ed81699ee49a912c19c59b9350f8f8d3d81b12fa178495"
const chainId = "9809209586f5aef6c4c8f5c24ee2d7c4104b64f951b1c32355e3d7d93fe16daa"

function convertToByteBuffer(arr) {
	var buf = new Buffer(arr.length * 4);
	arr.forEach((e, index) => {
		buf.writeUInt32LE(e, index);
	})
	return buf
}

var y = 2463534242;

function xorshift() {
	y ^= (y << 13);
	y ^= (y >> 17);
	return y ^= (y << 5);
}

function randomN(secret, buffer, min, max) {
	//console.error(buffer.toString("hex"));

	const digest = createHmac("sha512", secret)
		.update(buffer)
		.digest();
	var bigNum = new BN(digest);
	bigNum = bigNum.xor(new BN(buffer))
	return bigNum.mod(new BN(max - min)).add(new BN(min)).toNumber()
}

function bufferXor(a, b) {
	var length = Math.max(a.length, b.length)
	var buffer = Buffer.allocUnsafe(length)

	for (var i = 0; i < length; ++i) {
		buffer[i] = a[i] ^ b[i]
	}

	return buffer
}


		// ANSI X9.31 (== X9.17) algorithm, but using AES in place of 3DES.
		//
		// single block:
		// t = encrypt(time)
		// dst = encrypt(t^seed)
		// seed = encrypt(t^dst)
var seed;

function randomEncrypt(secret, buffer, min, max) {
	// var text = buffer.toString().padStart(16, ' ');
	// var t = aesjs.utils.utf8.toBytes(text)
	var t = createHash("md5").update(buffer).digest();

	var key = createHash("md5").update(secret).digest();

	if (!seed) {
		console.error("Create initial seed");
		seed = createHash("md5").update(t).digest();
	}

	// create an instance of the block cipher algorithm
	var aes = new aesjs.AES(key);

	//t = encrypt(time)
	var t = aes.encrypt(t);

	//console.error(seed.toString('hex'));

	// dst = encrypt(t ^ seed)
	var dst = bufferXor(t,seed)

	//console.error("dst_before", dst.toString('hex'))
	var dst = aes.encrypt(dst);
	//console.error("dst_after", dst.toString('hex'))

	var seedt = bufferXor(t, dst)
	seed = aes.encrypt(seedt);

	var bigNum = new BN(dst);
	//return bigNum.mod(new BN(Math.pow(2, 31) - 1)).toNumber()
	return bigNum.mod(new BN(max - min)).add(new BN(min)).toNumber()
	//return bigNum.toNumber()
}

var m = new MersenneTwister()
var ts = "2056d39b69390583d75859029a0b7dd0d2dd6d465cea47eb2aa21b9ef0bd3dc8035b595bdfe3acf04b8bb08ecee9cabbe205cd46fe0d3c8e764bfa64e978bc0b81" + "0082d56e2da2db5996316294333df32f5fce03ee" + "0";

function rejectSampling(max) {	
	var usable = Math.pow(2,32)/max;
	var retrieved = null;
	do {
		retrieved = m.int31()
	} while(retrieved < usable)

	return retrieved % max
}
var data = fs.readFileSync('./1k_rolls.json', 'utf8')
const jsData = JSON.parse(data);

function generate(count) {
	for (var i=0; i < count; i++) {
		const e = jsData[Math.floor(Math.random()*500)]
		const str = e.blocksig + "" + e.tx + "0";
		
		ts = createHash("sha1").update(str).digest();
		//console.error(ts);
		const n = randomEncrypt(Buffer.from(chainId, 'hex'), ts, 0, 2147483647)
		// var m = new MersenneTwister(ts)
		// var n = null;
		// for (var x=0; x <= (i%100); x++) {
		// 	n = m.int31()
		// }
		//const n = rejectSampling(1000)
		//const n = randomN(chainId, str, 0, 2147483647)
		//const n = m.int31();
		console.log(n.toString().padStart(10, ' '));
	}
	// fs.readFile('./1k_rolls.json', 'utf8', function (err, data) {
	// 	if (err) throw err;
	// 	const js = JSON.parse(data);
	// 	console.error("loaded ", js.length);
	// 	js.forEach((e,index)=> {
	// 		//const block = await Apis.instance().db_api().exec("get_block", [1000000+i])
	// 		//console.log(block);
	// 		const str = e.blocksig + "" + e.tx + "0";

	// 		// var hrTime = process.hrtime()
	// 		// var nsTime = hrTime[0] * 1000000 + hrTime[1] / 1000
	// 		//console.error(nsTime*1000)
	// 		const n = randomEncrypt(Buffer.from(chainId, 'hex'), str, 1, 10000)
	// 		//const n = Math.floor(Math.random() * 10000)
	// 		//const buf = crypto.randomBytes(4)
	// 		//console.log((new BN(buf).toNumber()% 10000).toString().padStart(10, ' '));

	// 		// if (index == count){
	// 		// 	process.exit()
	// 		// }
	// 	})
	// })
}

function generate2(n) {
		readRandom(4*n, function (error, buf) {
			for (var i = 0; i < n; i++) {
				console.log((buf.readUInt32BE(i)).toString().padStart(10, ' '));
			}
		})
}

console.log(`#==================================================================
# generator hmac512  seed = 1
#==================================================================
type: d
count: ` + process.argv[2] +`
numbit: 32`);
generate2(process.argv[2]|| 10)