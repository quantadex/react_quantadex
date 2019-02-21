import React, {PropTypes} from 'react';
import { GetName } from '../../redux/actions/app.jsx'
import { connect } from 'react-redux'
import CONFIG from '../../config.js';
import Web3 from 'web3'
import QRCode from 'qrcode'
import {SymbolToken} from './ticker.jsx'
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
  }

  componentDidMount() {
    if (!this.state.deposit_address) {
      if (typeof web3 === 'undefined') {
        return
      }
      
      var self = this
      var metamask = new Web3(web3.currentProvider);

      this.accountInterval = setInterval(function() {
        if (metamask.eth.accounts.givenProvider.selectedAddress !== self.state.deposit_address) {
          self.setState({deposit_address: metamask.eth.accounts.givenProvider.selectedAddress})
        }
      }, 100);
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

  // GetDepositAddress() {
  //   const address = ["1A9cwmMkzz5CAp7QRwLELYsvpaX7bYGoWm"]
  //   this.setState({deposit_address: address[0]})
  // }

  DeployCrossChain = () => {
		const { quantaAddress } = this.props;
		if (!web3) {
			return;
    }
    
		const abi =
			'[{"constant":true,"inputs":[],"name":"quantaAddress","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"flush","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"destinationAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"trust","type":"address"},{"name":"quantaAddr","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogForwarded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogFlushed","type":"event"}]';
		const code =
			'608060405234801561001057600080fd5b5060405161041e38038061041e83398101604052805160208083015160008054600160a060020a031916600160a060020a0385161790559092018051919290916100609160019190840190610068565b505050610103565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100a957805160ff19168380011785556100d6565b828001600101855582156100d6579182015b828111156100d65782518255916020019190600101906100bb565b506100e29291506100e6565b5090565b61010091905b808211156100e257600081556001016100ec565b90565b61030c806101126000396000f3006080604052600436106100565763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416633c8410a281146100d65780636b9f96ea14610160578063ca32546914610177575b60408051348152905133917f5bac0d4f99f71df67fa7cebba0369126a7cb2b183bcb02b8393dbf5185ba77b6919081900360200190a26000805460405173ffffffffffffffffffffffffffffffffffffffff909116913480156108fc02929091818181858888f193505050501580156100d3573d6000803e3d6000fd5b50005b3480156100e257600080fd5b506100eb6101b5565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561012557818101518382015260200161010d565b50505050905090810190601f1680156101525780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561016c57600080fd5b50610175610242565b005b34801561018357600080fd5b5061018c6102c4565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b60018054604080516020600284861615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561023a5780601f1061020f5761010080835404028352916020019161023a565b820191906000526020600020905b81548152906001019060200180831161021d57829003601f168201915b505050505081565b6040805130318152905133917fa98efcd54f1f2ae5457ba3c68d7cf8974003a2bfce00f526f5624264a87bc0ea919081900360200190a26000805460405173ffffffffffffffffffffffffffffffffffffffff90911691303180156108fc02929091818181858888f193505050501580156102c1573d6000803e3d6000fd5b50565b60005473ffffffffffffffffffffffffffffffffffffffff16815600a165627a7a7230582043822668310b3d2e90aa63e4d6df1b84d5beb5b293b898420b19f04f9269d9770029';

		var forwardContract = web3.eth.contract(JSON.parse(abi));
		var contractData = forwardContract.new.getData(
			CONFIG.SETTINGS.CROSSCHAIN_ADDRESS,
			quantaAddress,
			{ data: code }
		);

		web3.eth.sendTransaction({ data: contractData }, function(err, transactionHash) {
			if (!err) console.log(transactionHash); // "0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385"
		});
	};
  
  CoinDetails() {
    const coin = window.assetsBySymbol[this.props.asset]

    !this.state.issuer && GetName(coin.issuer).then(issuer => {
      this.setState({issuer: (issuer == "null-account" ? "Native": issuer)})
    })

    return (
      <div className={coin_details + " mx-auto"}>
        <h1>DEPOPSIT<br/><SymbolToken name={coin.symbol} /></h1>
        <div>
          Asset ID: <span className="value">{coin.id}</span> <a href={CONFIG.SETTINGS.EXPLORER_URL + "/object/" + coin.id} target="_blank"><img src="/public/images/external-link.svg" /></a><br/>
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
          <h5 className="mb-3"><b>CREATE YOUR ETHEREUM CROSSCHAIN ADDRESS</b></h5>
          <p>
            Crosschain technology protects your funds in a Ethereum smart contract, 
            which links your own personal ethereum address to the QUANTA smart contract. 
            You must have Metamask to create your own address.
          </p>
          <p className={this.state.metamask_acc ? "invisible" : ""}>
            If you recently deployed a contract, wait for approximately 2 
            confirmation cycles (~30sec) to see your new cross chain address.
          </p>

          <div className="d-flex align-items-center mt-5 mb-3">
            <button className="mr-4 cursor-pointer" disabled={!this.state.metamask_acc}
              onClick={this.DeployCrossChain}>Deploy Contract</button>
            <div className={"warning" + (this.state.metamask_acc ? " invisible" : "")}>Please login on Metamask to deploy Contract</div>
          </div>

          <div className={!this.state.metamask_acc ? "invisible" : ""}>Ethereum address: {this.state.metamask_acc}</div>
            
        </div>
    )
  }

  Deposit() {
    setTimeout(() => {
      var canvas = document.getElementById('qr-canvas')
      QRCode.toCanvas(canvas, this.state.deposit_address, {width: 150, margin: 0})
    }, 0)

    const token = this.props.asset.split("0X")

    return (
      <div className="input-container">
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
        
        {this.state.deposit_address ? <this.Deposit /> : <this.MetamaskDeposit />}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  publicKey: state.app.publicKey
});


export default connect(mapStateToProps)(QTDeposit);