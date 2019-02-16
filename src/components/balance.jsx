import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import { connect } from 'react-redux'

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
`

class Balance extends Component {
    render() {
        return (
            <div className={container + " qt-font-light"}>
                Wallet Balance <Link to="exchange/wallets" className={"ml-2 " + (this.props.balance.length == 0 ? "d-none": "")}><img src="/public/images/open-icon.svg" /></Link>
                <div className="no-scroll-bar">
                    <div>
                        <table className="w-100 mt-3">
                            <tbody>
                                {this.props.balance.map(row => {
                                    return (
                                        <tr key={row.asset}>
                                            <td>{window.assets[row.asset].symbol}</td>
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
    balance: state.app.balance || []
});

export default connect(mapStateToProps)(Balance);