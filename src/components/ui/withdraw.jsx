import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import CONFIG from '../../config.js'
import { TransactionBuilder } from "@quantadex/bitsharesjs"
import { GetAccount } from '../../redux/actions/app.jsx'
import {SymbolToken} from './ticker.jsx'
import WAValidator from 'wallet-address-validator'

import { css } from 'emotion'
import globalcss from '../global-css.js'
import { toast } from 'react-toastify';
import TxDialog from './transaction_dialog.jsx'
import { transferFund } from '../../redux/actions/app.jsx'
import Utils from '../../common/utils'
import ReactTooltip from 'react-tooltip'

const container = css`
  margin:0 -15px;
  background-color:white;
  color: #28303c;
  text-align: left;

  input {
    width: 100%;
    color: #777;
    padding: 0 10px;
    text-align: left;
    border: solid 1px rgba(34, 40, 44,0.27);
    border-radius: 2px;
  }

  input:read-only {
    background-color: #E1E1E1;
    color: #777;
  }
  
  button {
    width: 130px;
    background-color: ${globalcss.COLOR_THEME};
    color: #ffffff;
    text-align:center;
    border-radius: 2px;
  }

  button:disabled {
    background-color: #999;
  }

  .input-container {
    position: relative;
    width: 100%;
    padding: 15px 30px;
    border-left: 1px solid #eee;
  }

  .toggle {
    top: 10px;
    right: 15px;
    text-decoration: underline;
    color: ${globalcss.COLOR_THEME};
    cursor: pointer;
  }

  .tooltip {
    margin-left: 5px;
    opacity:0.9!important;
  }

  img {
    vertical-align: text-bottom;
  }
  
  .close-dialog {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 12px;
    font-weight: bold;
    color: ${globalcss.COLOR_THEME};
    text-decoration: underline;
    z-index: 1;
  }

  &.vertical {
    .toggle {
      left: 30px;
      right: auto;
    }
  }
`

const coin_details = css`
  font-size: 14px;
  color: #4F637E;

  h1 {
    font-weight: bold;
  }

  span.value {
    color: #333;
  }

  .issuer-tag {
    font-size: 15px !important;
    color: #fff !important;
    vertical-align: middle;
  }

  a img {
    vertical-align: baseline;
  }
`

class QTWithdraw extends React.Component {
  constructor(props) {
    super(props);
    const isCrosschain = CONFIG.getEnv().CROSSCHAIN_COINS.includes(this.props.asset) || this.props.asset.split("0X").length == 2
    this.state = {
      isCrosschain: isCrosschain,
      showTransfer: !isCrosschain,
      issuer: undefined,
      destination: "",
      amount: "",
      memo: "",
      asset: this.props.asset,
      fee: {amount: 0, asset: 'QDEX'}
    }
    this.coin = window.assetsBySymbol[this.props.asset]
    this.CoinDetails = this.CoinDetails.bind(this)
    this.toggleTransfer = this.toggleTransfer.bind(this)
    this.Transfer = this.Transfer.bind(this)
    this.Withdraw = this.Withdraw.bind(this)
  }

  componentDidMount() {
    let fee_asset = "1.3.0"
    let tr = new TransactionBuilder();
    let transfer_op = tr.get_type_operation("transfer", {
        fee: {
            amount: 0,
            asset_id: fee_asset
        },
        from: 0,
        to: 0,
        amount: {amount: 0, asset_id: fee_asset}
    });
    tr.add_operation(transfer_op)
    tr.set_required_fees().then(() => {
      this.setState({
        fee: {amount: tr.operations[0][1].fee.amount / Math.pow(10, window.assets[tr.operations[0][1].fee.asset_id].precision), 
          asset: window.assets[tr.operations[0][1].fee.asset_id].symbol
        },
      })
    })
  }

  toggleTransfer() {
    this.setState({showTransfer: !this.state.showTransfer, destination: "", amount: "", memo: "", error: false})
  }

  validateAddress(address) {
    const is_token = this.state.asset.split("0X").length > 1;

    let coin = is_token ? "ETH" : this.state.asset;
    let valid = WAValidator.validate(address, coin, this.props.network == "testnet" ? "testnet" : "prod")

    if (!valid) {
      this.setState({error: true, errorMsg: "Invalid address"})
      return
    }
    if (this.state.error) {
      this.setState({error: false, errorMsg: ""})
    }
  }

