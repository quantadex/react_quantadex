import React, { Component } from 'react'
import { css } from 'emotion'
import { GetBlock, GetChainId, GetAccount } from "../../redux/actions/app.jsx"
import Loader from '../../components/ui/loader.jsx'
import CONFIG from '../../config.js'

const container = css `
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 999;

    .info-container {
        background: #fff;
        color: #666;
        border-radius: 5px;    
        width: 600px;
        max-width: 100%;
    }

    .payout-info {
        background: #eee;
        border-radius: 5px;

        div {
            width: 100%;
        }

        img {
            width: 15px;
            margin-left: 5px;
        }

        .loss {
            color: #e17055;
        }

        .win {
            color: #57bc90;
        }
    }

    .roll-info {
        .bar-0, .bar-1 {
            height: 10px;
            background: #e17055;
        }

        .bar-0 {
            border-top-left-radius: 50px;
            border-bottom-left-radius: 50px;
        }

        .bar-1 {
            flex-grow: 1;
            border-top-right-radius: 50px;
            border-bottom-right-radius: 50px;
        }

        .roll-result, .roll-target {
            position: absolute;
            background: #125750;
            border-radius: 3px;
            color: #fff !important;
            text-shadow: none;
            padding: 3px 10px;
            font-size: 12px;
            white-space: nowrap;
            transform: translateX(-50%);
        }

        .roll-result {
            top: -30px;
        }

        .roll-target {
            bottom: -30px;
        }

        .roll-result::after, .roll-target::after {
            content: "";
            border: solid 6px transparent;
            position: absolute;
            transform: translateX(-50%);
            left: 50%;
        }

        .roll-result::after {
            border-top-color: #125750;
            bottom: -12px;
        }
        
        .roll-target::after {
            border-bottom-color: #125750;
            top: -12px;
        }
    }

    .seed-info {
        label {
            text-transform: uppercase;
        }
        .seed-text {
            padding: 10px;
            width: 100%;
            background: #eee;
            border-radius: 5px;
            word-break: break-all;
            color: #777;
        }
    }

    .close-btn {
        position: absolute;
        top: 15px;
        right: 20px;
    }
`

export default class BetInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id
        }
    }

    componentDidMount() {
        const { id } = this.props
        fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_id_num&filter_value=${id}`, { mode: "cors" })
        .then(e => e.json())
        .then(async (e) => {
            const data = e[0]
            const chain_id = await GetChainId()
            const block_id = data.block_data.block_num
            const op_index = data.operation_history.op_object.op_index
            const tx_data = data.operation_history.op_object.tx
            const block_hash = await GetBlock(block_id).then(block => block.witness_signature)
            const tx_seed = block_hash + "," + tx_data + "," + op_index
            const name = await GetAccount(data.account_history.account).then(account => account.name)
            const time = new Date(data.block_data.block_time + "Z")
            const asset = window.assets[data.operation_history.op_object.risk.asset_id]
            const symbol = asset.symbol
            const precision = asset.precision
            const roll_over = data.operation_history.op_object.bet[0] == ">" ? true : false

            this.setState({data: {name, tx_seed, chain_id, time, op: data.operation_history.op_object, precision, symbol, roll_over}})
        })
        .catch(() => {
            this.setState({data: null})
        })
    }

    render() {
        const { close, share } = this.props
        const { id, data } = this.state
        return (
            <div className={container + " d-flex justify-content-center"} onClick={close}>
                <div className="info-container qt-font-small align-self-center p-5 position-relative" onClick={(e) => e.stopPropagation()}>
                    <div className="close-btn cursor-pointer" onClick={close}>
                        <img src="/public/images/x_close.svg" height="12" alt="Close" />
                    </div>
                    { data && data.op.payout ?
                        <React.Fragment>
                            <div className="bet-info text-center">
                                <h4><b>BET #{id}</b>
                                    <img className="ml-2 cursor-pointer" 
                                        src="/public/images/share.svg" width="20"
                                        onClick={() => share("/bet " + id)}
                                        title="Share to chat"
                                    />
                                </h4>
                                <p className="text-secondary">
                                    Placed by {data.name}<br/>
                                    at {data.time.toLocaleString()}
                                </p>
                                
                                <div className="payout-info d-flex justify-content-around py-4 mt-5">
                                    <div>
                                        <span>BET</span><br/>
                                        {(data.op.risk.amount/Math.pow(10, data.precision)).toFixed(data.precision)}
                                        <img src={`/public/images/coins/${data.symbol.toLowerCase()}.svg`} 
                                            onError={(e) => {
                                                e.target.src='/public/images/crosschain-coin.svg'}
                                            }
                                            title={data.symbol} 
                                        />
                                    </div>
                                    <div className="border-left border-right border-secondary">
                                        <span>PAYOUT</span><br/>
                                        {(data.op ? (data.op.payout.amount/data.op.risk.amount) + 1 : 0).toFixed(2)}x
                                    </div>
                                    <div>
                                        <span>PROFIT</span><br/>
                                        <span className={data.op.payout.amount < 0 ? "loss" : "win"}>
                                            {(data.op.payout.amount/Math.pow(10, data.precision)).toFixed(data.precision)}
                                        </span>
                                        <img src={`/public/images/coins/${data.symbol.toLowerCase()}.svg`} 
                                            onError={(e) => {
                                                e.target.src='/public/images/crosschain-coin.svg'}
                                            }
                                            title={data.symbol} 
                                        />
                                    </div>
                                </div>

                                <div className="roll-info d-flex align-items-center mt-5">
                                    <span className="mr-3">0</span>
                                    <div className="d-flex w-100 position-relative">
                                        <div className={"bar-0" + (data.roll_over ? "" : " gold")} style={{width: data.op.bet.slice(1) + "%"}}/>
                                        <div className={"bar-1 position-relative" + (data.roll_over ? " gold" : "")}>
                                            <div className="roll-target">Target: {data.op.bet.slice(1)}</div>
                                        </div>
                                        <div className="roll-result" style={{left: data.op.outcome + "%"}}>Roll: {data.op.outcome}</div>
                                    </div>
                                    <span className="ml-3">100</span>
                                </div>
                            </div>
                            <div className="seed-info mt-5">
                                <div className="mt-4">
                                    <label>Transaction Seed</label>
                                    <div className="seed-text">{data.tx_seed}</div>
                                </div>
                                <div className="mt-4">
                                    <label>Network Chain ID</label>
                                    <div className="seed-text">{data.chain_id}</div>
                                </div>
                            </div>
                        </React.Fragment>
                        : data && !data.op.payout || data === null ?
                            <div className="text-center">Unable to get BET #{id}</div>
                            : <Loader type={"box"} margin={"auto"} className={"text-center"} />
                    }
                    
                </div>
            </div>
        )
    }
}