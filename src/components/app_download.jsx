import React, { Component } from 'react';
import { css } from 'emotion'

const container = css`
    height: 70px;
    background: #fff;
    color: #66d7d7;
    line-height: 15px;

    img {
        max-height: 80%;
    }

    a {
        background: #66d7d7;
        padding: 6px 10px;
        border-radius: 3px;
    }
`

export default class AppDownload extends Component {
    render() {
        return (
            <div className={container + " d-flex align-items-center px-2 qt-font-small"}>
                <img src="/public/images/app_icon.png" />
                <div className="w-100 px-3 qt-font-bold">
                    <span>QUANTADEX</span><br/>
                    <span className="qt-font-light small">Trade BTC, ETH, ERC-20 from your wallet</span>
                </div>
                <a href="https://play.google.com/store/apps/details?id=com.quantadex.stageapp" target="_blank" >Download</a>
            </div>
        )
    }
}