  confirmTransaction() {
		if (!this.state.error) {
			this.setState({confirmDialog: true})
    }
  }

  closeTransaction() {
    this.setState({ confirmDialog: false})
  }

  submitTransfer() {
    const token = this.state.asset.split("0X")
    this.props.dispatch(transferFund(this.state))
      .then(() => {
        toast.success(`Successfully transfer ${this.state.amount} ${token[0]} ${token[1] ? ("0x" + token[1].substr(0, 4)) : ""} to ${this.state.showTransfer ? this.state.destination : this.state.issuer}.`, {
          position: toast.POSITION.TOP_CENTER
        });
      }).then(() => {
        this.setState({destination: "", amount: "", memo: ""})
      })
      .catch((e) => {
        var msg = "Please make sure the destination account name is correct."
        if (String(e).includes("insufficient_balance") || String(e).toLowerCase().includes("insufficient balance")) {
          msg = "Insufficient Balance."
        }

        toast.error("Unable to transfer. " + msg, {
          position: toast.POSITION.TOP_CENTER
        });
      })
      .finally(() => {
        this.closeTransaction()
      })
  }
  
  CoinDetails() {
    const { issuer, showTransfer } = this.state
    const { vertical } = this.props

    !issuer && GetAccount(this.coin.issuer).then(issuer => {
      this.setState({issuer: (issuer.name == "null-account" ? "Native": issuer.name)})
    })

    return (
      <div className={coin_details + " mx-auto py-5" + (vertical ? " d-flex justify-content-between align-items-center w-100 px-5 border-bottom" : "")}>
        <h1>{showTransfer ? "TRANSFER" : "WITHDRAW"}<br/><SymbolToken name={this.coin.symbol} showIcon={false} /></h1>
        <div>
          Asset ID: <span className="value">{this.coin.id}</span> <a href={CONFIG.getEnv().EXPLORER_URL + "/object/" + this.coin.id} target="_blank"><img src={devicePath("public/images/external-link.svg")} /></a><br/>
          Issuer: <span className="value">{issuer}</span><br/>
          Precision: <span className="value">{this.coin.precision}</span><br/>
          Max Supply: <span className="value">{(parseInt(this.coin.options.max_supply)/Math.pow(10, this.coin.precision)).toLocaleString(navigator.language)}</span>
        </div>
      </div>
    )
  }

  Transfer() {
    const { vertical, handleClick } = this.props
    return (
      <div className="input-container">
        { vertical ? null : <div className="close-dialog cursor-pointer" onClick={handleClick}>Close</div> }
        {this.state.isCrosschain ? 
          <div className="d-md-none toggle qt-font-small mb-3" onClick={this.toggleTransfer}>Switch to {this.state.showTransfer ? "Withdraw" : "Transfer"}</div> 
          : null}
        <div className="mb-3">
          <label className="my-0">DESTINATION ACCOUNT</label>
          <input type="text" spellCheck="false" value={this.state.destination} onChange={(e) => this.setState({destination: e.target.value.toLowerCase()})}/>
        </div>
        <div className="mb-3">
          <label className="my-0">AMOUNT</label>
          <input type="number" value={this.state.amount} onChange={(e) => this.setState({amount: Utils.maxPrecision(e.target.value, this.coin.precision)})}/>
        </div>
        <div className="mb-3">
          <label className="my-0">MEMO (OPTIONAL)</label>
          <input type="text" value={this.state.memo} onChange={(e) => this.setState({memo: e.target.value})}/>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <div>
            <b>TRANSACTION FEE</b><br/>
            {this.state.fee.amount} {this.state.fee.asset}
          </div>
          <button className="cursor-pointer" onClick={() => this.confirmTransaction({type: "Transfer"})}
            disabled={this.state.destination.length == 0 || this.state.amount == 0}>SEND</button>
        </div>
      </div>
    )
  }

