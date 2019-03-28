import React, {Component} from 'react';
import { SymbolToken } from './ticker.jsx'

import { css } from 'emotion'
import globalcss from '../global-css.js'
import Loader from './loader.jsx'

const container = css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,0.6);
    font-size: 13px;
    z-index: 999;

    .dialog-content {
        padding: 20px 35px;
        border-radius: 3px;
        background-color: #fff;
        width: 100%;
        max-width: 330px;
        height: fit-content;
        align-self: center;
        margin: auto;
        color: #333;

        h3 {
            color: #605CCE;
        }
    }

    .data {
        font-size: 12px;
        word-break: break-word;
    }

    button {
        width: 50%;
        padding: 5px;
        background-color: ${globalcss.COLOR_THEME};
        color: #ffffff;
        font-weight: bold;
        line-height: 20px;
        text-align:center;
        border-radius: 2px;
        cursor: pointer;
    }
    
    button:disabled {
        background-color: #999;
    }

    button.cancel-btn, button.cancel-btn:disabled {
        width: 30%;
        background-color: transparent;
        color: #555;
    }
`

export default class TxDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const {data} = this.props
        const has_fund = data.fund ? data.fund > data.fee.amount : true
        return (
            <div className={container + " d-flex align-content-center"}>
                <div className="dialog-content">
                    <h3 className="text-center">Confirm Transaction</h3>
                    <table className="data w-100 mt-5">
                        <tbody>
                            { data.type &&
                                <tr>
                                    <td>Operation Type</td>
                                    <td className="text-right text-secondary">{data.type}</td>
                                </tr>
                            }
                            { data.destination &&
                                <tr>
                                    <td>Destination Account</td>
                                    <td className="text-right text-secondary">{data.destination}</td>
                                </tr>
                            }
                            { data.amount &&
                                <tr>
                                    <td>Amount</td>
                                    <td className="text-right text-secondary">{data.amount.amount} <SymbolToken name={data.amount.asset} showIcon={false}/></td>
                                </tr>
                            }
                            { data.memo &&
                                <React.Fragment>
                                    <tr>
                                        <td colSpan={2}>{data.memo.type}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="text-secondary pl-3">{data.memo.memo}</td>
                                    </tr>
                                </React.Fragment>
                            }
                            { data.fee &&
                                <tr>
                                    <td>Platform Fee</td>
                                    <td className="text-right text-secondary">{data.fee.amount} {data.fee.asset}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                    {
                        !has_fund ?
                            <span className="text-danger small float-right">* Insufficient Fund</span>
                            : null
                    }
                    <div className="d-flex justify-content-around mt-5">
                        <button className="cancel-btn" onClick={this.props.cancel} disabled={this.state.processing}>CANCEL</button>
                        <button disabled={this.state.processing || !has_fund} onClick={() => {
                            this.setState({processing: true})
                            this.props.submit()
                        }}>{this.state.processing ? <Loader /> : "Accept"}</button>
                    </div>
                </div>
            </div>
        )
    }
}