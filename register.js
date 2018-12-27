import ApplicationApi from "./src/common/api/ApplicationApi";
import { Apis } from "@quantadex/bitsharesjs-ws";
import { signAndBroadcast } from "./src/common/Transactions";
import { PrivateKey, PublicKey, Aes, key, ChainStore } from "@quantadex/bitsharesjs";

var wsString = "wss://testnet-01.quantachain.io:8095";
const registrar = "1.2.6";

/*
suggest_brain_key
{
  "brain_priv_key": "AZYMOUS WROCHT SWEER ATTRAP LITHO SKIP BRIBE FOURTH BRAYER BRAZER ENGRAFF PLYER BLANKLY UNETHIC BEDIKAH PATCHY",
  "wif_priv_key": "5JxuK8xBRfbkqcnLrPmHRKvT9obdA8qZhqaAKqVvpJcYBdBtWAX",
  "pub_key": "QA6yQiNYRUNourci9oG3simE4FT22PeSHuoyYkMGdukQMiYhxutb"
}
*/

export function registerAccount(userId, publicKey) {
	const pKey = PrivateKey.fromWif(process.env.KEY);

	return Apis
	.instance(wsString, true, 3000, { enableOrders: true })
	.init_promise
	.then((res) => {
		return ApplicationApi.create_account(publicKey, publicKey, publicKey, userId, registrar, registrar, 0, false)
		.then((tr) =>{
			//console.log(tr);
			return signAndBroadcast(tr, pKey)
		})
		.then((tr) => {
			return ApplicationApi.transfer({ 
				from_account: registrar,
				to_account: userId,
				amount: 10000 * 100000, // precision of QDEX
				asset: "QDEX",
				memo: "fantasy registration",
				broadcast: true,
				encrypt_memo: false,			
			}).then((tr) => {
				//console.log(tr);
				return signAndBroadcast(tr, pKey)
			})
		})
	})
}

// registerAccount("test3", "QA6yQiNYRUNourci9oG3simE4FT22PeSHuoyYkMGdukQMiYhxutb").then(e=> {
// 	console.log("good?", e);
// 	// try {
// 	// 	Apis.close();
// 	// }catch(e) {}
// })
// .catch(e => {
// 	console.log("exception", e);
// 	//Apis.close();
// })