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
        max-width: 30%;
    }

    .avail-fund {
        position: relative;
        width: min-content;
        min-width: 160px;
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
        top: 100%;
        min-width: 160px;
        background: #b09520;
        border-radius: 3px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
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
            this.setState({selected_asset: default_asset})
            this.props.setAsset(default_asset)
        }
    }

    render() {
        const { name, balance, network, dispatch, connectDialog, setAsset, demo_fund, buyQdexDialog, private_key } = this.props
        const { selected_asset, show_assets } = this.state
        return (
            <div className={container + " px-4 px-md-5"}>
                <div className="d-flex qt-font-normal align-items-center justify-content-between h-100">
                    <img className="logo" src="/public/images/dice/logo.svg" alt="QUANTA DICE" />
					<ProductsMenu network={network} className="ml-0 ml-sm-5" />

                    <div className="w-100 position-relative">
                        <div  ref="Assets" className="avail-fund text-right cursor-pointer ml-auto">
                            { private_key && selected_asset ? 
                                balance[selected_asset].balance + " " + balance[selected_asset].symbol.split('0X')[0] + " " + String.fromCharCode(9662)  
                                : (demo_fund/Math.pow(10, 5)).toFixed(5) + " BTC"}
                        </div>
                        { show_assets ?
                            <div className="assets-list text-right">
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
                            : null
                        } 
                    </div>
                    <div className="d-flex align-items-center ml-5">
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