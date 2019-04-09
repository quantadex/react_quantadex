import React, { Component } from 'react';
import CONFIG from '../config.js'
import { connect } from 'react-redux'
import { css } from 'emotion'
import { accountUpgrade } from '../redux/actions/app.jsx'
import Loader from './ui/loader.jsx'
import { toast } from 'react-toastify';
import TxDialog from './ui/transaction_dialog.jsx'
import {LockIcon} from './ui/account_lock.jsx'
import Utils from '../common/utils'
import {SymbolToken} from './ui/ticker.jsx'

const container = css`
  color: #eee;
  font-size: 16px;

  .referral {
    tr {
        height: 40px;
    }
      
    button {
        text-align: center;
        background: #1cdad8;
        color: #eee;
        border: 1px solid #1cdad8;
        border-radius: 3px;
        padding: 5px 10px;
        white-space: nowrap;
        cursor: pointer;
    }

    button:disabled {
        background: #31383d;
        border-color: #31383d;
        color: #999;
    }

    input {
        width: 500px;
        max-width: 100%;
        text-align: left;
        padding: 10px;
        height: 40px;
        background: #fff;
        color: #555;
        border-radius: 3px;
    }

    .copy-btn {
        background: transparent;
        color: #1cdad8;
    }
  }

  .referral-paid {
      thead {
        font-size: 12px;
        color: #999;
      }
      tr {
          border-bottom: 1px solid #333;
      }
      td {
          padding-right: 20px;
      }
  }
  
`;

class Referral extends Component {
  constructor(props) {
    super(props)
    this.state = {
        fee: {amount: 10, asset: 'QDEX'}
    }
  }

  upgradeAccount() {
    const self = this;
    this.props.dispatch(accountUpgrade()).then(e => {
      localStorage.setItem("lifetime", "true")
      toast.success(`Successfully upgrade account.`, {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
        pauseOnFocusLoss: false
      })
    }).catch(error => {
      toast.error(error, {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
        pauseOnFocusLoss: false
      })
    }).finally(() => {
        self.setState({confirmDialog: false})
    })
  }

  copyText() {
    var copyText = document.getElementById("referral-url");
    copyText.select();
    document.execCommand("copy");
  }

  render() {
    const earned_coin = []
    const qdex_amount = this.props.qdex_amount && this.props.qdex_amount.find(obj => {
                          return obj.asset === "1.3.0"
                        })
    const fund = qdex_amount ? qdex_amount.balance : 0
    return (
      <div className={container + " content" + (this.props.isMobile ? " mobile px-4" : "")}>
        <div className="referral my-5 text-center">
            <h2>Earn 40% of the commission that you refer to QUANTA</h2>
            <p>Paid in trading asset (BTC, ETH, TUSD, QDEX, etc)</p>
            { this.props.lifetime ?
                <div className="d-flex justify-content-center mt-5">
                    <input id="referral-url" className="mr-4"
                        type="text" readOnly value={"https://trade.quantadex.com/?referrer=" + this.props.name} />
                    <button className="copy-btn cursor-pointer" onClick={this.copyText}>Copy</button>
                </div>

                : <button className="mt-5 px-5" disabled={!this.props.private_key}
                    onClick={() => this.setState({confirmDialog: true})}>
                    {this.props.private_key ? "" : <LockIcon /> }
                    JOIN REFERAL PROGRAM
                  </button>
            }
            
        </div>

        <div>
            <h4>Commission Earned</h4>
            <table className="referral-paid w-100 text-nowrap">
                <thead>
                    <tr>
                        <td className="w-100">PAIRS</td>
                        <td className="text-right">TOTAL BALANCE</td>
                        <td className="text-right">USD VALUE</td>
                    </tr>
                </thead>
                <tbody>
                    {this.props.referral_paid.map(paid => {
                        const coin = window.assets[paid.asset_id]
                        const real_amount = Utils.maxPrecision(paid.amount / Math.pow(10, coin.precision), coin.precision)
                        const usd_value = window.USD_value[paid.asset_id] ? Utils.maxPrecision(parseFloat(real_amount) * window.USD_value[paid.asset_id], 2) : "-"
                        earned_coin.push[coin.symbol]
                        
                        return (
                            <tr key={coin.symbol}>
                                <td><SymbolToken name={coin.symbol} /></td>
                                <td className="text-right">{real_amount}</td>
                                <td className="text-right">{usd_value}</td>
                            </tr>
                        )
                    })}
                    {window.wallet_listing.map(coin => {
                        if (earned_coin.indexOf(coin) === -1) {
                            return (
                                <tr key={coin}>
                                    <td><SymbolToken name={coin} /></td>
                                    <td className="text-right">0</td>
                                    <td className="text-right">-</td>
                                </tr>
                            )
                        }
                    })}
                </tbody>
            </table>
        </div>

        {this.state.confirmDialog && 
          <TxDialog data={{type: "Account Upgrade", fee: this.state.fee, fund }} 
            cancel={() => this.setState({confirmDialog: false})} 
            submit={() => this.upgradeAccount()} />
        }
      </div>
    );
	}
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
    isMobile: state.app.isMobile,
    lifetime: state.app.lifetime,
    name: state.app.name,
    referral_paid: state.app.referral_paid,
    qdex_amount: state.app.balance || []
});


export default connect(mapStateToProps)(Referral);
