import React, { Component } from 'react';
import CONFIG from '../config.js'
import QTTableView from './ui/tableView.jsx'
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'
import QTDeposit from './ui/deposit.jsx'
import QTWithdraw from './ui/withdraw.jsx'
import SearchBox from "./ui/searchBox.jsx"
import Loader from "./ui/loader.jsx"
import Switch from "./ui/switch.jsx"
import { updateUserData } from '../redux/actions/app.jsx'
import ReactGA from 'react-ga';

const container = css`
  padding-bottom: 30vh !important;

  .public-address-container {
    background-color: #2a3135;
    border-radius: 2px;
    padding: 25px 30px;
    #public-address {
      font-size: 16px;
      color: #bbb;
    }
    a {
      vertical-align: baseline;
      margin-left: 10px;
    }
  }
  .changelly {
    position: relative;
    a {
      color: ${globalcss.COLOR_THEME};
      border: 1px solid ${globalcss.COLOR_THEME};
      border-radius: 2px;
      padding: 5px 10px;
    }

    span {
      position: absolute;    
      right: 0;
      bottom: -20px;
    }
  }
  
  &.mobile {
    .public-address-container {
      margin: 0;
      padding: 10px 0;
      flex-direction: column;
      background-color: transparent;
      border-bottom: 1px solid #333;
      text-align: center;
      
      h3 {
        font-size: 13px;
      }

      #public-address {
        word-wrap: break-word;
        padding: 0 15px;
        line-height: 20px;
      }

      .est-fund {
        margin-top: 10px;
        padding-top: 10px;
        width: 100%;
        border-top: 1px solid #333;
        text-align: center !important;
      }
    }

    .filter-container, .table-row {
      padding: 0 15px;
    }

    .filter-container input {
      flex: auto;
    }

    [data-key="on_orders"], span.on_orders {
      display: none;
    }

    [data-key="usd_value"], span.usd_value {
      text-align: right;
      padding-right: 20px;
    }

    span.usd_value {
      background: url(${devicePath("public/images/menu-arrow-down.svg")}) no-repeat 100% 50%;
    }

    .action-btn {
      display: none !important;
      margin-top: 5px;
    }

    .active .action-btn {
      display: flex !important;
    }
  }
`;

