import React, { Component } from 'react';
import { Apis } from "@quantadex/bitsharesjs-ws";
import lodash from 'lodash';
import { css } from 'emotion';

const wsString = "wss://mainnet-api.quantachain.io:8095"

const container = css`
    width: 100%;
    max-width: 1157px;
    font-size: 1.1em;

    .table-container {
        border-radius: 3px;
        user-select: none;
    }

    thead {
        color: #999;
    }

    td {
        padding: 0 10px;
        line-height: 40px;
        white-space: nowrap;
    }

    tbody tr:hover {
        background-color: #f2f2f2;
        a {
            text-decoration: underline;
        }
    }

    .blue {
        color: #4cacac;
    }

    .cursor-pointer {
        cursor: pointer;
    }

    .explorer-link, .trade-link {
        padding: 10px;
        border-radius: 6px;
        font-size: 21px;
        box-shadow: 0 0 2px rgba(0,0,0,0.2);
        min-width: 225px;
        text-align: center;
        text-decoration: none;
    }

    .explorer-link {
        border: 1px solid #66d7d7;
        color: #66d7d7;
    }

    .trade-link {
        background-color: #66d7d7;
        color: #fff;
    }

    .issuer-tag {
		border-radius: 2px;
		background-color: #eee;
		font-size: 11px;
		padding: 3px 5px;
		color: #333;
		vertical-align: top;
        margin-left: 2px;
        text-decoration: none !important;
	}
`
var symbol_map = {}
var binance_data = {}
export default class MarketBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            markets: {},
            allMarkets: true
        };

        this.getMarketsData = this.getMarketsData.bind(this)
    }

    maxPrecision(amount, precision) {
        const dotIndex = amount.indexOf('.')
        if (dotIndex !== -1 && amount.length - dotIndex -1 > precision) {
            amount = amount.slice(0, dotIndex + precision + 1)
        }
        return amount
    }

    getMarketsData(markets, get_binance=false) {
        var binance_symbol = []
        for (const coin of Object.keys(markets.markets)) {
            for (const market of markets.markets[coin]) {
                if (get_binance && market.benchmarkSymbol) {
                    let symbol = market.benchmarkSymbol.split(":")[1].replace("/", "")
                    symbol_map[market.name] = symbol
                    binance_symbol.push(symbol.toLowerCase() + '@ticker')
                }

                var pair = market.name.split('/');
                Apis.instance().db_api().exec("get_ticker", [assetsBySymbol[pair[1]].id, assetsBySymbol[pair[0]].id])
                .then(data => {
                    data.pair = market.name
                    const list = this.state.markets
                    list[market.name] = data
                    this.setState({markets: list})
                })
            }
        }

        if (get_binance) {
            // console.log(binance_symbol, symbol_map)
            const binance_socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + binance_symbol.join('/'));
            binance_socket.addEventListener('message', function (event) {
                const data = JSON.parse(event.data).data
                // console.log(data.P)
                binance_data[data.s] = {last_price: data.c, change: data.P}
            });
        }
        
    }

    componentDidMount() {
        Apis.instance(wsString, true, 3000, { enableOrders: true }).init_promise.then(() => {
            Apis.instance().db_api().exec("list_assets", ["A", 100]).then((assets) => {
                // console.log("assets ", assets);
                window.assets = lodash.keyBy(assets, "id")
                window.assetsBySymbol = lodash.keyBy(assets, "symbol")
                
                fetch("https://s3.amazonaws.com/quantachain.io/markets_mainnet.json").then(e => e.json())
                .then((e) => {
                    const markets = e;
                    this.getMarketsData(markets, true)
                    setInterval(() => {
                        this.getMarketsData(markets)
                    }, 3000)


                })
            
            })
        })
    }

    SymbolToken = ({ name, withLink= true }) => {
        const token = name.split("0X")
    
        return (<span className={container + " symbol"}>{token[0]}{token[1] && 
            (withLink ? 
            <a className="issuer-tag"
                href={"https://etherscan.io/token/0x" + token[1]} target="_blank">0x{token[1].substr(0, 4)}</a>
            
            : <span className="issuer-tag">0x{token[1].substr(0, 4)}</span>)
            }
            </span>
        )
    }

    render() {
        var markets = lodash.sortBy(this.state.markets, 'base_volume').reverse()
        return (
            <div className={container + " container px-3 py-5 qt-font-light"}>
                <h2><b>Markets</b></h2>
                <div className="table-container border table-responsive">
                    <table className="d-none d-sm-table w-100 text-secondary m-0">
                        <thead>
                            <tr className="border-bottom">
                                <td>Pair</td>
                                <td>Coin</td>
                                <td className="text-right">Last Price</td>
                                <td className="text-right">24h Change</td>
                                <td className="text-right">Best Ask</td>
                                <td className="text-right">Best Bid</td>
                                <td className="text-right">24h Volume</td>
                            </tr>
                        </thead>
                        <tbody>
                            {(this.state.allMarkets ? markets : markets.slice(0, 3)).map(market => {
                                const pairs = market.pair.split("/")
                                const binance_market = binance_data[symbol_map[market.pair]]
                                const percent_change = market.latest == 0 && binance_market ? binance_market.change : market.percent_change 
                                return (
                                    <tr key={market.pair} className="border-bottom">
                                        <td><a className="text-secondary" href={"/mainnet/exchange/" + market.pair.replace("/", "_") + location.search}><this.SymbolToken name={pairs[0]} withLink={false} />/<this.SymbolToken name={pairs[1]} withLink={false} /></a></td>
                                        <td><this.SymbolToken name={pairs[0]} /></td>
                                        {/* <td className="text-right">{this.maxPrecision(market.latest, precision)}</td> */}
                                        <td className="text-right blue">
                                            {market.latest == 0 ? 
                                                market.lowest_ask != 0 && market.highest_bid != 0 ?
                                                    ((parseFloat(market.highest_bid) + parseFloat(market.lowest_ask)) / 2).toFixed(5)
                                                    : binance_market ? 
                                                        Number(binance_market.last_price).toFixed(5)
                                                        : "-"
                                            : Number.parseFloat(market.latest).toFixed(5) }
                                        </td>
                                        <td className="text-right" 
                                            style={{color: (percent_change.startsWith("-") ? "red" : "green")}}>

                                            {(percent_change.startsWith("-") ? "" : "+") + percent_change}%
                                        </td>
                                        {/* <td className="text-right">{this.maxPrecision(market.lowest_ask, precision)}</td>
                                        <td className="text-right">{this.maxPrecision(market.highest_bid, precision)}</td> */}
                                        <td className="text-right">{market.lowest_ask == 0 ? "-" : Number.parseFloat(market.lowest_ask).toFixed(5) }</td>
                                        <td className="text-right">{market.highest_bid == 0 ? "-" : Number.parseFloat(market.highest_bid).toFixed(5) }</td>
                                        <td className="text-right">{market.base_volume + ' '} <this.SymbolToken name={pairs[1]} /></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <table className="d-table d-sm-none w-100 text-secondary m-0">
                        <thead>
                            <tr className="border-bottom">
                                <td>Pair</td>
                                <td className="text-right">Last Price</td>
                                <td className="text-right">24h Volume</td>
                            </tr>
                        </thead>
                        <tbody>
                            {(this.state.allMarkets ? markets : markets.slice(0, 3)).map(market => {
                                const pairs = market.pair.split("/")
                                const binance_market = binance_data[symbol_map[market.pair]]
                                return (
                                    <tr key={market.pair} className="border-bottom">
                                        <td><a className="text-secondary" href={"/mainnet/exchange/" + market.pair.replace("/", "_") + location.search}><this.SymbolToken name={pairs[0]} withLink={false} />/<this.SymbolToken name={pairs[1]} withLink={false} /></a></td>
                                        <td className="text-right blue">
                                            {market.latest == 0 ? 
                                                market.lowest_ask != 0 && market.highest_bid != 0 ?
                                                    ((parseFloat(market.highest_bid) + parseFloat(market.lowest_ask)) / 2).toFixed(5)
                                                    : binance_market ? 
                                                        Number(binance_market.last_price).toFixed(5)
                                                        : "-"
                                            : Number.parseFloat(market.latest).toFixed(5) }
                                        </td>
                                        <td className="text-right">{market.base_volume + ' '} <this.SymbolToken name={pairs[1]} /></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {/* <div className="text-center text-muted font-weight-bold pb-2 cursor-pointer"
                        onClick={() => this.setState({allMarkets: !this.state.allMarkets})}>. . .</div> */}
                </div>
                <div className="d-flex justify-content-center mt-5 flex-column-reverse flex-md-row">
                    <a className="explorer-link mr-md-5 mt-4 mt-md-0" href="http://explorer.quantadex.com/">Blockchain Explorer</a>
                    <a className="trade-link" href={"/mainnet/exchange/ETH_BTC" + location.search}>View Exchange</a>
                </div>
            </div>
        );
    }
}