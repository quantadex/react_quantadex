import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion';
import Connect, { ConnectDialog } from '../../components/connect.jsx';

const container = css `
    height: 80px;
    background: rgb(168,157,59);
    background: linear-gradient(165deg, rgb(168,157,59) 10%,rgb(230,213,69) 59%,rgb(168,157,59));
    box-shadow: 0 1px 3px;
    border-bottom: 1px solid #d6c740;

    .avail-fund {
        position: relative;
        min-width: 160px;
        white-space: nowrap;
        background: #b09520;
        border-radius: 3px;
        padding: 5px 15px;
        box-shadow: 1px 1px 1px #fde829;
        cursor: default;
    }

    .user-data {
        color: #fff;
    }

    .assets-list {
        display: none
        position: absolute;
        right: 0;
        top: 100%;
        background: #b09520;
        border-radius: 3px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        z-index: 1;

        .asset:hover {
            background: rgb(230,213,69);
            background: linear-gradient(165deg,rgb(193, 175, 16) 10%, rgb(230,213,69) 59%,rgb(193, 175, 16) 90%);
        }
    }

    .avail-fund:hover .assets-list {
        display: block;
    }
`

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_asset: null
        }
    }

    componentWillReceiveProps(nextProps) {
        const { balance } = nextProps
        if (!this.state.selected_asset && Object.keys(balance).length > 0) {
            const default_asset = localStorage.getItem("dice_asset") || Object.keys(balance)[0]
            this.setState({selected_asset: default_asset})
            this.props.setAsset(default_asset)
        }
    }

    render() {
        const { name, balance, network, dispatch, connectDialog, setAsset, demo_fund } = this.props
        const { selected_asset } = this.state
        return (
            <div className={container + " d-flex justify-content-between align-items-center px-5"}>
                <img src="/public/images/dice/logo.svg" alt="QUANTA DICE" />
                <div className="user-data d-flex qt-font-normal align-items-center">
                    <div className="avail-fund text-right">
                        {selected_asset ? balance[selected_asset].balance + " " + balance[selected_asset].symbol.split('0X')[0] : (demo_fund/Math.pow(10, 8)).toFixed(8) + " BTC"}
                        <div className="assets-list">
                            {Object.keys(balance).map(coin => {
                                return (
                                    <div key={coin} className="asset my-2 px-3 py-2 cursor-pointer"
                                        onClick={() => {
                                            this.setState({selected_asset: coin})
                                            setAsset(coin)
                                        }}
                                    >
                                        {balance[coin].balance + " " + coin.split('0X')[0]}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="pl-5">{name ? <div>{name} <Connect type="lock" /></div> : <Connect type="link" />}</div>
                </div>

                { connectDialog ?
                    <ConnectDialog default={connectDialog}
                        network={network} 
                        dispatch={dispatch}/> 
                    : null
                }
                
            </div>
        )
    }

}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
    publicKey: state.app.publicKey,
    name: state.app.name,
    balance: state.app.balance || {},
    network: state.app.network,
    connectDialog: state.app.ui.connectDialog
});

export default connect(mapStateToProps)(Header);