import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import { toast } from 'react-toastify';
import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTButton from './ui/button.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'
import Loader from './ui/loader.jsx'
import Switch from "./ui/switch.jsx"

import {cancelTransaction, loadOrderHistory} from "../redux/actions/app.jsx";
import ReactGA from 'react-ga';
import lodash from 'lodash';


const container = css`
  position: relative;
  height: 260px;
  width: 100%;
  padding: 10px;

  .order-list {
    margin-top: 4px;
    height: 205px;
    overflow: hidden;
    overflow-y: scroll;

    table {
      tr {
        border-bottom: 1px solid #333;
        cursor: default;
      }
      tbody td {
        padding: 4px 0;
      }
    }
  }

  .order-list.inactive {
    display: none;
  }

  .order-list-pairs {
    min-width: 64px;
  }

  .order-list-sloss, .order-list-limit, .order-list-amount, .order-list-total-btc {
    min-width: 82px;
  }

  .order-list-type {
    min-width: 28px;
  }

  .order-list-status {
    min-width: 42px;
  }

  .order-list-date {
    min-width: 96px;
  }

  .order-list-empty {
    width: 66px;
  }

  .order-list-btn {
    width: 66px;
    height:19px;
    line-height:17px;
    color: rgba(255, 255, 255, 0.62);
    border-radius: 2px;
    border: solid 1px #ffffff;
    opacity: 0.27;
    text-align:center;
  }

  .order-list-data {
    height:20px;
    cursor:pointer;

    &:hover {
      border-radius: 2px;
      background-color: rgba(52, 62, 68, 0.4);
    }
  }

  .sticky, thead th {
    position: sticky;
    position: -webkit-sticky;
    background: #23282c;
  }

  .sticky {
    top: 0;
    z-index: 2;
  }
  thead th {
    top: 0;
    z-index: 1;
  }

  .scroll-up {
    position: absolute;
    right: 15px;
    top: 4px;
    background: url(${devicePath("public/images/up-arrow.svg")}) repeat-y 100%;
    height: 18px;
    padding-right: 20px;
    line-height: 20px;
    color: #999;
    font-size: 12px;
    cursor: pointer;
  }

  .empty-list {
    text-align: center;
    font-size: 16px;
    color: #777;
  }
  
  .loader {
    display: none;
    border: 2px solid rgba(255,255,255,0.5);
    border-radius: 50%;
    border-top: 2px solid #fff;
    width: 15px;
    height: 15px;
    float: right;
    margin-right: 28px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
  }
  
  @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
  }
      
  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }

  &.mobile {
    padding: 15px;
    margin: 0;
    
    .sticky, thead th {
      background: #121517;
    }

    .order-list {
      padding: 0;
      height: calc(100vh - 168px);

      .list-row {
        padding: 5px 0;
        border-bottom: 1px solid #333;
      }

      .item-assets {
        width: 50%;
      }
      .item-price {
        width:50%;
      }
      .item-type {
        width: 20%;
        padding-right: 20px;
      }
      .item-status {
        width: 30%;
      }

      .filled-order {
        .item-price {
          width: 30%;
        }
      }

      .item-type-BUY, .item-type-SELL {
        background: url(${devicePath("public/images/menu-arrow-down.svg")}) no-repeat 100% 50%;
      }

      .item-type-BUY {
        color: #2ed4cf;
      }
      .item-type-SELL {
        color: #ff3282;
      }

      .item-details {
        display: none;
        .label {
          color: #777;
          padding-right: 10px;
        }
        .item {
          margin-right: 20px;
        }
        button {
          float: right;
          border: 1px solid #aaa;
          border-radius: 2px;
          color: #aaa;
          background-color: transparent;
          padding: 0 10px;
        }
      }
      .item-details.active {
        display: block;
      }
    }
  }
`;

