import React, {PropTypes} from 'react';
import { GetAccount } from '../../redux/actions/app.jsx'
import { connect } from 'react-redux'
import CONFIG from '../../config.js';
import QRCode from 'qrcode'
import {SymbolToken} from './ticker.jsx'
import { css } from 'emotion'
import globalcss from '../global-css.js'
import Loader from './loader.jsx'
import ReactGA from 'react-ga';

const container = css`
  position: relative;
  margin:0 -15px;
  background-color:white;
  font-size: 12px;
  color: #8A899D;

  h5 {
    color: #333;
  }

  p {
    line-height: 15px;
  }

  input {
    width: 100%;
    color: #777;
    padding: 0 10px;
    text-align: left;
    border: solid 1px rgba(34, 40, 44,0.27);
    border-radius: 2px;
  }
  
  button {
    padding: 10px;
    width: 170px;
    height: auto;
    font-size: 14px;
    background-color: ${globalcss.COLOR_THEME};
    color: #ffffff;
    text-align:center;
    border-radius: 2px;
  }

  button:disabled, .disabled {
    background-color: #999;
  }

  button.cancel-btn {
    background: transparent;
    color: #777;
    width: max-content;
    cursor: pointer;
  }

  button.cancel-btn:hover {
    text-decoration: underline;
  }

  .copy-btn {
    padding: 2px 10px;
    width: auto;
    background-color: transparent;
    color: #1cdad8;
    border: 1px solid #1cdad8;
  }

  .warning {
    padding-left: 30px;
    background: url(${devicePath("public/images/warning.svg")}) no-repeat 0 50%;
    color: #333;
    font-size: 14px;
  }

  .input-container {
    width: 100%;
    padding: 20px 30px;
    border-left: 1px solid #eee;

    a {
      color: ${globalcss.COLOR_THEME} !important;
      text-decoration: underline !important;
    }
  }

  #qr-canvas {
    width: 150px;
  }

  #deposit-address {
    width: auto;
    max-width: 80%;
    border: 0;
    padding: 0;
  }

  .close-dialog {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 12px;
    font-weight: bold;
    color: ${globalcss.COLOR_THEME};
    text-decoration: underline;
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

  a {
    color: inherit !important;
  }

  a img {
    vertical-align: baseline;
  }
`