class Wallets extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      unlisted: [],
      filter: "",
      hideZero: false,
      confirmDialog: false,
    }

    this.PublicAddress = this.PublicAddress.bind(this)
  }

  componentDidMount() {
    const { balance, dispatch } = this.props
    dispatch(updateUserData())
    this.setDataSource(balance)
  }

	componentWillReceiveProps(nextProps) {
    if (this.props.name !== nextProps.name) {
      this.componentDidMount(nextProps.name)
    }
    if (this.props.balance != nextProps.balance) {
      this.setDataSource(nextProps.balance)
    }
  }

  setDataSource(balance) {
    if (!window.assets || !window.wallet_listing) return
    const dataSource = []
    const in_wallet = []
    const unlisted = []

    balance.forEach(currency => {
      let symbol = window.assets[currency.asset].symbol
      const data = {
        pairs: symbol,
        balance: currency.balance,
        on_orders: this.props.onOrdersFund[currency.asset] || 0,
        usd_value: currency.usd > 0 ? currency.usd.toLocaleString(navigator.language, {maximumFractionDigits: 2, minimumFractionDigits: 2}) : "N/A"
      }
      if (window.wallet_listing.includes(symbol) || symbol == "QDEX") {
        dataSource.push(data)
        in_wallet.push(symbol)
      } else {
        unlisted.push(data)
      }
    });

    for (let coin of (Object.keys(window.assetsBySymbol) || [])) {
      if (in_wallet.indexOf(coin) === -1) {
        let data = {
          pairs: coin,
          balance: 0,
          on_orders: 0,
          usd_value: "N/A"
        }
        if (window.wallet_listing.includes(coin)) {
          dataSource.push(data)
        } else {
          unlisted.push(data)
        }
      }
    }

    dataSource.push({
      pairs: "Deposit New ERC20",
      balance: 0,
      on_orders: 0,
      usd_value: 0
    })

    this.setState({dataSource, unlisted})
  }
  
  handleChange(e) {
		this.setState({filter: e.target.value})
  }
  
  hideZeroBalance() {
    this.setState({hideZero: !this.state.hideZero})
  }

  PublicAddress() {
    return (
      <div className="public-address-container d-flex justify-content-between">
        <div id='public-address'>
          <h3>Your QUANTA Wallet Account</h3>
          <span className="qt-font-light">{this.props.name}</span>
          <a href={CONFIG.getEnv().EXPLORER_URL + "/account/" + this.props.name} target="_blank"><img src={devicePath("public/images/external-link-light.svg")} /></a>
        </div>
        <div className="est-fund text-right align-self-center">
          <span className="qt-font-extra-small qt-white-62">On-chain custody estimated funds</span>
          <div><span className="qt-font-huge">${this.props.estimated_fund.toLocaleString(navigator.language, {maximumFractionDigits: 4})} </span><span className="currency">USD</span></div>
        </div>
        
      </div>
    )
  }

  Changelly() {
    return (
      <div className="d-flex ml-auto my-2 changelly">
        <img className="mr-3" src={devicePath("public/images/visa-logo.svg")} alt="Visa" />
        <img className="mr-3" src={devicePath("public/images/mastercard-logo.svg")} alt="Mastercard" />
        <ReactGA.OutboundLink
          eventLabel="Clicked Buy BTC with credit card"
          to="https://payments.changelly.com/"
          target="_blank"
          className="text-uppercase"
        >
          BUY BTC with credit card
        </ReactGA.OutboundLink>
        <span className="small text-muted">
          <img 
            className="mr-2 align-bottom"
            data-tip="Copy & paste your BTC deposit address to Changelly, and buy with your credit card" 
            src={devicePath("public/images/question.png")} 
          /> 
          Powered by Changelly
        </span>
      </div>
    )
  }

  shortName(coin) {
    const pair = coin.split('0X')
		return pair[0] + (pair[1] ? "0X" + pair[1].substr(0,4) : "")
	}

  render() {
    const { network, private_key, publicKey, name, isMobile, mobile_nav, dispatch } = this.props
    const { dataSource, hideZero, filter, unlisted } = this.state
    const columns = [{
        title: "PAIRS",
        key: "pairs",
        type: "symbol",
        width:"80"
    }, {
        title: "TOTAL BALANCE",
        key: "balance",
        type: "number",
        width:"125"
    }, {
        title: "ON ORDERS",
        key: "on_orders",
        type: "number",
        width:"90"
    }, {
        title: "USD VALUE",
        key: "usd_value",
        type: "number",
        width:"90"
    }, {
        buttons: [{
          label: "WITHDRAW",
          color:"theme unite",
          handleClick: (asset, close) => {
						return <QTWithdraw asset={asset} handleClick={close} />
          }
        }, {
          label: "DEPOSIT",
          color:"theme unite",
          handleClick: (asset, close) => {
            ReactGA.event({
              category: 'DEPOSIT_EXPAND',
              action: asset
            });
            return <QTDeposit asset={asset} handleClick={close} quantaAddress={name} 
            isETH={(["ETH", "ERC20"].includes(asset) || asset.split("0X").length == 2)} />
          }
        }, {
          label: "TRADE",
          color:"theme unite"
        }],
        type: "buttons"
    }]
    
    return (
      <div className={container + " content" + (isMobile ? " mobile" : "")}>
        { publicKey ? <this.PublicAddress /> : null }
          
          
          <div className='filter-container d-flex flex-wrap mt-5 align-items-center'>
          <SearchBox placeholder="Search Coin" onChange={this.handleChange.bind(this)} style={{marginRight: "20px"}}/>
          <Switch label="Hide Zero Balances" active={hideZero} onToggle={this.hideZeroBalance.bind(this)} />
          <this.Changelly />
          </div>

          {dataSource.length == 0 ?
            <Loader size={50} />
            :
            <div className="table-row">
              <QTTableView dataSource={dataSource.filter(data => this.shortName(data.pairs).toLowerCase().includes(filter.toLowerCase()) && 
                  (!hideZero || data.balance > 0))} 
                  network={network}
                  dispatch={dispatch}
                  mobile_nav={mobile_nav}
                  columns={columns} mobile={isMobile} 
                  unlocked={private_key && true}/>
            </div>
          }

          {unlisted.length > 0 ?
            <div className="table-row">
              <h5>Unofficial Coins</h5>
              <QTTableView dataSource={unlisted.filter(data => this.shortName(data.pairs).toLowerCase().includes(filter.toLowerCase()) && 
                  (!hideZero || data.balance > 0))} 
                  network={network}
                  dispatch={dispatch}
                  mobile_nav={mobile_nav}
                  columns={columns} mobile={isMobile} 
                  unlocked={private_key && true}/>
            </div>
            : null
          }
      </div>
    );
	}
}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
    balance: state.app.balance || [],
    onOrdersFund: state.app.onOrdersFund || [],
    publicKey: state.app.publicKey || "",
    private_key: state.app.private_key,
    estimated_fund: state.app.totalFundValue || 0,
    usd_value: state.app.usd_value,
    name: state.app.name,
    network: state.app.network,
	});


export default connect(mapStateToProps)(Wallets);
