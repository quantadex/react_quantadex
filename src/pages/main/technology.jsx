import React, { Component } from 'react';
import { css } from 'emotion'
import NavHeader from './nav_header.jsx'
import Footer from './footer.jsx'

const container = css`
    .banner {
        color: #fff;
        background: #1f1e35 url('/public/images/technology/tech-background.png') no-repeat;
        background-size: cover;
        background-position: center;

        .container {
            padding: 50px 15px;
            h1 {
                font-size: 2.5em;
            }
        }
        
        .blue-btn {
            font-size: 1.5em;
        }
    }

    .info {
        h1, h3 {
            font-family: SFCompactTextBold;
        }

        h1 {
            font-size: 2em;
        }

        a {
            color: #66d7d7;
            text-decoration: underline;
        }

        section {
            margin-bottom: 50px;
            font-size: 18px;
        }

        .img-container {
            display: flex;
            height: 90px;
        }

        img {
            width: fit-content;
            margin: auto;
        }
    }

    .advantage {
        h3 {
            margin-bottom: 20px;
        }

        div {
            flex: 1;
            padding: 0 20px;
        }
    }

    .read-more a {
        color: #333;
    }
`

export default class Technology extends Component {
    render() {
        return (
            <div className={container} style={{fontSize: "initial", color: "#333"}}>
                <NavHeader page="tech" />

                <div className="banner">
                    <div className="container">
                        <h1 className="qt-font-semibold mb-4">Technology</h1>
                        <h3>
                            QUANTA offers the only trading protocol with on-chain token custody, 
                            fully decentralized security, and auditable, anti-front-running ledger.
                        </h3>
                        
                        <a className="blue-btn mt-5" href="https://t.me/quantadex" target="_blank">
                            Join us on Telegram
                        </a>
                    </div>
                </div>

                <div className="info container py-5">
                    <section className="text-center">
                        <h1>The Advantage</h1>
                        <div className="advantage d-flex justify-content-between flex-column flex-md-row ">
                            <div>
                                <div className="img-container">
                                    <img src="/public/images/technology/performance.svg" />
                                </div>
                                <h3>Uncompromising <br/> Performance</h3>
                                <p>Get the speed of a CEX and the security of a DEX.</p>
                            </div>

                            <div>
                                <div className="img-container">
                                    <img src="/public/images/technology/secure.svg" />
                                </div>
                                
                                <h3>On-Chain <br/> Custody</h3>
                                <p>
                                    Retain 100% custody of tokens end-to-end from order-matching to settlement, 
                                    with no exposure to hacking.
                                </p>
                            </div>

                            <div>
                                <div className="img-container">
                                    <img src="/public/images/technology/audit.svg" />
                                </div>
                                <h3>Auditable <br/> Order-Book</h3>
                                <p>
                                    Order-book matching is transparent and 
                                    traders are protected from front-running.  
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="d-flex flex-column flex-sm-row justify-content-between">
                            <img className="mr-md-5" src="/public/images/technology/block_chain.png" />
                            
                            <div>
                                <h1>The Blockchain</h1>
                                <p>
                                    QUANTA runs on an open-source, forked Graphene-based blockchain with our protocol improvements. 
                                    The order-book is in-memory, an onchain, which benefit from sub-second match and settlement, 
                                    and resilient to anti-fronting from block producers. 
                                    The native token is QDEX, used to pay for fees, listings, 
                                    and various operations on the blockchain.
                                </p>
                            </div>
                            
                        </div>
                    </section>

                    <section>
                        <div className="d-flex flex-column-reverse flex-sm-row justify-content-between">
                            <div>
                                <h1>The Crosschain</h1>
                                <p>
                                    Trade across multiple blockchains (BTC, BCH, ETH, ERC-20, LTC) using our 
                                    innovative cross-chain technology.  Most exchanges use a single-issuer system, 
                                    which exposes to asset-risks.  Our technology uses a multi-party issuer system 
                                    requiring all issuances be verified on counter-blockchains. 
                                    Data is transparent and available via our blockchain&nbsp;
                                    <a href="http://explorer.quantadex.com" target="_blank">Explorer</a>.
                                </p>
                            </div>
                            
                            <img className="ml-md-5" src="/public/images/technology/cross_chain.png" />
                        </div>
                    </section>

                    <section className="text-center mb-5">
                        <h1>Built in Silicon Valley</h1>
                        
                        <p>
                            Our team has decades of experience working IBM, eBay, PayPal, Neflix, and Google 
                            focusing on highly scalable, distributed systems.
                        </p>

                        <div className="read-more mt-5">
                            Read our <a href="https://medium.com/@quantadex/exchange-3-0-fast-secure-and-decentralized-1ec109bf3397" target="_blank">Story</a><br/>
                            Read our <a href="http://legacy.quantadex.com/whitepaper" target="_blank">Whitepaper</a><br/>
                            Read our <a href="https://www.dropbox.com/s/2ivdr7riuxou4ku/quanta_yellowpaper_v1.2.pdf?dl=0" target="_blank">Technical paper</a>
                        </div>
                    </section>
                </div>
                
                
                <Footer />
            </div>
        )
    }
}