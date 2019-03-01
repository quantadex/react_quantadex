import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import { connect } from 'react-redux'
import {SymbolToken} from './ui/ticker.jsx'

const container = css`
    font-size: 14px
    tr {
        border-bottom: 1px solid #444;
    }
    tr td:first-child {
        color: #aaa;
    }
    .no-scroll-bar {
        height: calc(100vh - 555px);
    }

    &.mobile {
        padding: 0 10px;
    }
`

class Balance extends Component {
    render() {
        return (
            <div className={container + " qt-font-light" + (this.props.isMobile ? " mobile" : "")}>
                Wallet Balance <Link to="exchange/wallets" className={"ml-2 " + (this.props.balance.length == 0 ? "d-none": "")}><img src="/public/images/open-icon.svg" /></Link>
                <div className="no-scroll-bar">
                    <div>
                        <table className="w-100 mt-3">
                            <tbody>
                                {this.props.balance.map(row => {
                                    return (
                                        <tr key={row.asset}>
                                            <td><SymbolToken name={window.assets[row.asset].symbol} /></td>
                                            <td className="text-right">{row.balance.toLocaleString(navigator.language, {maximumFractionDigits: 8})}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
    balance: state.app.balance || []
});

export default connect(mapStateToProps)(Balance);