import React, {PropTypes} from 'react';
import { TransactionBuilder } from "@quantadex/bitsharesjs"

import { css } from 'emotion'
import globalcss from '../global-css.js'

const container = css`
  margin:0 -15px;
  background-color:white;
  color: #28303c;

  input {
    width: 100%;
    color: #777;
    padding: 0 10px;
    text-align: left;
    border: solid 1px rgba(34, 40, 44,0.27);
    border-radius: 2px;
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
    width: 100%;
    padding: 15px 30px;
    border-left: 1px solid #eee;
  }
`

export default class QTWithdraw extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      destination: "",
      amount: "",
      memo: "",
      asset: this.props.asset,
      fee: {amount: 0, asset: 'QDEX'}
    }
  }

  componentDidMount() {
    let tr = new TransactionBuilder();
    let transfer_op = tr.get_type_operation("transfer", {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        from: 0,
        to: 0,
        amount: {amount: 0, asset_id: "1.3.0"}
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

  render() {
    return (
      <div className={container + " d-flex"}>
        <div className="d-none d-md-flex w-100 align-items-center">
          <h1 className="mx-auto">TRANSFER<br/>{this.props.asset}</h1>
        </div>
        <div className="input-container">
          <div className="mb-3">
            <label className="my-0">DESTINATION ACCOUNT</label>
            <input type="text" spellCheck="false" value={this.state.destination} onChange={(e) => this.setState({destination: e.target.value.toLowerCase()})}/>
          </div>
          <div className="mb-3">
            <label className="my-0">AMOUNT</label>
            <input type="number" value={this.state.amount} onChange={(e) => this.setState({amount: e.target.value})}/>
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
            {/* <div>
              <b>TOTAL TRANSFER</b><br/>
              {((parseFloat(this.state.amount) * Math.pow(10, 6)) + (this.state.fee.amount * Math.pow(10, 6))) / Math.pow(10, 6) || 0}
            </div> */}
            <button className="cursor-pointer" onClick={() => this.props.onSend({type: "Transfer", ...this.state})}
              disabled={this.state.destination.length == 0 || this.state.amount == 0}>SEND</button>
          </div>
        </div>
      </div>
    );
  }
}

QTWithdraw.propTypes = {
};
