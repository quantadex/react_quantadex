import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion';
import Connect, { ConnectDialog } from '../../components/connect.jsx';
import BuyQdex from '../../components/buy_qdex.jsx'
import Menu from './menu.jsx'
import ProductsMenu from '../../components/ui/products_menu.jsx'

const container = css `
    min-height: 80px;
    background: rgb(168,157,59);
    background: linear-gradient(165deg, rgb(168,157,59) 10%,rgb(230,213,69) 59%,rgb(168,157,59));
    box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    border-bottom: 1px solid #d6c740;
    color: #fff;
    z-index: 999;

    .logo {
        max-width: 185px;
        height: 100%;
    }

    .avail-fund {
        position: relative;
        width: min-content;
        min-width: 140px;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: #b09520;
        border-radius: 3px;
        padding: 5px 15px;
        box-shadow: 1px 1px 1px #fde829;
    }

    .assets-list {
        position: absolute;
        right: 0;
        top: 33px;
        min-width: 140px;
        max-height: 200px;
        background: #b09520;
        border-radius: 3px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        overflow: hidden;
        overflow-y: scroll;
        z-index: 1;

        .asset:hover {
            background: rgb(230,213,69);
            background: linear-gradient(165deg,rgb(193, 175, 16) 10%, rgb(230,213,69) 59%,rgb(193, 175, 16) 90%);
        }
    }

    .link {
        color: #fff;
        background: none;
        margin-right: 0;
    }

    .transfer-container {
        width: max-content;
        margin-top: 5px;
        
        .transfer-btn {
            background: #51b58b;
            border: 1px solid #3f9571;
            color: #fff;
            padding: 0 7px;
            font-size: 12px;
            box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.5);
            cursor: pointer;
        }
    }
`

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_asset: null,
            show_assets: false,
        }

        this.toggleAssets = this.toggleAssets.bind(this)
    }

    toggleAssets(e) {
        const { selected_asset, show_assets } = this.state
        if (!selected_asset) return
        const Assets = this.refs.Assets;
        var isClickInside = Assets.contains(e.target);
        if (isClickInside) {
            this.setState({show_assets:!show_assets})
        } else {
            this.setState({show_assets:false})
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.toggleAssets)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.toggleAssets)
    }

    componentWillReceiveProps(nextProps) {
        const { balance, private_key } = nextProps
        if (private_key && !this.state.selected_asset && Object.keys(balance).length > 0) {
            const default_asset = localStorage.getItem("dice_asset") || Object.keys(balance)[0]
            for (let listing of window.wallet_listing) {
                if (balance[listing] === undefined) balance[listing] = {balance: 0, symbol: listing}
            }
            this.setState({selected_asset: default_asset, listing_balance: balance})
            this.props.setAsset(default_asset)
        }

        if (this.state.listing_balance && nextProps.balance != this.state.listing_balance) {
            const { listing_balance } = this.state
            Object.assign(listing_balance, nextProps.balance)
            this.setState({listing_balance})
        }
    }

    render() {
        const { name, network, dispatch, connectDialog, setAsset, demo_fund, buyQdexDialog, private_key,
            open_deposit, open_withdraw } = this.props
        const { selected_asset, show_assets, listing_balance } = this.state
        const native_coins = ["QDEX", "QAIR"]
        return (
            <div className={container + " px-4 px-md-5"}>
                <div className="d-flex qt-font-normal align-items-center justify-content-between h-100">
                    <img className="logo" src="/react_quantadex/public/images/dice/logo.svg" alt="QUANTA DICE" />
					<ProductsMenu network={network} className="ml-2 ml-sm-5" />

                    <div className="w-100 position-relative">
                        <div  ref="Assets" className="avail-fund text-right cursor-pointer ml-auto">
                            { private_key && selected_asset ? 
                                listing_balance[selected_asset].balance + " " + listing_balance[selected_asset].symbol.split('0X')[0] + " " + String.fromCharCode(9662)  
                                : (demo_fund/Math.pow(10, 5)).toFixed(5) + " BTC"}
                        </div>
                        { private_key ?
                            <div className="transfer-container d-flex ml-auto">
                                { native_coins.includes(selected_asset) ?
                                    null :
                                    <button className="transfer-btn mr-2" onClick={open_deposit}>Deposit</button>
                                }
                                <button className="transfer-btn" onClick={open_withdraw}>{native_coins.includes(selected_asset) ? "Transfer" : "Withdraw"}</button>
                            </div>
                            : null
                        }
                        { show_assets ?
                            <div className="assets-list text-right">
                                {Object.keys(listing_balance).map(coin => {
                                    return (
                                        <div key={coin} className="asset my-2 px-3 py-2 cursor-pointer"
                                            onClick={() => {
                                                this.setState({selected_asset: coin})
                                                setAsset(coin)
                                            }}
                                        >
                                            {listing_balance[coin].balance + " " + coin.split('0X')[0]}
                                        </div>
                                    )
                                })}
                            </div>
                            : null
                        } 
                    </div>
                    <div className="d-flex align-items-center ml-3 ml-sm-5">
                        {private_key ? 
                            <div className="d-none d-md-block mr-4">{name}</div> // <Connect type="lock" /></div> 
                            : <div className="d-none d-md-block"><Connect type="link" /></div> 
                        }
                        <div className={private_key ? "d-block" : "d-block d-md-none"}>
                            <Menu network={network} dispatch={dispatch} connected={private_key && true || false} />
                        </div>
                    </div>
                </div>

                { !private_key && connectDialog ?
                    <ConnectDialog default={connectDialog}
                        network={network} 
                        dispatch={dispatch}/> 
                    : null
                }

                { buyQdexDialog ?
                    <BuyQdex />
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
    connectDialog: state.app.ui.connectDialog,
    buyQdexDialog: state.app.ui.buyQdexDialog
});

export default connect(mapStateToProps)(Header);