class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTabIndex: 0,
      hideMarkets: false,
      isFocused: false,
      cancelling: [],
      selectedRow: null,
      loading: false,
      page: 1
    };

    this.OpenOrders = this.OpenOrders.bind(this)
    this.FilledOrders = this.FilledOrders.bind(this)
  }

  handleSwitch(index) {
    this.setState({selectedTabIndex: index})
    document.getElementById("scroll-order-list").scrollTop = 0
  }

  notify_success = (toastId) => toast.update(toastId, {
    render: "Order cancelled",
    type: toast.TYPE.SUCCESS,
    autoClose: 2000,
    position: toast.POSITION.TOP_CENTER,
    pauseOnFocusLoss: false
  });
  notify_failed = (toastId) => toast.update(toastId, {
    render: "Unable to cancel order",
    type: toast.TYPE.ERROR,
    autoClose: 2000,
    position: toast.POSITION.TOP_CENTER,
    pauseOnFocusLoss: false
  });

  handleCancel(market, order) {
    const toastId = toast("CANCELING...", { autoClose: false, position: toast.POSITION.TOP_CENTER });
    if (!this.props.mobile) {
      var id = order.replace(/\./g, '-')
      document.querySelectorAll('#cancel-' + id + ' button')[0].style.display = 'none';
      document.querySelectorAll('#cancel-' + id + ' .loader')[0].style.display = 'block';
    }

    ReactGA.event({
      category: 'CANCEL',
      action: market
    });
    this.props.dispatch(cancelTransaction(market, order))
    .then((e) => {
      if (!this.props.mobile) {
        document.querySelectorAll('#cancel-' + id + ' .loader')[0].style.display = 'none';
      }
      
      this.notify_success(toastId)
    }).catch((e) => {
      if (!this.props.mobile) {
        document.querySelectorAll('#cancel-' + id + ' button')[0].style.display = 'inherit';
        document.querySelectorAll('#cancel-' + id + ' .loader')[0].style.display = 'none';
      }
      this.notify_failed(toastId)
    })
  }

  toggleDetails(id) {
    if (this.state.selectedRow == id) {
      return // this.setState({selectedRow: null})
    } else {
      this.setState({selectedRow: id})
    }
  }

  handleScroll = lodash.throttle((e) => {
    // console.log(this.props)
    if (this.state.loading) {
      return
    }

    if (this.state.selectedTabIndex !== 0) {
      if (e.scrollTop > e.scrollHeight - 300) {
        if (this.state.selectedTabIndex == 1) {
          if (this.props.filledOrders.end) {
            return
          }
          
          const page = this.state.page
          this.setState({loading: true})
          this.props.dispatch(loadOrderHistory(page)).then(() => {
            this.setState({loading: false, page: page + 1})
          })
        }
      }
    }
  }, 200)

  OpenOrders() {
    if (this.props.openOrders.dataSource.length == 0) {
      return <div className="empty-list">You have no active orders</div>
    }

    const dataSource = this.props.openOrders.dataSource.filter(row => !this.state.hideMarkets || row.assets === this.props.currentTicker)
    dataSource.sort((a,b) => (a.id > b.id) ? -1 : ((b.id > a.id) ? 1 : 0))

    if (this.props.mobile) {
      return (
        <div>
          <div className="list-row sticky">
            <div className="d-flex list-item qt-white-27">
              <span className="item-assets">PAIR</span>
              <span className="item-price text-right">PRICE</span>
              <span className="item-type text-right">TYPE</span>
            </div>
          </div>
          {dataSource.map((row) => {
            return (
              <div key={row.id} className="list-row" onClick={() => this.toggleDetails(row.id)}>
                <div className="d-flex list-item">
                  <span className="item-assets">{row.pair}</span>
                  <span className="item-price text-right">{row.price}</span>
                  <span className={"text-right item-type item-type-" + row.type}>{row.type}</span>
                </div>
                <div className={"item-details mt-2" + (this.state.selectedRow == row.id ? " active" : "")}>
                  <span className="item"><span className="label">AMOUNT</span> {row.amount}</span>
                  <span className="item"><span className="label">TOTAL</span> {row.total}</span>
                  <button disabled={!this.props.private_key} 
                    onClick={() => this.handleCancel(row.assets, row.id)}>{!this.props.private_key ? "LOCK" : "CANCEL"}</button>
                </div>
              </div>
            )
          })}
        </div>
      )
    } else {
      return (
        <QTTableViewSimple dataSource={dataSource} 
        columns={this.props.openOrders.columns}
        disabled={!this.props.private_key} cancelOrder={this.handleCancel.bind(this)} />
      )
    }
  }

  FilledOrders() {
    if (this.props.filledOrders.dataSource.length == 0) {
      return <div className="empty-list">You have no recent filled orders in this market</div>
    }

    const dataSource = this.props.filledOrders.dataSource.concat(this.props.filledOrders.dataSource2).filter(row => !this.state.hideMarkets || row.assets === this.props.currentTicker)

    if (this.props.mobile) {
      return (
        <div className="filled-orders">
          <div className="list-row sticky">
            <div className="d-flex list-item qt-white-27">
              <span className="item-assets">PAIR</span>
              <span className="item-price text-right">PRICE</span>
              <span className="item-status text-right">STATUS</span>
              <span className="item-type text-right">TYPE</span>
            </div>
          </div>
          {dataSource.map((row, index) => {
            return (
              <div key={row.id + index} className="list-row" onClick={() => this.toggleDetails(index)}>
                <div className="d-flex list-item">
                  <span className="item-assets">{row.pair}</span>
                  <span className="item-price text-right">{row.price}</span>
                  <span className="item-status text-right">{row.status}</span>
                  <span className={"text-right item-type item-type-" + row.type}>{row.type}</span>
                </div>
                <div className={"item-details mt-2" + (this.state.selectedRow == index ? " active" : "")}>
                  <span className="item"><span className="label">AMOUNT</span> {row.amount}</span>
                  <span className="item"><span className="label">TOTAL</span> {row.total}</span>
                </div>
              </div>
            )
          })}
        </div>
      )
    } else {
      return (
        <QTTableViewSimple dataSource={dataSource} columns={this.props.filledOrders.columns}/>
      )
    }
  }

  render() {
    const { mobile } = this.props
    const tabs = {
      names: ['Open Orders', 'Order History'],
      selectedTabIndex: 0,
    }
    const OrdersList = [<this.OpenOrders />, <this.FilledOrders />]

    return (
      <div className={container + (mobile ? " mobile" : "")}>
      <div className="sticky d-flex align-items-center">
          <QTTabBar
            className={"small static set-width qt-font-bold d-flex justify-content-left " + (mobile ? "underline" : "button")}
            width={120}
            gutter={10}
            tabs = {tabs}
            switchTab = {this.handleSwitch.bind(this)}
          />
          <Switch label="Current Market Only" 
            className={mobile ? "ml-4" : ""}
            active={this.state.hideMarkets} 
            onToggle={() => this.setState({hideMarkets: !this.state.hideMarkets})} />
        </div>
        <section className="order-list no-scroll-bar">
          <div id="scroll-order-list" onScroll={(e) => this.handleScroll(e.target)}>
            {OrdersList[this.state.selectedTabIndex]}
            {this.state.loading && <Loader margin="10px auto"/>}
          </div>
				</section>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
  	bids: state.app.tradeBook.bids,
  	asks: state.app.tradeBook.asks,
		currentPrice: state.app.currentPrice,
    openOrders:state.app.openOrders,
    filledOrders:state.app.filledOrders,
    currentTicker: state.app.currentTicker
	});

export default connect(mapStateToProps)(Orders);
