import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'

const container = css`
    display: flex;
    bottom: 0;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
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
        div {
            display: inline-block;
        }
    }
`;

class Status extends Component {
    render() {
        return (
            <div id="quanta-status" className={container + (this.props.mobile ? " mobile" : "")}>
                <div className="brand">QUANTA Fair Trading Protocol</div>
                <div className="blocknum" title="Highest Block">{this.props.blockInfo.blockNumber}</div>
                <div className="avg-lat" title="Average Block Latency">{ this.props.blockInfo.blockTime}ms</div>
                <div className="net-select">MAINNET</div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    blockInfo: state.app.blockInfo || {}
});

export default connect(mapStateToProps)(Status);
