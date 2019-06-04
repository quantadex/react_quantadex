import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import { buyTransaction, getQdexAsks, TOGGLE_BUY_QDEX_DIALOG } from '../redux/actions/app.jsx'
import Loader from './ui/loader.jsx';

const container = css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,0.6);
    font-size: 13px;
    z-index: 999;

    .container {
        position: relative;
        width: 100%;
        max-width: 750px;
        background-color: #4f637e;
        border-radius: 5px;
        padding: 20px;
        align-self: center;

        .close-btn {
            position: absolute;
            right: 20px;
            cursor: pointer;

            img {
                height: 20px;
            }
        }

        .inputs-container {
            position: relative;
            background-color: #fff;
            padding: 20px;
            margin: 20px 0;
            color: #999;

            label {
                text-transform: uppercase;
            }

            input {
                color: #333;
                border: 1px solid #999;
                text-align: left;
                padding: 20px;
                width: 100%;
                border-radius: 4px;
            }

            .error {
                color: #f0185c;
                font-size: 11px;
            }

            button {
                width: 180px;
                height: 42px;
                background-color: #66d7d7;
                padding: 10px 20px;
                color: #fff;
                border-radius: 4px;
                white-space: nowrap;
                cursor: pointer;
            }
            button:disabled {
                background-color: #999;
            }

            select {
                outline: none;
                border-radius: 3px;
                border: 1px solid #1cdad8;
                color: #1cdad8;

                option {
                    color: #999;
                }
            }

            a {
                color: #1cdad8;
                text-decoration: underline;
            }
        }
    }
`

class BuyQdex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trade_asset: "ETH",
            asks_data: [],
            pay_amount: "",
            receive_amount: "",
            processing: false
        }
    }

    componentDidMount() {
        this.setAsset(this.state.trade_asset)
    }

    setAsset(trade_asset) {
        this.props.dispatch(getQdexAsks(window.assetsBySymbol[trade_asset]))
        .then((asks_data) => {
            this.setState({asks_data, trade_asset, pay_amount: "", receive_amount: ""})
        })
    }

    closeDialog() {
        this.props.dispatch({
            type: TOGGLE_BUY_QDEX_DIALOG,
            data: false
        })
    }

    calculateReceive() {
        const { asks_data, pay_amount } = this.state
        let remain = pay_amount
        let receive_amount = 0
        let final_price

		for (let ask of asks_data) {
            const base = parseFloat(ask.base)
            if (base <= remain) {
                receive_amount += parseFloat(ask.quote)
            } else {
                const price = parseFloat(ask.price)
                const amount = remain/price
                receive_amount += amount
            }
            remain -= base

            if (remain <= 0) {
                final_price = ask.price
                break
            }
        }
        
        this.setState({price: final_price, receive_amount: receive_amount.toFixed(window.assetsBySymbol["QDEX"].precision)})
    }

    calculatePay() {
        const { asks_data, receive_amount, trade_asset } = this.state
        let remain = receive_amount
        let pay_amount = 0
        let final_price

		for (let ask of asks_data) {
            const quote = parseFloat(ask.quote)
            if (quote <= remain) {
                pay_amount += parseFloat(ask.base)
            } else {
                const price = parseFloat(ask.price)
                const amount = remain*price
                pay_amount += amount
            }
            remain -= quote

            if (remain <= 0) {
                final_price = ask.price
                break
            }
        }
        
        this.setState({price: final_price, pay_amount: pay_amount.toFixed(window.assetsBySymbol[trade_asset].precision)})
    }
    
    render() {
        const { balance, fee, network, isMobile, dispatch } = this.props
        const { trade_asset, price, pay_amount, receive_amount, processing } = this.state
        return (
            <div className={container + " d-flex align-content-center"}>
                <div className="container">
                    {!isMobile ? 
                        <div className="close-btn" onClick={this.closeDialog.bind(this)}><img src={devicePath("public/images/close_btn.svg")} /></div> 
                        : null
                    }
                    <h4>LOW QDEX BALANCE</h4>
                    
                    <div className="inputs-container">
                        <div>
                            <b>Current: </b><span>{balance['QDEX'] ? balance['QDEX'].balance : 0} QDEX</span><br/>
                            <b>Platform fees: </b><span>{fee.amount} QDEX (per trade)</span>
                        </div>

                        <div className="inputs d-flex my-5">
                            <div className="d-flex">
                                <label className="mr-3 text-nowrap">Pay With<br/>
                                    <select onChange={(e) => {
                                        this.setAsset(e.target.value)
                                    }}>
                                        <option value="ETH" defaultValue>ETH</option>
                                        <option value="BTC">BTC</option>
                                    </select>
                                </label>
                                <input 
                                    type="number"
                                    placeholder="Enter Amount"
                                    min="0"
                                    value={pay_amount}
                                    onChange={(e) => {
                                        this.setState({pay_amount: e.target.value}, this.calculateReceive)
                                    }}
                                />
                            </div>
                            <div className="d-flex mx-4">
                                <label className="mr-3">Receive Qdex</label>
                                <input  
                                    type="number"
                                    placeholder="Enter Amount"
                                    min="0"
                                    value={receive_amount}
                                    onChange={(e) => {
                                        this.setState({receive_amount: e.target.value}, this.calculatePay)
                                    }}
                                />
                            </div>
                            <button 
                                disabled={pay_amount <= 0 || receive_amount <= 0 || processing}
                                onClick={() => {
                                    this.setState({processing: true})
                                    dispatch(buyTransaction("QDEX/" + trade_asset, price, receive_amount, true))
                                        .then((e) => e == "error" && this.setState({processing: false}))
                                }}
                            >
                                { processing ? <Loader /> : "BUY"}
                            </button>
                        </div>
                        <div>
                            <b>Available: </b>
                            <span>{balance[trade_asset] ? balance[trade_asset].balance : 0} {trade_asset} </span>
                            <Link to={"/" + network + "/wallets"} className="ml-3">Deposit</Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    asks: state.app.orderBook.asks.dataSource,
    balance: state.app.balance || {},
    fee: state.app.fee,
    network: state.app.network,
    isMobile: state.app.isMobile
});

export default connect(mapStateToProps)(BuyQdex);