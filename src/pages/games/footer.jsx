import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    padding: 5px 0;
    background: #555;
    font-size: 12px;
    color: #ccc;

    a {
        color: #ccc !important;
    }

    .separator {
        margin: 0 20px;
    }
`

export default class Footer extends Component {
    render() {
        const network = this.props.network || "mainnet"
        return (
            <div className={container + " d-flex flex-wrap justify-content-center"}>
                <a href={"http://explorer.quantadex.com/" + network + "/account/relaxed-committee-account"} target="_blank">Jackpot Account</a>
                <div className="separator">&bull;</div>
                <a href={"http://explorer.quantadex.com/" + network + "/dice"} target="_blank">Statistics</a>
                <div className="separator">&bull;</div>
                <a href="https://quantadex.zendesk.com/hc/en-us/articles/360029883111" target="_blank">Term of Use</a>
                <div className="separator">&bull;</div>
                <a href="https://quantadex.zendesk.com/hc/en-us" target="_blank">Customer Support</a>
            </div>
        )
    }
}