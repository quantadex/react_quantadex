import React, {PropTypes} from 'react';
import { GetName } from '../../redux/actions/app.jsx'
import { connect } from 'react-redux'
import QRCode from 'qrcode'
import { css } from 'emotion'
import globalcss from '../global-css.js'

const container = css`
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

  button:disabled {
    background-color: #999;
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
    background: url("/public/images/warning.svg") no-repeat 0 50%;
    color: #333;
    font-size: 14px;
  }

  .input-container {
    width: 100%;
    padding: 20px 30px;
    border-left: 1px solid #eee;
  }

  #qr-canvas {
    width: 150px;
  }

  #deposit-address {
    width: auto;
    border: 0;
    padding: 0;
  }
`

const coin_details = css`
  font-size: 14px;
  color: #4F637E;

  h1 {
    font-weight: bold;
  }

  span {
    color: #333;
  }

  a img {
    vertical-align: baseline;
  }
`

class QTDeposit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      issuer: undefined,
      destination: "",
      amount: "",
      memo: "",
      asset: this.props.asset,
      fee: {amount: 0, asset: 'QDEX'}
    }

    this.CoinDetails = this.CoinDetails.bind(this)
    this.MetamaskDeposit = this.MetamaskDeposit.bind(this)
    this.Deposit = this.Deposit.bind(this)
  }

  copyText() {
    var copyText = document.getElementById("deposit-address");
    copyText.select();
    document.execCommand("copy");
  }
  
  CoinDetails() {
    const coin = window.assetsBySymbol[this.props.asset]

    !this.state.issuer && GetName(coin.issuer).then(issuer => {
      this.setState({issuer: (issuer == "null-account" ? "Native": issuer)})
    })

    return (
      <div className={coin_details + " mx-auto"}>
        <h1>DEPOPSIT<br/>{coin.symbol}</h1>
        <div>
          Asset ID: <span>{coin.id}</span> <a href={"http://testnet.quantadex.com/object/" + coin.id} target="_blank"><img src="/public/images/external-link.svg" /></a><br/>
          Issuer: <span>{this.state.issuer}</span><br/>
          Precision: <span>{coin.precision}</span><br/>
          Max Supply: <span>{parseInt(coin.options.max_supply).toLocaleString(navigator.language)}</span>
        </div>
      </div>
    )
  }

  MetamaskDeposit() {
    return (
      <div className="input-container">
          <h5 className="mb-3"><b>CREATE YOUR ETHEREUM CROSSCHAIN ADDRESS</b></h5>
          <p>
            Crosschain technology protects your funds in a Ethereum smart contract, 
            which links your own personal ethereum address to the QUANTA smart contract. 
            You must have Metamask to create your own address.
          </p>
          <p>
            If you recently deployed a contract, wait for approximately 2 
            confirmation cycles (~30sec) to see your new cross chain address.
          </p>

          <div className="d-flex align-items-center mt-5 mb-3">
            <button className="mr-5 cursor-pointer">Deploy Contract</button>
            <div className="warning">Please login on Metamask to deploy Contract</div>
          </div>

          <div>Ethereum address:</div>
            
        </div>
    )
  }

  Deposit() {
    var canvas = document.getElementById('qr-canvas')

    setTimeout(() => {
      QRCode.toCanvas(canvas, this.props.publicKey, {width: 150, margin: 0})
    }, 0)
    
    return (
      <div className="input-container">
          <h5 className="mb-3"><b>YOUR PERSONAL MULTISIGNATURE DEPOSIT ADDRESS</b></h5>

          <div className="d-flex">
            <canvas id="qr-canvas"></canvas>
            <p className="ml-4">
            Important Notes <br/>
            - Do not send any coin other than BTC to this address.<br/>
            - The minimum deposit amount is 0.0001 BTC.<br/>
            - Your deposit will be credited after 2 confirmation.<br/>
            - QUANTA only accepts BTC deposits. To get Bitcoin, you can exchange your local currency at any major Bitcoin Exchange.<br/>
            - All QUANTA deposit addresses are multi-sig, crosschain addresses.<br/>
            </p>
          </div>
          
          
          <div className="d-flex align-items-center mt-4">
            <input type="text" id="deposit-address" className="text-dark mr-3" 
              readOnly value={this.props.publicKey} size={this.props.publicKey.length + 10} />
            <button className="copy-btn cursor-pointer" onClick={this.copyText}>Copy</button>
          </div>

            
        </div>
    )
  }

  render() {
    const metamask_coins = ["ETH", "ERC20"]
    return (
      <div className={container + " d-flex"}>
        <div className="d-none d-md-flex w-75 align-items-center">
          {this.props.asset !== "ERC20" ? <this.CoinDetails /> :
            <div className={coin_details + " mx-auto"}>
              <h1>DEPOPSIT<br/>{this.props.asset}</h1>
            </div>
          }
        </div>
        
        {metamask_coins.includes(this.props.asset) ? <this.MetamaskDeposit /> : <this.Deposit />}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  publicKey: state.app.publicKey
});


export default connect(mapStateToProps)(QTDeposit);