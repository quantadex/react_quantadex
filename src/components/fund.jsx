import React, { Component } from 'react';
import Header from './headersimple.jsx';
import QTTableView from './ui/tableView.jsx'
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'
import { Link } from 'react-router-dom'
import QTDeposit from './ui/deposit.jsx'
import QTWithdraw from './ui/withdraw.jsx'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
  padding-bottom:500px;

  .header-row {
    padding:0 20px;
  }

  .tab-row {
    background-color: rgba(52, 62, 68, 0.4);
    height:72px;

		.tabs {
			font-size: 16px;
			margin-top:auto;

			a {
		    padding:10px 2px;
		    margin-right: 40px;
		    display:inline-block;
		  }

			a.active {
		    border-bottom: solid 1px #2ed4cf;
		  }

			a:last-child {
				margin-right:0
			}
		}
  }

  .table-row {
    padding: 40px 128px;
  }

`;

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
      page: this.props.page
    }

  }

	componentWillReceiveProps(nextProps) {
		var selectedTabIndex
		switch (nextProps.page) {
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
		this.setState({
			page:nextProps.page,
			selectedTabIndex:selectedTabIndex,
		})
	}

	render() {
    const tabs = [
      {
        name:'Wallets / Deposit / Withdraw',
        url:'wallets'
      },
      {
        name:'Fund History',
        url:'history'
      },
      {
        name:'Orders',
        url:'orders'
      }
    ]

    const dataSourceWallets = [{
      coin: "BTC",
      name: "Bitcoin",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "CHAT",
      name: "ChatCoin",
      balance: "0.97200000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BQX",
      name: "ETHOS",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "AMB",
      name: "Amber",
      balance: "0.97200000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "SNGLS",
      name: "SingularDTV",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "SNT",
      name: "Basic Attention Token",
      balance: "0.97200000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BXC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    },{
      coin: "BTC",
      name: "Bitcoin X",
      balance: "519.55190000",
      on_orders: "0.00000000",
      btc_value: "0.00000000"
    }]

    const columnsWallets = [{
        title: "COIN",
        key: "coin",
        type: "string",
        width:"80"
    }, {
        title: "Name",
        key: "name",
        type: "string",
        width:"150"
    }, {
        title: "TOTAL BALANCE(BXC)",
        key: "balance",
        type: "number",
        width:"125"
    }, {
        title: "ON ORDERS",
        key: "on_orders",
        type: "number",
        width:"90"
    }, {
        title: "BTC VALUE",
        key: "btc_value",
        type: "string",
        width:"90"
    }, {
        buttons: [{
          label:"DEPOSIT",
          color:"theme unite",
          handleClick: () => {
						return <QTDeposit />
					}
        }, {
          label:"WITHDRAW",
          color:"theme unite",
          handleClick: () => {
						return <QTWithdraw />
          }
        }],
        type: "buttons"
    }]

    const dataSourceHistory = [
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Pending"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Withdraw",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Pending"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Withdraw",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Pending"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Withdraw",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      }
    ]

    const columnsHistory = [
      {
          title: "COIN",
          key: "coin",
          type: "string",
          width:"80"
      },
      {
          title: "NAME",
          key: "name",
          type: "string",
          width:"150"
      },
      {
          title: "TYPE",
          key: "type",
          type: "coloredString",
          colors: {
            Withdraw:globalcss.COLOR_RED,
            Deposit:globalcss.COLOR_THEME
          },
          width:"66"
      },
      {
          title: "AMOUNT",
          key: "amount",
          type: "number",
          width:"84"
      },
      {
          title: "DATE/TIME",
          key: "datetime",
          type: "string",
          width:"135"
      },
      {
          title: "STATUS",
          key: "status",
          type: "coloredString",
          colors: {
            Complete: "white",
            Pending: globalcss.COLOR_WHITE_27
          },
          width:"66"
      },
    ]

    const dataSourceOrders = [
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"BUY",
        status:"Waiting",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"SELL",
        status:"Filled",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"BUY",
        status:"Filled",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"SELL",
        status:"Waiting",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"BUY",
        status:"Waiting",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"SELL",
        status:"Waiting",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"BUY",
        status:"Filled",
        datetime:"12 Jan, 12:34:15"
      },
    ]

    const columnsOrders = [
      {
          title: "PAIR",
          key: "pair",
          type: "string",
          width:"64"
      },
      {
          title: "STOP LOSS",
          key: "stoploss",
          type: "string",
          width:"82"
      },
      {
          title: "LIMIT",
          key: "limit",
          type: "string",
          width:"82"
      },
      {
          title: "AMOUNT BTC",
          key: "amount",
          type: "string",
          width:"82"
      },
      {
          title: "TOTAL BTC",
          key: "total",
          type: "string",
          width:"82"
      },
      {
          title: "TYPE",
          key: "type",
          type: "coloredString",
          colors: {
            BUY:globalcss.COLOR_THEME,
            SELL:globalcss.COLOR_RED
          },
          width:"50"
      },
      {
          title: "STATUS",
          key: "status",
          type: "string",
          width:"52"
      },
      {
          title: "DATE",
          key: "datetime",
          type: "string",
          width:"96"
      },
      {
        buttons: [{
          label:"CANCEL",
          color:"grey inverse",
          handleClick: () => {

          }
        }],
        type: "buttons"
      }
    ]

    var dataSource,columns

    switch (this.state.page) {
      case "wallets":
        dataSource = dataSourceWallets
        columns = columnsWallets
        break
      case "history":
        dataSource = dataSourceHistory
        columns = columnsHistory
        break
      case "orders":
        dataSource = dataSourceOrders
        columns = columnsOrders
        break;
    }

		return (
		<div className={container + " container-fluid"}>
      <div className="row header-row">
        <Header />
      </div>
      <div className="row tab-row d-flex flex-column align-items-center">
        <div className="tabs">
          {
            tabs.map((tab,index) => {
              return (
                <Link to={"/exchange/" + tab.url}
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
      <div className="row table-row">
        <QTTableView dataSource={dataSource} columns={columns} />
      </div>
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
		leftOpen: state.app.ui.leftOpen,
		rightOpen: state.app.ui.rightOpen
	});


export default connect(mapStateToProps)(Fund);
