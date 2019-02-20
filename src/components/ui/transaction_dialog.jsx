import React, {Component} from 'react';

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
        padding: 20px 40px;
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

    button.cancel-btn {
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
        // console.log(this.props)
        return (
            <div className={container + " d-flex align-content-center"}>
                <div className="dialog-content">
                    <h3 className="text-center">Confirm Transaction</h3>
                    <table className="data w-100 mt-5">
                        <tbody>
                            <tr>
                                <td>Operation Type</td>
                                <td className="text-right text-secondary">{this.props.data.type}</td>
                            </tr>
                            <tr>
                                <td>Destination Account</td>
                                <td className="text-right text-secondary">{this.props.data.destination}</td>
                            </tr>
                            <tr>
                                <td>Amount</td>
                                <td className="text-right text-secondary">{this.props.data.amount} {this.props.data.asset}</td>
                            </tr>
                            <tr>
                                <td colSpan={2}>{this.props.data.type == "Transfer" ? "Memo" : "Beneficiary Address"}</td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="text-secondary pl-3">{this.props.data.memo}</td>
                            </tr>
                            <tr>
                                <td>Platform Fee</td>
                                <td className="text-right text-secondary">{this.props.data.fee.amount} {this.props.data.fee.asset}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-around mt-5">
                        <button className="cancel-btn" onClick={this.props.cancel} disabled={this.state.processing}>CANCEL</button>
                        <button disabled={this.state.processing} onClick={() => {
                            this.setState({processing: true})
                            this.props.submit()
                        }}>{this.state.processing ? <Loader /> : "Accept"}</button>
                    </div>
                </div>
            </div>
        )
    }
}