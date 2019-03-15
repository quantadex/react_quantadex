import React, { Component } from 'react';
import CONFIG from '../config.js'
import { connect } from 'react-redux'
import { css } from 'emotion'
import { withdrawVesting } from '../redux/actions/app.jsx'
import Loader from './ui/loader.jsx'
import { toast } from 'react-toastify';

const container = css`
  color: #999;
  font-size: 16px;

  tr {
    height: 40px;
  }

  button {
    width: 100px;
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
    border-color: #31383d
  }
`;

class Vesting extends Component {
  constructor(props) {
    super(props)
    this.state = {
      claim_status: {}
    }
  }

  claimVesting(balance_id, amount, asset, display_amount) {
    let claim_status = this.state.claim_status
    claim_status[balance_id] = true
    this.setState({claim_status})
    this.props.dispatch(withdrawVesting({balance_id, amount, asset})).then(e => {
      toast.success(`Successfully claimed ${display_amount}.`, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER
      })
    }).catch(e => {
      toast.error("Unable to claim balance. Please try again.", {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER
      })
    }).finally(() => {
      claim_status[balance_id] = false
      this.setState({claim_status})
    })
  }

  render() {
    return (
      <div className={container + " content" + (this.props.isMobile ? " mobile" : "")}>
        {this.props.vesting.length == 0 ?
          <div className="text-center">You have no vesting balance.</div> : null
        }
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
                      <button className="my-3" disabled={this.state.claim_status[balance.id]}
                        onClick={() => this.claimVesting(balance.id, balance.balance.amount, balance.balance.asset_id, display_amount)}>
                          {this.state.claim_status[balance.id] ? 
                            <Loader size="24px"/> :  "Claim Now"}
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
    vesting: state.app.vesting,
	});


export default connect(mapStateToProps)(Vesting);
