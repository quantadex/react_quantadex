import React, { Component } from 'react';
import { css } from 'emotion';
import Carousel from 'react-bootstrap/Carousel'

const container = css`
    background: #23282c url('/public/images/head_bg.png') no-repeat 70%;
    color: #fff;
    hr {
        margin: 0;
        border: 1px solid #999;
    }
    a:hover {
        text-decoration: none;
    }
    .nav-bar {
        text-align: center;
        padding: 15px 20px;
        a {
            width: 140px;
            padding: 5px 20px;
            color: #66d7d7;
        }
        a:hover {
            color: #fff;
        }
        
        
        .launch-btn {
            width: 100px;
            border 1px solid #66d7d7;
            border-radius: 3px;
        }
        .launch-btn:hover {
            background-color: #66d7d7;
            color: #fff;
        }
    }

    .hamburger-menu {
        position: relative;
        padding: 10px 0;

        .menu-items {
            position: absolute;
            display: none;
            top: 30px;
            right: 0;
            background: #4cacac;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 999;
        }

        a {
            display: block;
            color: #fff;
        }
    }

    .hamburger-menu:hover .menu-items {
        display: block;
    }

    .box-link {
        width: 282px;
        height: 138px;
        color: #fff;
        font-size: 24px;
        text-align: center;
        padding: 18px 35px;
        text-shadow: 0 2px 10px rgba(0,0,0,0.4);
    }}

    .carousel-indicators {
        bottom: -25px;
    }

    .announce-item, .announce-carousel {
        border: 2px solid rgba(255,255,255,0.5);
    }

    .announce-item {
        overflow: hidden;
        width: 30%;

        img {
            width: 100%;
        }
    }

    .announce-carousel {
        width: max-content;
        overflow: hidden;

        img {
            max-height: 200px;
            max-width: 100%;
        }
    }
`

export default class NavHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            announcements: []
        }
    }
    componentDidMount() {
        fetch("https://s3.amazonaws.com/quantachain.io/announcement_mainnet.json").then(e => e.json())
		.then(data => {
			const entries = data.entries
			if (entries && entries.length > 0) {
				this.setState({announcements: entries.slice(0,3)})
			}
		}).catch(e=>{
			console.log(e)
		})
    }
    
    render() {
        const {announcements} = this.state
        return (
            <div className={container}>
                <div className="container nav-bar d-flex justify-content-end align-items-center">
                    <div className="w-100 text-left">
                        <img src="/public/images/logo.svg" />
                    </div>
                    <a className="d-none d-sm-block" href="/">Main</a>
                    <a className="d-none d-sm-block" href="http://legacy.quantadex.com/fairprotocol">Technology</a>
                    <a className="d-none d-sm-block" href="http://medium.com/@quantadex" target="_blank">Blog</a>
                    <a className="d-none d-sm-block launch-btn" href={"https://quantadex.com/mainnet/exchange/ETH_BTC" + location.search}>Launch</a>
                    <div className="hamburger-menu">
                        <img className="d-block d-sm-none" src="/public/images/hamb.svg" />
                        <div className="menu-items py-3 text-left">
                            <a href="/">Main</a>
                            <a href="/fairprotocol">Technology</a>
                            <a href="/blog">Blog</a>
                            <a href={"https://quantadex.com/mainnet/exchange/ETH_BTC" + location.search}>Launch</a>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="container py-4 px-3">
                    <h1>Experience the Future of DEX</h1>
                    <h3>Private. Low fee. Fast. Secure.</h3>
                    <div className="d-none d-lg-flex justify-content-between my-4">
                        {announcements.map((item, index) => {
                            if (!item.banner) return null
                            return (
                                <div key={index} className="rounded announce-item">
                                    <a href={item.link} target="_blank">
                                        <img src={item.banner} alt={item.title} />
                                    </a>
                                </div>
                            )
                        })}
                        {/* <a href="https://medium.com/@quantadex/exchange-3-0-fast-secure-and-decentralized-1ec109bf3397" target="_blank">
                            <div className="box-link exchange mx-auto mb-4">
                                Exchange 3.0 & The Fair Trading Protocol
                            </div>
                        </a>
                        <a href="#reasons">
                            <div className="box-link top-reasons mx-auto mb-4">
                                TOP 10 Reasons to Switch to QUANTADEX
                            </div>
                        </a>
                        <a href="https://quantadex.zendesk.com/hc/en-us/articles/360025293771-QUANTA-Incentive-Program" target="_blank">
                            <div className="box-link incentive mx-auto mb-4">
                                Incentive<br/>Programs
                            </div>
                        </a> */}
                    </div>

                    <div className="d-lg-none text-center">
                        <Carousel
                            controls={false}
                        >
                            {announcements.map((item, index) => {
                                if (!item.banner) return null
                                return (
                                    <Carousel.Item key={index}>
                                        <div className="mx-auto rounded announce-carousel">
                                            <a href={item.link} target="_blank">
                                                <img src={item.banner} alt={item.title} />
                                            </a>
                                        </div>
                                    </Carousel.Item>
                                )
                            })}
                            {/* <Carousel.Item>
                                <div>
                                    <a href="https://medium.com/@quantadex/exchange-3-0-fast-secure-and-decentralized-1ec109bf3397" target="_blank">
                                        <div className="box-link exchange mx-auto mb-4">
                                            Exchange 3.0 & The Fair Trading Protocol
                                        </div>
                                    </a>
                                </div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div>
                                    <a href="#reasons">
                                        <div className="box-link top-reasons mx-auto mb-4">
                                            TOP 10 Reasons to Switch to QUANTADEX
                                        </div>
                                    </a>
                                </div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div>
                                    <a href="https://quantadex.zendesk.com/hc/en-us/articles/360025293771-QUANTA-Incentive-Program" target="_blank">
                                        <div className="box-link incentive mx-auto mb-4">
                                            Incentive<br/>Programs
                                        </div>
                                    </a>
                                </div>
                            </Carousel.Item> */}
                        </Carousel>
                    </div>
                </div>
            </div>
        )
    }
}