  Withdraw() {
    const { vertical, handleClick } = this.props
    const { isCrosschain, showTransfer, asset, issuer, amount, fee, error, errorMsg, memo } = this.state
    const mins = {BTC: 0.00075, ETH: 0.015, LTC: 0.0015, BCH: 0.0015}
    const withdraw_fees = {BTC: 0.0005, ETH: 0.005, LTC: 0.0005, BCH: 0.0005}

    const min_amount = mins[asset] || (asset.split('0X').length == 2 ? 0.015 : 0)
    const withdraw_fee = withdraw_fees[asset] || (asset.split('0X').length == 2 ? 0.005 : 0)
    return (
      <div className="input-container">
        { vertical ? null : <div className="close-dialog cursor-pointer" onClick={handleClick}>Close</div> }
        {isCrosschain ? 
          <div className="d-md-none toggle qt-font-small mb-3" onClick={this.toggleTransfer}>Switch to {showTransfer ? "Withdraw" : "Transfer"}</div> 
          : null}
        <div className="mb-3">
          <label className="my-0">DESTINATION ACCOUNT</label>
          <div className="d-inline ml-2 cursor-pointer" 
            data-tip="Withdraw requires funds to go back to the QUANTA cross-chain issuer for processing.">
              <img src={devicePath("public/images/question.png")} />
          </div>
          <input type="text" readOnly value={issuer || ""}/>
        </div>
        <div className="mb-3">
          <label className="my-0">AMOUNT</label>
          <input type="number" value={amount} onChange={(e) => this.setState({amount: Utils.maxPrecision(e.target.value, this.coin.precision)})}/>
        </div>
        <div className="mb-3">
          <label className="my-0">BENEFICIARY ADDRESS</label>
          <div className="d-inline ml-2 cursor-pointer" 
            data-tip="Specify the outgoing address where you want to withdraw your tokens.">
              <img src={devicePath("public/images/question.png")} />
          </div>
          {error && <span className="text-danger float-right">{errorMsg}</span>}
          <input type="text" spellCheck="false" value={memo} 
            onChange={(e) => {
              this.setState({memo: e.target.value})
              this.validateAddress(e.target.value)
            }}/>
        </div>
        { min_amount > 0 ? 
          <span className={amount > 0 && amount < min_amount ? "text-danger" : ""}>* Widthdraw Minimum: {min_amount}</span> 
          : null
        }
        <div className="d-flex justify-content-between mt-3">
          { withdraw_fee > 0 ? 
            <div>
              <b>WITHDRAW FEE</b><br/>
              {withdraw_fee} {asset.split('0X')[0]}
            </div>
            : null
          }
          <div>
            <b>TRANSACTION FEE</b><br/>
            {fee.amount} {fee.asset}
          </div>
          
          <button className="cursor-pointer" onClick={() => this.confirmTransaction({type: "Withdraw"})}
            disabled={memo.length == 0 || amount == 0 || amount < min_amount || error}>SEND</button>
        </div>
      </div>
    )
  }

  render() {
    const { vertical, handleClick } = this.props
    const {isCrosschain, showTransfer, confirmDialog, issuer, destination, amount, asset, fee, memo} = this.state
    return (
      <div className={container + " d-flex" + (vertical ? " flex-column vertical position-relative" : "")}>
        { vertical ? 
          <div className="close-dialog cursor-pointer" onClick={handleClick}>
            <img src="/react_quantadex/public/images/x_close.svg" height="12" alt="Close" />
          </div>
          : null
        }
        <div className={"d-none d-md-flex align-items-center position-relative"  + (vertical ? " w-100" : " w-75")}>
          {isCrosschain ? 
            <div className="position-absolute toggle qt-font-small" onClick={this.toggleTransfer}>Switch to {showTransfer ? "Withdraw" : "Transfer"}</div> 
            : null}
          <this.CoinDetails />
        </div>
        {showTransfer ? <this.Transfer /> : <this.Withdraw />}

        {confirmDialog && 
          <TxDialog data={{
              type: showTransfer ? "Transfer" : "Withdraw",
              destination: showTransfer ? destination : issuer,
              amount: {amount, asset},
              memo: {type: showTransfer ? "Memo" : "Beneficiary Address", memo},
              fee: fee
            }} 
            cancel={() => this.closeTransaction()} 
            submit={() => this.submitTransfer()} />
        }
        <ReactTooltip clickable={true} html={true} />
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  network: state.app.network
});
export default connect(mapStateToProps)(QTWithdraw);