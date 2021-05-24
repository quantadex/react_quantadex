import React, { Component } from 'react';
import { css } from 'emotion';

const container = css`
    color: #4a4a4a;
    h1, h4 {
        font-weight: bold;
    }

    p {
        font-size: 14px;
    }

    hr {
        margin: 0;
    }

    .article {
        width: 270px;
        overflow: hidden;

        .source {
            margin-right: 2px;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }

        .source.cryptodaily {
            background: #333365;    
            padding-bottom: 14px;
        }

        .source.techbullion {
            background: #003058;
        }

        .content {
            padding: 20px;
            padding-bottom: 0;
            margin-right: 2px;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;

            h4 {
                margin: 0;
            }

            p {
                margin: 0;
            }

            a {
                font-weight: bold;
                color: #5045d2;
            }
        }

        .paper {
            background: url('/react_quantadex/public/images/media/paper-tear.png') no-repeat 0 100%;
            height: 18px;
            width: 100%;
            text-align: right;

            img {
                height: 18px;
                width: 3px;
                vertical-align: top;    
            }
        }
    }

`

export default class Media extends Component {
    render() {
        return (
            <div className={container + " container pb-5"}>
                <h1 className="text-center text-uppercase mb-5">In The Media</h1>

                <div className="d-flex justify-content-around flex-column flex-md-row">
                    <div className="article mx-auto mb-5">
                        <div className="source cryptodaily text-center">
                            <img src="/react_quantadex/public/images/media/cryptodaily.png" />
                        </div>
                        <div className="content">
                            <h4>The Mainstream Crypto Economy is Rising</h4>
                            <div className="text-right small">Jun 17, 2018</div>
                            <hr/>
                            <p>
                                “Soon, an ambitious group of talented developers [QUANTA] with a vision will create a fast DEX, 
                                a DEX fast enough to power not only the next era of the Internet but a new era of global prosperity.”
                            </p>
                            <a className="d-block text-right" href="https://cryptodaily.co.uk/2018/10/the-mainstream-crypto-economy-is-rising/" target="_blank">Read More</a>
                        </div>
                        <div className="paper"><img src="/react_quantadex/public/images/media/tear_side.png" /></div>
                    </div>
                    <div className="article mx-auto mb-5">
                        <div className="source techbullion text-center">
                            <img src="/react_quantadex/public/images/media/techbullion.png" />
                        </div>
                        <div className="content">
                            <h4>Quanta Chain: A Public Blockchain Infrastructure to Provide Instant Liquidity for Millions of Tokens</h4>
                            <div className="text-right small">Sep 20, 2018</div>
                            <hr/>
                            <p>
                                “Quanta Chain effectively creates an ecosystem that is truly holistic in terms of 
                                interoperability and thus allows for any and all kinds of tokens to be traded from a single platform.”
                            </p>
                            <a className="d-block text-right" href="https://www.techbullion.com/quanta-chain-a-public-blockchain-infrastructure-to-provide-instant-liquidity-for-millions-of-tokens/" target="_blank">Read More</a>
                        </div>
                        <div className="paper"><img src="/react_quantadex/public/images/media/tear_side.png" /></div>
                    </div>
                    <div className="article mx-auto mb-5">
                        <div className="source cryptodaily text-center">
                            <img src="/react_quantadex/public/images/media/cryptodaily.png" />
                        </div>
                        <div className="content">
                            <h4>5 decentralized exchanges to watch in 2018</h4>
                            <div className="text-right small">Oct 29, 2018</div>
                            <hr/>
                            <p>
                                “Here are a handful of decentralized projects to keep your eye on in 2018 ... QUANTADEX 
                                is on a mission to run the first crypto exchange on a decentralized blockchain where the 
                                community can extend its network, blockchain development …”
                            </p>
                            <a className="d-block text-right" href="https://cryptodaily.co.uk/2018/06/5-decentralized-exchanges-to-watch-in-2018/" target="_blank">Read More</a>
                        </div>
                        <div className="paper"><img src="/react_quantadex/public/images/media/tear_side.png" /></div>
                    </div>
                </div>

            </div>
        )
    }
}