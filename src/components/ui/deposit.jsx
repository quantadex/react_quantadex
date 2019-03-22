import React, {PropTypes} from 'react';
import { GetName } from '../../redux/actions/app.jsx'
import { connect } from 'react-redux'
import CONFIG from '../../config.js';
import Web3 from 'web3'
import QRCode from 'qrcode'
import {SymbolToken} from './ticker.jsx'
import { css } from 'emotion'
import globalcss from '../global-css.js'
import Loader from './loader.jsx'

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

  button:disabled {
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
      fee: {amount: 0, asset: 'QDEX'}
    }
    
    // var accountInterval
    this.CoinDetails = this.CoinDetails.bind(this)
    this.MetamaskDeposit = this.MetamaskDeposit.bind(this)
    this.Deposit = this.Deposit.bind(this)
    this.waitForContract = this.waitForContract.bind(this)
  }

  componentDidMount() {
    let transactionHash = localStorage.getItem(this.props.name + '_deploy_contract_tx')

    if (!this.state.deposit_address && this.props.isETH) {
      if (typeof web3 === 'undefined') {
        return
      }

      if (transactionHash) {
        this.waitForContract(transactionHash)
      }
      
      var self = this
      var metamask = new Web3(web3.currentProvider);

      this.accountInterval = setInterval(function() {
        if (metamask.eth.accounts.givenProvider.selectedAddress !== self.state.metamask_acc) {
          self.setState({metamask_acc: metamask.eth.accounts.givenProvider.selectedAddress})
        }
      }, 100);
    } else {
      localStorage.removeItem(this.props.name + '_deploy_contract_tx')
    }
  }

  componentWillUnmount() {
    try {
      clearInterval(this.accountInterval)
    } catch(e) {
      console.log(e)
    }
  }

  copyText() {
    var copyText = document.getElementById("deposit-address");
    copyText.select();
    document.execCommand("copy");
  }

  DeployCrossChain = () => {
    const self = this
		const { quantaAddress } = this.props;
		if (!web3) {
			return;
    }
    
    const abi = '[ { "constant": true, "inputs": [], "name": "quantaAddress", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "destinationAddress", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "trust", "type": "address" }, { "name": "quantaAddr", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "sender", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "LogForwarded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "sender", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "LogFlushed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "trust", "type": "address" }, { "indexed": false, "name": "quanta", "type": "string" } ], "name": "LogCreated", "type": "event" }, { "constant": false, "inputs": [ { "name": "tokenContractAddress", "type": "address" } ], "name": "flushTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "flush", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]';
    const code = "608060405234801561001057600080fd5b5060405161067338038061067383398101604052805160208083015160008054600160a060020a031916600160a060020a038516179055909201805191929091610060916001919084019061011b565b507fa49a9b1337d8427ee784aeaded38ac25b248da00282d53353ef0e2dfb664504a82826040518083600160a060020a0316600160a060020a0316815260200180602001828103825283818151815260200191508051906020019080838360005b838110156100d95781810151838201526020016100c1565b50505050905090810190601f1680156101065780820380516001836020036101000a031916815260200191505b50935050505060405180910390a150506101b6565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061015c57805160ff1916838001178555610189565b82800160010185558215610189579182015b8281111561018957825182559160200191906001019061016e565b50610195929150610199565b5090565b6101b391905b80821115610195576000815560010161019f565b90565b6104ae806101c56000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416633c8410a281146100e15780633ef133671461016b5780636b9f96ea1461019b578063ca325469146101b0575b60408051348152905133917f5bac0d4f99f71df67fa7cebba0369126a7cb2b183bcb02b8393dbf5185ba77b6919081900360200190a26000805460405173ffffffffffffffffffffffffffffffffffffffff909116913480156108fc02929091818181858888f193505050501580156100de573d6000803e3d6000fd5b50005b3480156100ed57600080fd5b506100f66101ee565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610130578181015183820152602001610118565b50505050905090810190601f16801561015d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561017757600080fd5b5061019973ffffffffffffffffffffffffffffffffffffffff6004351661027b565b005b3480156101a757600080fd5b506101996103e4565b3480156101bc57600080fd5b506101c5610466565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b60018054604080516020600284861615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156102735780601f1061024857610100808354040283529160200191610273565b820191906000526020600020905b81548152906001019060200180831161025657829003601f168201915b505050505081565b604080517f70a082310000000000000000000000000000000000000000000000000000000081523060048201819052915183929160009173ffffffffffffffffffffffffffffffffffffffff8516916370a0823191602480830192602092919082900301818787803b1580156102f057600080fd5b505af1158015610304573d6000803e3d6000fd5b505050506040513d602081101561031a57600080fd5b5051905080151561032a576103de565b60008054604080517fa9059cbb00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff92831660048201526024810185905290519186169263a9059cbb926044808401936020939083900390910190829087803b1580156103a757600080fd5b505af11580156103bb573d6000803e3d6000fd5b505050506040513d60208110156103d157600080fd5b505115156103de57600080fd5b50505050565b6040805130318152905133917fa98efcd54f1f2ae5457ba3c68d7cf8974003a2bfce00f526f5624264a87bc0ea919081900360200190a26000805460405173ffffffffffffffffffffffffffffffffffffffff90911691303180156108fc02929091818181858888f19350505050158015610463573d6000803e3d6000fd5b50565b60005473ffffffffffffffffffffffffffffffffffffffff16815600a165627a7a7230582061de18e7775520f21638941b7eec74f2ecdf7fc3d481b5a131c0ac336fecd5780029";

		var forwardContract = web3.eth.contract(JSON.parse(abi));
		var contractData = forwardContract.new.getData(
			CONFIG.getEnv().CROSSCHAIN_ADDRESS,
			quantaAddress,
			{ data: code }
		);

		web3.eth.sendTransaction({ data: contractData }, function(err, transactionHash) {
			if (!err) {
        // console.log(transactionHash);
        localStorage.setItem(self.props.name + '_deploy_contract_tx', transactionHash);
        self.waitForContract(transactionHash)
      }
		});
  };
  
  waitForContract(transactionHash) {
    const self = this
    self.setState({deploy_contract_tx: transactionHash})
    let deploy_interval = setInterval(() => {
      web3.eth.getTransaction(transactionHash, (error, transaction) => {
        if (transaction.blockNumber) {
          clearInterval(deploy_interval)
          let address_interval = setInterval(() => {
            fetch(CONFIG.getEnv().API_PATH + "/node1/address/eth/" + self.props.name).then(e => e.json())
            .then(e => {
              if (e && e[e.length-1]) {
                clearInterval(address_interval)
                self.setState({contract_block: transaction.blockNumber, deposit_address: e[e.length-1].Address})
                self.props.setAddress("eth", e[e.length-1].Address)
                localStorage.removeItem(self.props.name + '_deploy_contract_tx')
              }
            })
          }, 2000)
        }
      })
    }, 2000)
  }

  cancelContract() {
    this.setState({deploy_contract_tx: null})
    localStorage.removeItem(this.props.name + '_deploy_contract_tx')
  }
  
  CoinDetails() {
    const coin = window.assetsBySymbol[this.props.asset]

    !this.state.issuer && GetName(coin.issuer).then(issuer => {
      this.setState({issuer: (issuer == "null-account" ? "Native": issuer)})
    })

    return (
      <div className={coin_details + " mx-auto"}>
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

  MetamaskDeposit() {
    return (
      <div className="input-container">
        {this.state.deploy_contract_tx ?
          <React.Fragment>
            <h5 className="mb-3"><b>WAITING FOR CROSSCHAIN ADDRESS TO COMPLETE</b></h5>
            <p>Your crosschain address is being deployed...</p>
            <p>
              Transaction ID: <a href={CONFIG.getEnv().ETHERSCAN_URL + "/tx/" + this.state.deploy_contract_tx} target="_blank">{this.state.deploy_contract_tx}</a>
            </p>

            {this.state.contract_block ? 
              <p>Block Number: <a href={CONFIG.getEnv().ETHERSCAN_URL + "/block/" + this.state.contract_block} target="_blank">{this.state.contract_block}</a></p>
              :
              <Loader type="box" />
            }

            <div className="d-flex align-items-center mt-5 mb-3">
              <button className="mr-4 cursor-pointer" disabled={!this.state.deposit_address}
                onClick={() => this.setState({deploy_contract_tx: null})}>{this.state.deposit_address ? "View Address" : "Waiting..."}</button>
              {!this.state.deposit_address ? <button className="cancel-btn" onClick={this.cancelContract.bind(this)}>CANCEL</button> : null}
            </div>
          </React.Fragment>
          :
          <React.Fragment>
            <h5 className="mb-3"><b>CREATE YOUR ETHEREUM CROSSCHAIN ADDRESS</b></h5>
            <p>
              Crosschain technology protects your funds in a Ethereum smart contract, 
              which links your own personal ethereum address to the QUANTA smart contract. 
              You must have Metamask to create your own address.
            </p>
            <p className={this.state.metamask_acc ? "" : "invisible"}>
              If you recently deployed a contract, wait for approximately 2 
              confirmation cycles (~30sec) to see your new cross chain address.
            </p>

            <div className="d-flex align-items-center mt-5 mb-3">
              <button className="mr-4 cursor-pointer" disabled={!this.state.metamask_acc}
                onClick={this.DeployCrossChain}>Deploy Contract</button>
              <div className={"warning" + (this.state.metamask_acc ? " invisible" : "")}>Please login on Metamask to deploy Contract</div>
            </div>

            <div className={!this.state.metamask_acc ? "invisible" : ""}>Ethereum address: {this.state.metamask_acc}</div>
          </React.Fragment>
        }
          
            
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
          <h5 className="mb-3"><b>YOUR PERSONAL MULTISIGNATURE DEPOSIT ADDRESS</b></h5>

          <div className="d-flex">
          { this.state.deposit_address ? <canvas id="qr-canvas"></canvas> : null }
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
          
            {this.state.deposit_address ? 
              <React.Fragment>
                <input type="text" id="deposit-address" className="text-dark mr-3" 
                  readOnly value={this.state.deposit_address} size={this.state.deposit_address.length + 10} />
                <button className="copy-btn cursor-pointer" onClick={this.copyText}>Copy</button>
              </React.Fragment>
            :
              <span className="text-danger">Your deposit address is being generated. Please try again later</span>
            }
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
        <div className="close-dialog cursor-pointer" onClick={this.props.handleClick}>Close</div>
        {!this.state.deposit_address || this.state.deploy_contract_tx ? (this.props.isETH ? <this.MetamaskDeposit /> : <this.Deposit />) : <this.Deposit />}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  publicKey: state.app.publicKey,
  name: state.app.name
});


export default connect(mapStateToProps)(QTDeposit);