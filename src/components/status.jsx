import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { UPDATE_NETWORK } from '../redux/actions/app.jsx'

const container = css`
    display: flex;
    bottom: 0;
    width: 100%;
    white-space: nowrap;
    line-height: 25px;
    z-index: 2;

    .blocknum, .avg-lat, .net-select {
        border-left: 1px solid #444;
        padding-right: 10px;
    }

    .brand {
        width: 100%;
        padding-left: 10px;
    }
    .blocknum {
        background: url('/public/images/blockchain.svg') no-repeat 10px;
        padding-left: 40px;
    }
    .avg-lat {
        background: url('/public/images/time.svg') no-repeat 10px;
        padding-left: 32px;
    }

    .net-select {
        background: url('/public/images/menu-arrow-down.svg') no-repeat 100% 9px;
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
        this.props.dispatch({
			type: UPDATE_NETWORK,
			data: net
		});
    }
    
    render() {
        const netsList = [{name: "MAINNET"}, {name: "TESTNET"}]

        return (
            <div id="quanta-status" className={container + (this.props.mobile ? " mobile" : "")}>
                <div className="brand">QUANTA Fair Trading Protocol</div>
                <div className="blocknum" title="Highest Block">{this.props.blockInfo.blockNumber}</div>
                <div className="avg-lat" title="Average Block Latency">{ this.props.blockInfo.blockTime}ms</div>
                <div className="net-select position-relative">
                    {this.props.network}
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
