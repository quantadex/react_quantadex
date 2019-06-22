import React, { Component } from 'react'
import { css } from 'emotion'

const container = css`
    background: #121517;
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
        a.active {
            text-decoration: underline;
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
`

export default class NavHeader extends Component {
    render() {
        const { page } = this.props
        return (
            <div className={container}>
                <div className="container nav-bar d-flex justify-content-end align-items-center">
                    <div className="w-100 text-left">
                        <img src="/public/images/logo.svg" />
                    </div>
                    <a className={"d-none d-sm-block" + (page == "main" ? " active" : "")} href="/">Main</a>
                    <a className={"d-none d-sm-block" + (page == "tech" ? " active" : "")} href="/technology">Technology</a>
                    <a className="d-none d-sm-block" href="http://medium.com/@quantadex" target="_blank">Blog</a>
                    <a className="d-none d-sm-block launch-btn" href={"/mainnet/exchange/ETH_BTC" + location.search}>Launch</a>
                    <div className="hamburger-menu">
                        <img className="d-block d-sm-none" src="/public/images/hamb.svg" />
                        <div className="menu-items py-3 text-left">
                            <a href="/">Main</a>
                            <a href="/technology">Technology</a>
                            <a href="http://medium.com/@quantadex">Blog</a>
                            <a href={"/mainnet/exchange/ETH_BTC" + location.search}>Launch</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}