import React, { Component } from 'react';
import { css } from 'emotion'

const container = css`
    display: flex;
    width: 100%;
    background-color: #ffffff;
    overflow: hidden;

    .status-info {
        width: 100%;
        padding: 5px 0px 5px 30px;
        color: #000;
        font-size: 15px;
        font-weight: bold;
        white-space: nowrap;

        a {
            margin-left: 5px;
        }
    }

    .status-info.brand {
        background: #eeeeef linear-gradient(to right, #ffffff, #eeeeef);
        flex: 0 0 260px;
    }
    .label {
        font-size: 12px;
        color: #999;
        font-weight: 100;
    }
`;

class Status extends Component {
    render() {
        return (
            <div id="quanta-status" className={container}>
                <div className="status-info brand">
                    <span className="label">Powered by </span>
                    <div>QUANTA - Fair Trading Protocol</div>
                </div>
                <div className="status-info">
                    <span className="label">QUANTA </span>
                    <div>Explorer <a><img src="/public/images/external-link.svg" /></a></div>
                </div>
                <div className="status-info">
                    <span className="label">HIGHEST BLOCK</span>
                    <div>995020 <a><img src="/public/images/external-link.svg" /></a></div>
                </div>
                <div className="status-info">
                    <span className="label">AVERAGE BLOCK LATENCY</span>
                    <div>2000ms</div>
                </div>
                <div className="status-info">
                    <span className="label">NUMBER OF NODES </span>
                    <div>13</div>
                </div>
                <div className="status-info">
                    <span className="label">ON-CHAIN ORDERBOOK LATENCY </span>
                    <div>12 ms</div>
                </div>
                <div className="status-info">
                    <span className="label">ON-CHAIN CUSTODY </span>
                    <div>2 tokens <a><img src="/public/images/external-link.svg" /></a></div>
                </div>
            </div>
        )
    }
}

export default Status