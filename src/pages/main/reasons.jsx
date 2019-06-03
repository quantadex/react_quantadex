import { render } from "react-dom";
import React, { Component } from 'react';
import { css } from 'emotion';

const container = css`
    color: #4a4a4a;
    h2 {
        font-weight: bold;
    }

    p {
        font-size: 14px;
    }
`

export default class Reasons extends Component {
    render() {
        return (
            <div id="reasons" className={container + " container pb-5"}>
                <h1 className="text-center text-uppercase font-weight-bold mb-5">Top 10 Reasons to Switch</h1>
                <div className="d-flex flex-column flex-sm-row">
                    <div className="flex-column w-100 w-sm-50 px-3 px-sm-5">
                        <div className="mb-4">
                            <h2>Trade BTC on-chain</h2>
                            <p>
                                Trade your BTC tokens directly on-chain, without using wrapper or pegged tokens.
                                BTC is finally first class citizen on a DEX.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Low fees</h2>
                            <p>
                                Keep more of your profits  on QUANTA, because trading fees are lower than 
                                Binance's and there is no withdraw/deposit fees.  
                                Taker fee is 0.07% vs.0.075% on Binance.  
                                Maker fee is only 0.04% after rebate, and you can get a net profit of 0.03% by 
                                being high volume market maker (such as running market maker bots).
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Secured token custody</h2>
                            <p>
                                Secured cross-chain and decentralized orderbook, means that traders can use their 
                                private-key to withdraw assets from the exchange at anytime, and therefore have proof-of-key.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Sub-second trading speed</h2>
                            <p>
                                Not a swap! You will be trading on the fastest DEX.  
                                QUANTA's trading speed is not bottlenecked by smart contracts.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Multi-asset wallet</h2>
                            <p>
                                You can manage all your tokens in one wallet, because the QUANTA wallet is multi-asset.  
                                Declutter your life and stop worrying about keeping track of different wallets.
                            </p>
                        </div>
                    </div>
                    <div className="flex-column w-100 w-sm-50 px-3 px-sm-5">
                        <div className="mb-4">
                            <h2>Optional KYC</h2>
                            <p>
                                There is no KYC requirement if you trade only with other non-verified traders.
                                Getting verified will give more liquidity, because you can trade with verified traders as well.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Competitive token prices</h2>
                            <p>
                                QUANTA runs arbitrage bots that shares token liquidity with major exchanges such as Binance.  
                                This gives you access to the best prices.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Free token listing available</h2>
                            <p>
                                Move your ERC20 to QUANTA and create your own market.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Transparent on-chain orderbook</h2>
                            <p>
                                All steps of the trade as well as asset deposit/withdrawals are on-chain and viewable on the explorer.  
                                Trading disputes can be resolved quickly.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h2>Silicon Valley team</h2>
                            <p>
                                The QUANTA team is a band of engineering rock stars with experience building high-performant, 
                                scalable technologies at companies like IBM, Paypal, eBay, and Netflix.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}