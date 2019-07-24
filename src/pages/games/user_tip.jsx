import React, { Component } from 'react'
import { css } from 'emotion'
import { transferFund } from '../../redux/actions/app.jsx'
import Loader from '../../components/ui/loader.jsx'
import Utils from '../../common/utils.js'

const container = css `
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.3);
    z-index: 999;

    .info-container {
        width: max-content;
        max-width: 100%;
        background: #fff;
        border-radius: 3px;
    }

    .name {
        color: #57a38b;
    }

    .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
    }

    input {
        width: 120px;
        border: 1px solid #999;
        border-radius: 5px;
        color: #333;
        text-align: center;
        padding: 0 10px;
    }
    select {
        height: 32px;
        color: #555;
        border: 1px solid #999;
        border-radius: 5px;
        outline: none;
    }

    button {
        height: 32px;
        border-radius: 5px;
        background: #57a38b;
        color: #fff;
        padding: 0 20px;
        cursor: pointer;
    }

    button:disabled {
        background: #888;
    }
`

export default class UserTip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            asset: null,
            amount: "",
            processing: false
        }

    }

    sendTip() {
        const { from, name, dispatch, announce_tip, toast, close } = this.props
        const { amount, asset } = this.state

        this.setState({processing: true})
        dispatch(transferFund(name, amount, asset, ""))
        .then(() => {
            announce_tip(`${from} sent ${name} a ${amount} ${asset.split("0X")[0]} tip!`)
            toast.success(`Sent ${amount} ${asset.split("0X")[0]} to ${name}`, {
                position: toast.POSITION.BOTTOM_CENTER
            })
            close()
        })
        .catch((e) => {
            console.log(e)
            toast.error(`Unable to send.`, {
                position: toast.POSITION.BOTTOM_CENTER
            })
        })
        .finally(() => {
            this.setState({processing: false})
        })
    }

    render() {
        const { name, close, balance } = this.props
        const { amount, asset, processing } = this.state
        return (
            <div className={container + " d-flex justify-content-center"}>
                <div className="info-container qt-font-small align-self-center px-5 py-4 position-relative">
                    <h3 className="qt-font-bold">SEND TIP</h3>
                    <div className="close-btn cursor-pointer" onClick={close}>
                        <img src="/public/images/x_close.svg" height="12" alt="Close" />
                    </div>
                    <div className="d-flex align-items-center text-center">
                        Send <span className="qt-font-bold name ml-2">{name}</span> 
                        <input className="ml-2 mr-1"
                            value={Utils.maxPrecision(amount, (window.assetsBySymbol[asset] && window.assetsBySymbol[asset].precision) || 5)}
                            type="number"
                            placeholder="Amount"
                            onChange={(e) => this.setState({amount: e.target.value})}
                        />
                        <select ref="Asset" className="mr-3 text-center" defaultValue="first" 
                            onChange={(e) => this.setState({asset: e.target.value})}
                        >
                            <option value="first" hidden disabled>Select Asset</option>
                            { Object.keys(balance).map(asset => {
                                return <option key={asset} value={asset}>{asset.split('0X')[0]}</option>
                            })}
                            
                        </select>
                    </div>
                    <div className="text-secondary qt-font-extra-small mt-2">
                        { asset ?
                            <React.Fragment>
                                <span>
                                    Available {asset.split("0X")[0]}: {balance[asset].balance.toLocaleString()}
                                </span> <br/>
                            </React.Fragment>
                            : null
                        }
                        Transaction Fee: 0.02 QDEX
                    </div>
                    <button className="w-100 mt-4" onClick={this.sendTip.bind(this)}
                        disabled={!asset || amount <= 0 || processing}
                    >
                        { processing ? <Loader /> : "SEND"}
                    </button>
                    
                </div>
            </div>
        )
    }
}