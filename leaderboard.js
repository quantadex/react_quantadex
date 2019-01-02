import { Apis } from "@quantadex/bitsharesjs-ws";
import lodash from "lodash"
import fetch from "node-fetch"
var wsString = "ws://testnet-01.quantachain.io:8090";

var assets = null;
var assetsBySymbol = null;
var markets = null;

const blacklist = [ "bitcherry", "quanta_foundation", "quanta_labs",
                    "quantasg-witness", "quantalabs-witness", "bitcherry-witness", 
                    "clockbound-witness", "flash-witness",
                    "long", 
                    "witness-account", "pooja", "crosschain1", "crosschain2",
                    "market-maker", "market-maker2", "market-maker3", 
                    "tokensale"];

function getAssets() {
    return Apis.instance().db_api().exec("list_assets", ["A", 100]).then((assets) => {
        assets = lodash.keyBy(assets, "id")
        assetsBySymbol = lodash.keyBy(assets, "symbol")
        return assets;
    })
}

function getBaseCounter(market) {
	const parts = market.split("/")
	return {
		base: assetsBySymbol[parts[0]],
		counter: assetsBySymbol[parts[1]]
	}
}

function getFilledHistory(base, counter) {
    return Apis.instance().history_api().exec("get_fill_order_history", [base, counter, 1000])
}

function getMarkets() {
    return fetch("https://s3.amazonaws.com/quantachain.io/markets.json").then(e => e.json())
    .then(async (e) => {
        markets = e;
        var marketData = [];
        var USD_value = {}
        // console.log("json ", markets.markets);

        for (const market of markets.markets) {
            var { base, counter } = getBaseCounter(market.name);
            const data = await Promise.all([Apis.instance()
                .db_api()
                .exec("get_ticker", [counter.id, base.id]),
            Apis.instance()
                .db_api()
                .exec("get_24_volume", [counter.id, base.id])])

            marketData.push({
                name: market.name,
                last: data[0].latest,
                base_volume: data[1].base_volume,
                quote_volume: data[1].quote_volume
            })
            if (counter.symbol == 'USD') {
                USD_value[base.id] = data[0].latest
                USD_value[counter.id] = 1.0
            }
        }

        return {marketData, USD_value}
    })
}

function computeTotalBalance(assets, USD_value, balance) {
    var total = 0
    balance.forEach((asset) => {
        const precision = assets[asset.asset_id].precision
        total += (asset.amount/10**precision) * parseFloat(USD_value[asset.asset_id])
    })
    return total
}

function getAccounts(start) {
    return Promise.all([Apis.instance().db_api().exec("lookup_accounts", [start, 100])])
    .then((res) => {
        const data = res[0]
        return data
    })
}

function getBalance(id) {
    return Promise.all([Apis.instance().db_api().exec("get_account_balances", [id, []])])
    .then((res) => {
        const data = res[0]
        return data
    }).catch((e) => {
        console.log(e)
    })
}

export function GetLeaderboard() {
    return Apis.instance(wsString, true, 3000, { enableOrders: false }).init_promise
    .then(async (e) => {
        var acc_data = []
        var acc_freq = {}
    
        var assets = await getAssets()
    
        var  {marketData, USD_value} = await getMarkets()
    
        var accounts = await getAccounts('')
        var list = accounts.slice(0, accounts.length -1)
        
        while (accounts.length > 1) {
            list.pop()
            accounts = await getAccounts(accounts[accounts.length - 1][0])
            list = list.concat(accounts)
        }
    
        for (var market of marketData) {
            var { base, counter } = getBaseCounter(market.name);
            const filled = await getFilledHistory(base.id, counter.id)
    
            for (var order of filled) {
                const accountId = order.op.account_id
                acc_freq[accountId] = (acc_freq[accountId] || 0) + 1
            }
         }
    
        for (let i=0; i <= list.length-1; i++) {
            const [username, userId] = [list[i][0], list[i][1]]
            
            if (blacklist.includes(username) || username.startsWith('test')) {
                continue
            }

            let balance = await getBalance(userId)
            let totalBalance = computeTotalBalance(assets, USD_value, balance)
            
            acc_data.push({
                username: username,
                userid: userId,
                totalBalance: totalBalance,
                frequency: acc_freq[userId] || 0
            })    
        }
    
        const balanceLeaderboard = lodash.sortBy(acc_data, "totalBalance").reverse()
        const freqLeaderboard = lodash.sortBy(acc_data, "frequency").reverse()
        const leaderboard = { balanceLeaderboard, freqLeaderboard }
        //console.log(leaderboard)
    
        return leaderboard
    })
}

// GetLeaderboard().then(() => {
//     process.exit()
// })