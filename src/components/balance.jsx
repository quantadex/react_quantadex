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
`

class Balance extends Component {
    render() {
        return (
            <div className={container + " qt-font-light"}>
                Wallet Balance <Link to="exchange/wallets" className="ml-2"><img src="/public/images/open-icon.svg" /></Link>
                <table className="w-100 mt-3">
                    <tbody>
                        {this.props.balance.map(row => {
                            return (
                                <tr>
                                    <td>{window.assets[row.asset].symbol}</td>
                                    <td className="text-right">{row.balance}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    balance: state.app.balance || []
});

export default connect(mapStateToProps)(Balance);