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
    }

    .status-info.brand {
        background: #eeeeef linear-gradient(to right, #ffffff, #eeeeef);
        flex: 0 0 260px;
        .label {
            text-transform: none;
        }
    }
    .label {
        font-size: 12px;
        color: #999;
        font-weight: 100;
        text-transform: uppercase;
        white-space: nowrap;
    }
`;

class Status extends Component {
    render() {
        return (
            <div className={container}>
                <div className="status-info brand">
                    <span className="label">Powered by </span>
                    <div>QUANTA - Fair Trading Protocol</div>
                </div>
                <div className="status-info">
                    <span className="label">QUANTA </span>
                    <div>Explorer</div>
                </div>
                <div className="status-info">
                    <span className="label">Highest Block</span>
                    <div>995020</div>
                </div>
                <div className="status-info">
                    <span className="label">Average Block Latency</span>
                    <div>2000ms</div>
                </div>
                <div className="status-info">
                    <span className="label">Number of Nodes </span>
                    <div>13</div>
                </div>
                <div className="status-info">
                    <span className="label">On-chain Orderbook Latency </span>
                    <div>12 ms</div>
                </div>
                <div className="status-info">
                    <span className="label">On-chain Custody </span>
                    <div>2 tokens</div>
                </div>
            </div>
        )
    }
}

export default Status