import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN } from '../redux/actions/app.jsx'
import { withRouter} from "react-router-dom";

const container = css`
    display: flex;
    width: 100%;
    white-space: nowrap;
    line-height: 25px;
    z-index: 2;

    .blocknum, .avg-lat, .net-select, .support {
        border-left: 1px solid #444;
        padding-right: 10px;
    }

    .brand {
        width: 100%;
        padding-left: 10px;
    }
    .blocknum {
        background: url(${devicePath("public/images/blockchain.svg")}) no-repeat 10px;
        padding-left: 40px;
    }
    .support {
        padding-left: 10px;
        a {
            color: #1cdad8 !important;
        }
    }
    .avg-lat {
        background: url(${devicePath("public/images/time.svg")}) no-repeat 10px;
        padding-left: 32px;
    }

    .net-select {
        background: url(${devicePath("public/images/menu-arrow-down.svg")}) no-repeat 100% 9px;
        padding: 0 15px 0 10px;
        margin-right: 10px;
        cursor: pointer;
    }
    .net-options {
        display: none;
        position: absolute;
        bottom: 25px;
        right: -5px;
        border: 3px solid #000;
        background: #23282c;
        
        div {
            padding: 5px 20px;
            border-bottom: 1px solid #333;
        }
        div:last-child {
            border: none;
        }
        div:hover {
            background-color: rgba(255,255,255,0.1);
        }
    }
    .net-select:hover .net-options{
        display: block;
    }
    

    &.mobile {
        position: relative;
        font-size: 13px;
        justify-content: space-between;
        .brand {
            display: none;
        }

        .support {
            width: 100%;
            text-align: center;
        }

        .explorer, .avg-lat {
            display: inline-block;
        }
        .blocknum, .avg-lat, .net-select {
            display: inline-block;
        }
    }
`;

class Status extends Component {
    switchExNet(net) {
        let current = window.location.pathname.startsWith("/testnet") ? "testnet" : "mainnet"
        if (net == current) return
        const defaultTicker = net == "mainnet" ? 'ETH_BTC' : 'ETH_USD'

        window.location = "/" + net + "/exchange/" + defaultTicker
    }
    
    render() {
        const { mobile, blockInfo } = this.props
        const netsList = [{name: "mainnet"}, {name: "testnet"}]

        return (
            <div id="quanta-status" className={container + (mobile ? " mobile" : "")}>
                <div className="brand">AwakeX Platform</div>
                <div className="support"><a href="https://quantadex.zendesk.com/hc/en-us" target="_blank">{mobile ? "Help" : "Customer Support"}</a></div>
                <div className="blocknum" title="Highest Block">{blockInfo.blockNumber}</div>
                <div className="avg-lat" title="Average Block Latency">{blockInfo.blockTime}ms</div>
                <div className="net-select position-relative text-uppercase">
                    {window.location.pathname.startsWith("/testnet") ? "testnet" : "mainnet"}
                    <div className="net-options">
                        {netsList.map(item => {
                            return <div key={item.name} onClick={() => this.switchExNet(item.name)}>{item.name}</div>
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    network: state.app.network,
    blockInfo: state.app.blockInfo || {}
});

export default connect(mapStateToProps)(Status);
