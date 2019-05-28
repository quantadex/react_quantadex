import React, { Component } from 'react';
import CONFIG from '../config.js'
import { connect } from 'react-redux'
import { css } from 'emotion'
import { withdrawVesting, withdrawGenesis } from '../redux/actions/app.jsx'
import Loader from './ui/loader.jsx'
import {LockIcon} from './ui/account_lock.jsx'
import { toast } from 'react-toastify';
import { PrivateKey, PublicKey, Aes, key, ChainStore } from "@quantadex/bitsharesjs/es";

function timeStringToDate(block_time) {
  if (!/Z$/.test(block_time)) {
    block_time += "Z";
  }
  return new Date(block_time);
}

const container = css`
  color: #999;
  font-size: 16px;

  tr {
    height: 40px;
  }

  button {
    text-align: center;
    background: transparent;
    color: #1cdad8;
    border: 1px solid #1cdad8;
    border-radius: 3px;
    padding: 5px 10px;
    cursor: pointer;
  }

  button:hover {
    background: #1cdad8;
    color: #333;
  }

  button:disabled {
    background: #31383d;
    border-color: #31383d;
    color: #999;
  }
`;

class Vesting extends Component {
  constructor(props) {
    super(props)
    this.state = {
      claim_status: {},
      claimed_balance: []
    }
  }

  claimBalance(balance_id, amount, asset, display_amount, genesis = false) {
    const self = this;
    let claim_status = this.state.claim_status
    claim_status[balance_id] = true
    this.setState({claim_status})
    this.props.dispatch(genesis ? withdrawGenesis({balance_id, amount, asset}) : withdrawVesting({balance_id, amount, asset})).then(e => {
      toast.success(`Successfully claimed ${display_amount}.`, {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
        pauseOnFocusLoss: false,
        pauseOnHover: false
      })
      
      if (genesis) {
        let claimed = self.state.claimed_balance
        claimed.push(balance_id)
        self.setState({claimed_balance: claimed})
      }

    }).catch(e => {
      toast.error("Unable to claim balance. Please try again.", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
        pauseOnFocusLoss: false,
        pauseOnHover: false
      })
    }).finally(() => {
      claim_status[balance_id] = false
      this.setState({claim_status})
    })
  }

  getClaimAmount(balance) {
    if (balance.vesting_policy) {
      const object = ChainStore.getObject("2.1.0");
      const timestamp = timeStringToDate(object.get("time"))
      const begintime = timeStringToDate(balance.vesting_policy.begin_timestamp)

      const withdrawn_already = BigInt(balance.vesting_policy.begin_balance) - BigInt(balance.balance.amount);
      const elapsed_seconds = (timestamp.getTime() - begintime.getTime())/1000;
      var total_vested = (BigInt(balance.vesting_policy.begin_balance) * BigInt(elapsed_seconds) / BigInt(balance.vesting_policy.vesting_duration_seconds))
      console.log(total_vested, withdrawn_already);
      return parseInt(total_vested - withdrawn_already);
    } else {
      return balance.balance.amount
    }
  }
  render() {
    return (
      <div className={container + " content" + (this.props.isMobile ? " mobile px-4" : "")}>
        {this.props.vesting.length + this.props.genesis.length == 0 ?
          <div className="text-center">You have no vesting balance.</div> : null
        }

        {this.props.genesis.map(balance => {
          const coin = window.assets[balance.balance.asset_id]
          const display_amount = (balance.balance.amount / Math.pow(10, coin.precision)).toLocaleString(navigator.language) + ' ' + coin.symbol
          return (
            <div key={balance.id} className="table-responsive mb-5">
              <h4>Balance #{balance.id} [GENESIS]</h4>
              <table className="w-100">
                <tbody>
                  <tr className="border-bottom border-dark">
                    <td>Balance amount</td>
                    <td className="text-right">{display_amount}</td>
                  </tr>
                  <tr className="border-bottom border-dark">
                    <td>Last Claim Date amount</td>
                    <td className="text-right">{balance.last_claim_date}</td>
                  </tr>                  
                  {
                    balance.vesting_policy &&
                    (
                      <React.Fragment>
                      <tr className="border-bottom border-dark">
                        <td>Begin Balance</td>
                          <td className="text-right">{balance.vesting_policy.begin_balance / Math.pow(10, coin.precision)}</td>
                      </tr>
                        <tr className="border-bottom border-dark">
                          <td>Begin Date</td>
                          <td className="text-right">{balance.vesting_policy.begin_timestamp}</td>
                        </tr>                      
                        <tr className="border-bottom border-dark">
                          <td>Vesting Cliff (sec)</td>
                          <td className="text-right">{balance.vesting_policy.vesting_cliff_seconds}</td>
                        </tr>      
                      <tr className="border-bottom border-dark">
                        <td>Vesting Duration (sec)</td>
                          <td className="text-right">{balance.vesting_policy.vesting_duration_seconds}</td>
                      </tr>    
                        <tr className="border-bottom border-dark">
                          <td>Total Claimable</td>
                          <td className="text-right">{this.getClaimAmount(balance)/Math.pow(10,coin.precision)}</td>
                        </tr>                            
                      </React.Fragment>                
                    )
                  }
                  <tr>
                    <td></td>
                    <td className="text-right">
                      <button className="my-3" 
                        disabled={!this.props.private_key || this.state.claim_status[balance.id] || this.state.claimed_balance.indexOf(balance.id) !== -1}
                        onClick={() => this.claimBalance(balance.id, this.getClaimAmount(balance), balance.balance.asset_id, display_amount, true)}>
                          {!this.props.private_key ? <LockIcon /> : null}
                          {this.state.claim_status[balance.id] ? 
                            <Loader size="24px"/> : (this.state.claimed_balance.indexOf(balance.id) !== -1 ? "Claimed" : "Claim Now")
                          }
                        </button>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          )
        })}

        {this.props.vesting.map(balance => {
          const coin = window.assets[balance.balance.asset_id]
          const display_amount = (balance.balance.amount / Math.pow(10, coin.precision)).toLocaleString(navigator.language) + ' ' + coin.symbol
          return (
            <div key={balance.id} className="table-responsive mb-5">
              <h4>Balance #{balance.id}</h4>
              <table className="w-100">
                <tbody>
                  <tr className="border-bottom border-dark">
                    <td>Vesting balance amount</td>
                    <td className="text-right">{display_amount}</td>
                  </tr>
                  <tr className="border-bottom border-dark">
                    <td>Coin days earned</td>
                    <td className="text-right">{Math.floor(balance.policy[1].coin_seconds_earned / (60 * 60 * 24)).toLocaleString(navigator.language)}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td className="text-right">
                      <button className="my-3" disabled={!this.props.private_key || this.state.claim_status[balance.id]}
                        onClick={() => this.claimBalance(balance.id, balance.balance.amount, balance.balance.asset_id, display_amount)}>
                          {!this.props.private_key ? <LockIcon /> : null}
                          {this.state.claim_status[balance.id] ? 
                            <Loader size="24px"/> : "Claim Now"}
                        </button>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          )
        })}
      </div>
    );
	}
}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
    private_key: state.app.private_key,
    genesis: state.app.genesis,
    vesting: state.app.vesting || [],
	});


export default connect(mapStateToProps)(Vesting);