class QTDeposit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deposit_address: this.props.deposit_address,
      issuer: undefined,
      destination: "",
      amount: "",
      memo: "",
      asset: this.props.asset,
      fee: {amount: 0, asset: 'QDEX'},
      init: false
    }
    
    this.CoinDetails = this.CoinDetails.bind(this)
    this.Deposit = this.Deposit.bind(this)
    this.NoAddress = this.NoAddress.bind(this)
    this.generateAddress = this.generateAddress.bind(this)
  }

  componentDidMount() {
    fetch(CONFIG.getEnv().API_PATH + "/node1/address/" + (this.props.isETH ? "eth" : "btc") + "/" + this.props.name).then(e => e.json())
    .then(e => {
      this.setState({init: true, deposit_address: e && (e[e.length-1] && e[e.length-1].Address) || undefined})
    })
  }

  copyText() {
    var copyText = document.getElementById("deposit-address");
    copyText.select();
    document.execCommand("copy");
  }

  generateAddress() {
    this.setState({generating: true})
    fetch(CONFIG.getEnv().API_PATH + "/node1/address/" + (this.props.isETH ? "eth" : "btc") + "/" + this.props.name, {
			method: "post",
			headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
			},
			body: {}
		}).then(response => {
      if (response.status == 200) {
          return response.json().then(res => {
          this.setState({deposit_address: res[0].Address})
        })
			} else {
				return response.json().then(res => {
          this.setState({error: JSON.stringify(res)})
				  Rollbar.error("Failed to generate address", res);
				})
			}
    }).finally(() => {
      this.setState({generating: false})
    })
  }
  
  CoinDetails() {
    const coin = window.assetsBySymbol[this.props.asset]

    !this.state.issuer && GetAccount(coin.issuer).then(issuer => {
      this.setState({issuer: (issuer.name == "null-account" ? "Native": issuer.name)})
    })

    return (
      <div className={coin_details + " mx-auto py-5"}>
        <h1>DEPOSIT<br/><SymbolToken name={coin.symbol} showIcon={false} /></h1>
        <div>
          Asset ID: <span className="value">{coin.id}</span> <a href={CONFIG.getEnv().EXPLORER_URL + "/object/" + coin.id} target="_blank"><img src={devicePath("public/images/external-link.svg")} /></a><br/>
          Issuer: <span className="value">{this.state.issuer}</span><br/>
          Precision: <span className="value">{coin.precision}</span><br/>
          Max Supply: <span className="value">{(parseInt(coin.options.max_supply)/Math.pow(10, coin.precision)).toLocaleString(navigator.language)}</span>
        </div>
      </div>
    )
  }

  NoAddress() {
    return (
      <div className="input-container">
        <h5 className="mb-3 text-uppercase"><b>Generate your Deposit Address</b></h5>
        <p>
          Crosschain technology generates you a personalized 
          multisig deposit address linking to your QUANTA wallet.
        </p>
        {
          this.state.generating ? 
            <Loader type="box" /> 
          :
            <button className={"mr-4 mt-5 mb-3 cursor-pointer"}
            onClick={this.generateAddress}>Generate Address</button>
        }
        {this.state.error? <div className="text-danger">Error: {this.state.error}</div> : null}
        
      </div>
    )
  }

  Deposit() {
    setTimeout(() => {
      var canvas = document.getElementById('qr-canvas')
      this.state.deposit_address && QRCode.toCanvas(canvas, this.state.deposit_address, {width: 150, margin: 0})
    }, 0)

    const token = this.props.asset.split("0X")

    return (
      <div className="input-container">
        {this.state.deposit_address ? 
          <React.Fragment>
            <h5 className="mb-3"><b>YOUR PERSONAL MULTISIGNATURE DEPOSIT ADDRESS</b></h5>

            <div className="d-flex">
            <canvas id="qr-canvas"></canvas>
              <p className="ml-4">
              Important Notes <br/>
              - Do not send any coin other than {token[0]} {token[1] && ("0x" + token[1].substr(0, 4))} to this address.<br/>
              - The minimum deposit amount is 0.0001 {token[0]} {token[1] && ("0x" + token[1].substr(0, 4))}.<br/>
              - Your deposit will be credited after 2 confirmation.<br/>
              - QUANTA does not support fiat withdrawal or deposit. To buy BTC, ETH with fiat currency, you can exchange your local currency at any major exchange.<br/>
              - All QUANTA deposit addresses are multi-sig, crosschain addresses.<br/>
              </p>
            </div>
            
            <div className="d-flex align-items-center mt-4">
                <input type="text" id="deposit-address" className="text-dark mr-3" 
                  readOnly value={this.state.deposit_address} size={this.state.deposit_address.length + 10} />
                <button className="copy-btn cursor-pointer" onClick={this.copyText}>Copy</button>
            </div>
          </React.Fragment>
        :
          <div className="h-100 d-flex align-items-center">
            <div className="w-100 text-center">
              <Loader type="box" />
              <p>Getting Address...</p>
            </div>
          </div>
        }
        </div>
    )
  }

  render() {
    return (
      <div className={container + " d-flex"}>
        <div className="d-none d-md-flex w-75 align-items-center">
          {this.props.asset !== "ERC20" ? <this.CoinDetails /> :
            <div className={coin_details + " mx-auto"}>
              <h1>DEPOSIT<br/>{this.props.asset}</h1>
            </div>
          }
        </div>
        <div className="close-dialog cursor-pointer" onClick={this.props.handleClick}>Close</div>
        {this.state.init && !this.state.deposit_address ? <this.NoAddress /> : <this.Deposit />}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  publicKey: state.app.publicKey,
  name: state.app.name
});


export default connect(mapStateToProps)(QTDeposit);