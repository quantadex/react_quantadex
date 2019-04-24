import React, {Component} from 'react'
import { connect } from 'react-redux'
import CONFIG from '../config.js'
import { css } from 'emotion'
import SearchBox from "./ui/searchBox.jsx"
import Switch from "./ui/switch.jsx"
import {SymbolToken} from './ui/ticker.jsx'
import Loader from './ui/loader.jsx'
import lodash from 'lodash'

const container = css`
  tr {
    height: 30px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  
  tr:hover {
    background-color: rgba(52,62,68,0.4);
  }
`

class CrosschainHistory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      filter: "",
      hideDeposit: false,
      page: 0,
      loading: false,
    }
  }

  componentDidMount() {
    this.loadHistory()
  }

  loadHistory() {
    this.setState({loading: true})
    const limit = 100
    fetch(CONFIG.getEnv().API_PATH + `/node1/history?user=${this.props.user}&offset=${this.state.page * limit}&limit=${limit}`, { mode: "cors" })
    .then(e => e.json())
    .then(data => {
      const list = this.state.data.concat(data || [])
      this.setState({data: list, page: this.state.page + 1, end: (!data || data.length < limit), loading: false})
    })
  }

  parseDate(t) {
    const date = new Date(t)
    return date.toLocaleString(navigator.language, { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })
  }

  shorten(str) {
		if (str.length > 10) {
			return str.slice(0, 7) + "..."
		}
		return str
  }
  
  handleScroll = lodash.throttle((e) => {
    if (this.state.loading || this.state.end) {
			return
		}
		if (window.scrollY > document.body.scrollHeight - (window.outerHeight + 500)) {
      this.loadHistory()
		}
  }, 200)

  coinURL(coinName, type) {
    const testnet = this.props.network == 'testnet'
    const coin = coinName.toLowerCase()
    switch(coin) {
      case "btc":
        return testnet ? CONFIG.getEnv().BLOCKCYPHER_URL + coin + "-testnet" + type : CONFIG.getEnv().BLOCKCYPHER_URL + coin + type
      case "ltc":
        return testnet ? "https://chain.so" + type + "LTCTEST/" : CONFIG.getEnv().BLOCKCYPHER_URL + coin + type
      case "bch":
        return CONFIG.getEnv().BITCOIN_URL + coin + type
      default:
        return CONFIG.getEnv().ETHERSCAN_URL + type
    }
  }

  render() {
    return (
      <div className={container + " content"  + (this.props.isMobile ? " mobile px-4" : "")} onWheel={this.handleScroll}>
        <div className='filter-container d-flex mt-5 align-items-center'>
          <SearchBox placeholder="Search Coin" onChange={(e) => this.setState({filter: e.target.value})} style={{marginRight: "20px"}}/>
          <Switch label="Hide Deposit" onToggle={() => this.setState({hideDeposit: !this.state.hideDeposit})} />
        </div>
        <div className="table-responsive">
          <table className="w-100 mt-5 text-nowrap">
            <thead>
              <tr className="qt-white-27">
                <th>TYPE</th>
                <th>SOURCE TX</th>
                <th>FROM</th>
                <th>TO TX</th>
                <th>TO</th>
                <th>COIN</th>
                <th className="text-right">AMOUNT</th>
                <th className="text-right">BOUNCED</th>
                <th className="text-right">SUBMIT STATE</th>
                <th className="text-right">DATE</th>
              </tr>
            </thead>
            <tbody className="qt-font-extra-small">
              {this.state.data.filter(item => item.Coin.toLowerCase().includes(this.state.filter.toLowerCase()) && (!this.state.hideDeposit || item.Type !== "deposit") ).map(row => {
                return (
                  <tr key={row.Type + row.Tx}>
                    <td className={"text-uppercase " + (row.Type == "deposit" ? "qt-color-theme" : "qt-color-red")}>{row.Type}</td>
                    <td><a href={(row.Type === "deposit" && !row.IsBounced ? this.coinURL(row.Coin, "/tx/")  : CONFIG.getEnv().EXPLORER_URL + "/ledgers/") + row.Tx.split("_")[0]} title={row.Tx} target="_blank" rel="noopener noreferrer">{this.shorten(row.Tx)}</a></td>
                    <td><a href={(row.Type === "deposit" && !row.IsBounced ? this.coinURL(row.Coin, "/address/") : CONFIG.getEnv().EXPLORER_URL + "/account/") + row.From.split(',')[0]} title={row.From.split(',')[0]} target="_blank" rel="noopener noreferrer">{this.shorten(row.From.split(',')[0])}</a></td>
                    <td><a href={(row.Type === "deposit" || row.IsBounced ? CONFIG.getEnv().EXPLORER_URL + "/ledgers/" : this.coinURL(row.Coin, "/tx/")) + row.SubmitTxHash.split("_")[0]} title={row.SubmitTxHash} target="_blank" rel="noopener noreferrer">{this.shorten(row.SubmitTxHash)}</a></td>
                    <td><a href={(row.Type === "deposit" || row.IsBounced ? CONFIG.getEnv().EXPLORER_URL + "/account/" : this.coinURL(row.Coin, "/address/")) + row.To.split(',')[0]} title={row.To.split(',')[0]} target="_blank" rel="noopener noreferrer">{this.shorten(row.To.split(',')[0])}</a></td>
                    <td><SymbolToken name={row.Coin} /></td>
                    <td className="text-right">{row.Amount / Math.pow(10, row.Type === "withdrawal" ? 5 : (window.assetsBySymbol[row.Coin] ? window.assetsBySymbol[row.Coin].precision : 0))}</td>
                    <td className="text-right text-capitalize">{String(row.IsBounced)}</td>
                    <td className="text-right text-capitalize">{row.SubmitState}</td>
                    <td className="text-right">{this.parseDate(row.SubmitDate)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {this.state.loading ? <Loader size={"50px"} margin={"20px auto"}/> : null}

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isMobile: state.app.isMobile,
  network: state.app.network
});

export default connect(mapStateToProps)(CrosschainHistory)