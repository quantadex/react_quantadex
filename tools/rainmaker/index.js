import lodash from 'lodash'
import { Apis } from "@quantadex/bitsharesjs-ws";
import fetch from "node-fetch"
import * as firebase from 'firebase';
import ApplicationApi from "../../src/common/api/ApplicationApi";
import { PrivateKey } from "@quantadex/bitsharesjs";
import { signAndBroadcast } from "../../src/common/Transactions";

const CONFIG = {
    mainnet: {
        ws: "wss://mainnet-lb.quantachain.io",
        api: 'https://wya99cec1d.execute-api.us-east-1.amazonaws.com/mainnet/'
    },
    testnet: {
        ws: "ws://testnet-01.quantachain.io",
        api: 'https://wya99cec1d.execute-api.us-east-1.amazonaws.com/testnet/'
    }
}

const static_usd_price = {
    "1.3.0": 0.10,
    "1.3.1": 12000,
    "1.3.4": 400,
    "1.3.3": 200
}

function get_history(dt) {
    return fetch(CONFIG[process.env.NETWORK].api + 'account?filter_field=operation_type&filter_value=50&size=1000&from_date=' + dt).then(e => e.json())
}

/**
 * 
 * @param {int} total_n  total number of users we want to tip
 * @param {int} lucky number of users (inclusive) which are lucky, random picked - rolled
 * @param {array} history history that we want to evaluate this data
 * @param {float} minimum_loss - the absolute USD equivalent to get the tip
 * @param {map} usd_price_map -  key the with coin name, with USD rate.
 */
function get_rewardee(total_n, lucky,  history, minimum_loss, usd_price_map, assets) {
    const profit = {}
    // console.log(history)
    for (let op of history) {
        const data = op.operation_history.op_object
        const user_id = data.account_id
        const asset_id = data.payout.asset_id
        const payout = (data.payout.amount / Math.pow(10, assets[asset_id].precision)) * (usd_price_map[asset_id] || 0.01)

        profit[user_id] = (profit[user_id] || 0) + payout
    }
    var profit_flat = lodash.map(profit,(e, k) => { 
        return {user_id: k, profit: e} 
    })

    return filter_users_to_tip(profit_flat, total_n, lucky, minimum_loss)
}

function filter_users_to_tip(profit_flat, total_n, lucky, minimum_loss) {
    const sorted_profit = lodash.sortBy(profit_flat, "profit")
    const profit_users = lodash.filter(sorted_profit, e=> e.profit > minimum_loss)    
    const loss_users_f = lodash.filter(sorted_profit, e=> e.profit <= minimum_loss)    
    const loss_users = loss_users_f.splice(0, total_n - lucky)
    const lucky_users = (lodash.shuffle(loss_users_f.concat(profit_users))).slice(0, lucky)
    
    //console.log("Result? ", loss_users, lucky_users)
    return {
        loss_users, lucky_users
    }
}

async function get_assets() {
    const assets = await Apis.instance().db_api().exec("list_assets", ["A", 100])
	return lodash.keyBy(assets, "id")
}

async function send_msg(message, metadata) {
    var ref = firebase.app().database().ref()
    const channel_ref = ref.child(`quantadice/${process.env.NETWORK}_channel_1`)
    await channel_ref.push().set({
        user: "rainbot",
        message: message,
        bet_ids: [],
        date: Date.now(),
        metadata: metadata
    })
}

function GetAccount(id) {
	return Apis.instance().db_api().exec("get_accounts", [[id]]).then(e => {
		return e[0]
	})
}

async function get_users(rewards) {
    const users = []
    for (var user of rewards) {
        users.push(await GetAccount(user.user_id))
    }
    return users
}

function prepare_message(users, amount_to_send) {
    var msg =  `Rainbot💧💧💧💧 has tipped the following ${users.length} users ${amount_to_send} QDEX each: ${lodash.map(users,"name").join(" ")}`
    return msg
}

function transfer(from, to, amount, asset_id, memo) {
    return ApplicationApi.transfer({ 
        from_account: from,
        to_account: to,
        amount: amount,
        asset: asset_id,
        memo: memo,
        broadcast: true,
        encrypt_memo: false,
    }).then((tr) => {
        return signAndBroadcast(tr, PrivateKey.fromWif(process.env.RAINBOT_KEY)).then(() => {
            })
    }).catch(e => {
        throw e
    })
}
async function main() {
    // INITIALIZE CODE
    await Apis.instance(CONFIG[process.env.NETWORK].ws, true, 5000, { enableOrders: true }).init_promise
    const config = {
        apiKey: "AIzaSyCwbyI8f9wUMIXE34-MZRKM_O9xixMiJn8",
        authDomain: "quantadice-01.firebaseapp.com",
        databaseURL: "https://quantadice-01.firebaseio.com",
        projectId: "quantadice-01",
        storageBucket: "quantadice-01.appspot.com",
        messagingSenderId: "81485966475",
        appId: "1:81485966475:web:dbb871925a9b99a2"
    }

    firebase.initializeApp(config);

    const assets = await get_assets()
    // get current time - 5 minutes
    const minimum_loss = parseFloat(process.env.MINIMUM_LOSS)
    const now = new Date()
    const dt = new Date(now - ((parseInt(process.env.INTERVAL)||5) * 60 * 1000))
    const history = await get_history(dt.toJSON().slice(0, -5))
    const tipped_users = get_rewardee(5, 1, history, minimum_loss, static_usd_price, assets)
    const users_info = await get_users(tipped_users.loss_users.concat(tipped_users.lucky_users))
    const users_id = lodash.map(users_info, (e) => { return {id: e.id, name: e.name} })
    const amount_to_send = parseInt(process.env.AMOUNT_TO_SEND);
    
    if (users_id.length > 0) {
        for (let user of users_id) {
            await transfer(process.env.ACCOUNT_ID, user.id, amount_to_send * Math.pow(10, 5), "QDEX", "Rainbot tip")
        }
        await send_msg(prepare_message(users_info, amount_to_send), { bot: "rainbot", users: users_id, amount: amount_to_send, asset: "QDEX" })
    }
    

    process.exit()
}

main()



/*
TEST



    // filter_users_to_tip([
    //     {user_id: 0, profit: -5},
    //     {user_id: 0, profit: -4},
    //     {user_id: 0, profit: -3},
    //     {user_id: 0, profit: -2},
    //     {user_id: 0, profit: -1},
    //     {user_id: 0, profit: 7},
    //     {user_id: 0, profit: 8},
    //     {user_id: 0, profit: 9},
    //     {user_id: 0, profit: 10},
    // ], 5, 2, 0)

    // filter_users_to_tip([
    //     {user_id: 0, profit: 5},
    //     {user_id: 0, profit: 4},
    //     {user_id: 0, profit: 3},
    //     {user_id: 0, profit: 2},
    //     {user_id: 0, profit: 1},
    //     {user_id: 0, profit: 7},
    //     {user_id: 0, profit: 8},
    //     {user_id: 0, profit: 9},
    //     {user_id: 0, profit: 10},
    // ], 5, 2, 0)    
    */