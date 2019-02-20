import React, { Component } from 'react';
import Header from './headersimple.jsx';
import QTTableView from './ui/tableView.jsx'
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'
import { Link } from 'react-router-dom'
import QTDeposit from './ui/deposit.jsx'
import QTWithdraw from './ui/withdraw.jsx'
import SearchBox from "./ui/searchBox.jsx"
import Switch from "./ui/switch.jsx"
import MobileHeader from './ui/mobileHeader.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TxDialog from './ui/transaction_dialog.jsx'
import { transferFund } from '../redux/actions/app.jsx'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
  min-height: 100vh;

  .header-row {
    padding:0 20px;
  }

  .tab-row {
    background-color: rgba(52, 62, 68, 0.4);
    height:72px;
    border-top: 1px solid rgba(255,255,255,0.09);
    border-bottom: 1px solid rgba(255,255,255,0.09);

		.tabs {
			font-size: 16px;
			margin-top:auto;

			a {
		    padding:10px 30px;
		    display:inline-block;
		  }

			a.active {
		    border-bottom: solid 1px #fff;
		  }

			a:last-child {
				margin-right:0
			}
		}
  }

  .content {
    margin: auto;
    max-width: 1000px;
    padding-bottom: 40px;
  }

  .table-row {
    margin-top: 40px;
  }

  .public-address-container {
    margin-top: 40px;
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
  
  .deposit-only {
    button {
      background-color: ${globalcss.COLOR_THEME} !important;
      color: #000 !important;
    }
  }

  &.mobile {
    padding: 0;

    .tab-row {
      display: none !important;
    }
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
      margin-top: 20px !important;
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
      background: url("../public/images/menu-arrow-down.svg") no-repeat 100% 50%;
    }

    .table-row .row {
      height: auto;
      padding: 5px 0;
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

const screenWidth = screen.width

class Fund extends Component {

  constructor(props) {
    super(props)
		var selectedTabIndex
		switch (this.props.page) {
			case "wallets":
				selectedTabIndex = 0
				break
			case "history":
				selectedTabIndex = 1
				break
			case "orders":
				selectedTabIndex = 2
				break
			default:
				selectedTabIndex = 0
				break
		}
    this.state = {
      selectedTabIndex: selectedTabIndex,
      dataSource: [],
      page: this.props.page,
      filter: "",
      hideZero: false,
      isMobile: screenWidth <= 992,
      txData: undefined,
      confirmDialog: false,
    }

    this.PublicAddress = this.PublicAddress.bind(this)
  }

  componentDidMount() {
    this.setDataSource(this.props.balance)
  }

	componentWillReceiveProps(nextProps) {
    if (this.props.balance != nextProps.balance) {
      this.setDataSource(nextProps.balance)
    }
  }

  setDataSource(balance) {
    const dataSource = []
      balance.forEach(currency => {
        const data = {
          pairs: window.assets[currency.asset].symbol,
          balance: currency.balance,
          on_orders: "0.00000000",
          usd_value: currency.usd.toLocaleString(navigator.language, {maximumFractionDigits: 2, minimumFractionDigits: 2})
        }
        dataSource.push(data)
      });

      dataSource.push({
        pairs: "Deposit ERC20",
        balance: 0,
        on_orders: 0,
        usd_value: 0
      })
  
      this.setState({
        dataSource: dataSource
      })
  }
  
  handleChange(e) {
		this.setState({filter: e.target.value})
  }
  
  hideZeroBalance(hide) {
    this.setState({hideZero: hide})
  }

  confirmTransaction(data) {
    this.setState({txData: data, confirmDialog: true})
  }

  closeTransaction() {
    this.setState({confirmDialog: false, txData: undefined})
  }

  submitTransfer(data) {
    this.props.dispatch(transferFund(data))
      .then(() => {
        toast.success(`Successfully transfer ${data.amount} ${data.asset} to ${data.destination}.`, {
          position: toast.POSITION.TOP_CENTER
        });
      })
      .catch((e) => {
        // console.log(e)
        toast.error("Unable to transfer. Please make sure the destination account name is correct.", {
          position: toast.POSITION.TOP_CENTER
        });
      })
      .finally(() => {
        this.closeTransaction()
      })
  }

  PublicAddress() {
    return (
      <div className="public-address-container d-flex justify-content-between">
        <div id='public-address'>
          <h3>Your QUANTA Wallet Account</h3>
          <span className="qt-font-light">{this.props.name}</span>
          <a href={"http://testnet.quantadex.com/account/" + this.props.name} target="_blank"><img src="/public/images/external-link-light.svg" /></a>
        </div>
        <div className="est-fund text-right align-self-center">
          <span className="qt-font-extra-small qt-white-62">On-chain custody estimated funds</span>
          <div><span className="qt-font-huge">${this.props.estimated_fund.toLocaleString(navigator.language, {maximumFractionDigits: 4})} </span><span className="currency">USD</span></div>
        </div>
        
      </div>
    )
  }

  ERC20() {
    return (
      <div className="container-fluid erc20">
        <div className="row justify-content-between align-items-center table-body-row">
          <div className="qt-font-extra-small">Deposit ERC20</div>
          <button className="qt-font-base qt-font-semibold" >DEPOSIT</button>
        </div>
      </div>
    )
  }

	render() {
    if (this.props.private_key == null) {
			window.location.assign('/exchange')
    } 
    const tabs = [
      {
        name:'Wallets / Deposit / Transfer',
        url:'wallets'
      },
    ]

    const columnsWallets = [{
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
          label:"WITHDRAW",
          color:"theme unite",
          handleClick: (asset) => {
						return <QTWithdraw asset={asset} onSend={this.confirmTransaction.bind(this)}/>
          },
          disabled: (pairs) => {return false}
        }, {
          label:"DEPOSIT",
          color:"theme unite",
          handleClick: (asset) => {
						return <QTDeposit asset={asset} quantaAddress={this.props.name} />
          },
          disabled: (pairs) => {return false}
        }],
        type: "buttons"
    }]

    var columns = columnsWallets
    
		return (
		<div className={container + " container-fluid" + (this.state.isMobile ? " mobile" : "")}>
      {this.state.isMobile ? 
          <MobileHeader />
        :
        <div className="row header-row">
          <Header />
        </div>
      }
      
      <div className="row tab-row d-flex flex-column align-items-center">
        <div className="tabs">
          {
            tabs.map((tab,index) => {
              return (
                <Link key={index} to={"/exchange/" + tab.url}
                      data-index={index}
                      data-url={tab.url}
                      className={this.state.selectedTabIndex == index ? "active" : ""}
                      onClick={(e) =>{this.setState({selectedTabIndex:e.target.dataset.index,page:e.target.dataset.url})}}>
                 {tab.name}</Link>
              )
            })
          }
        </div>
      </div>
      <div className="content">
        { this.state.page == 'wallets' ? <this.PublicAddress /> : null }
        
        <div className='filter-container d-flex mt-5 align-items-center'>
          <SearchBox placeholder="Search Coin" onChange={this.handleChange.bind(this)} style={{marginRight: "20px"}}/>
          <Switch label="Hide Zero Balances" onToggle={this.hideZeroBalance.bind(this)} />
        </div>
        

        <div className="table-row">
          <QTTableView dataSource={this.state.dataSource.filter(data => data.pairs.toLowerCase().includes(this.state.filter) && 
            (!this.state.hideZero || data.balance > 0))} columns={columns} mobile={this.state.isMobile}/>
          {/* {
            this.state.page == 'wallets' ? <this.ERC20 /> : null
          } */}
        </div>
      </div>
      {this.state.confirmDialog && 
        <TxDialog data={this.state.txData} 
          cancel={() => this.closeTransaction()} 
          submit={() => this.submitTransfer(this.state.txData)} />
      }
      <ToastContainer />
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
    balance: state.app.balance,
    publicKey: state.app.publicKey || "",
    private_key: state.app.private_key,
    estimated_fund: state.app.totalFundValue,
    usd_value: state.app.usd_value,
		name: state.app.name
	});


export default connect(mapStateToProps)(Fund);
