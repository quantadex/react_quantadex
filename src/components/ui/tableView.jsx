import React, {PropTypes} from 'react';
import { css } from 'emotion'
import globalcss from '../global-css.js'
import CONFIG from '../../config.js';
import { TOGGLE_CONNECT_DIALOG } from '../../redux/actions/app.jsx'
import { Link } from 'react-router-dom'
import QTButton from './button.jsx'
import {SymbolToken} from './ticker.jsx'

const container = css`

  .row {
    height:30px;
    border-bottom: 1px solid rgba(255,255,255,0.07);

    &.hide {
      display:none;
    }
  }

  .theader {
    color: ${globalcss.COLOR_WHITE_62};
    opacity: 0.5;
  }

  .table-body-row: hover {
    border-radius: 2px;
    background-color: rgba(52, 62, 68, 0.4);
  }

  .trade-btn {
    position: relative;
  }

  .markets-list {
    position: absolute;
    display: none;
    background: #22282C;
    padding: 0 10px;
    width: 80px;
    z-index: 1;
    border: 1px solid #1cdad8;

    a {
      color: #fff;
      display: block;
      line-height: 30px;
      border-bottom: 1px solid #444;
      width: 100%;
    }

    a:last-child {
      border: 0;
    }

    a:hover {
      color: #1cdad8;
    }
  }

  .trade-btn:hover .markets-list {
    display: block;
  }

  
`

export default class QTTableView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sort : null,
      reverse : false,
      dataSource : [],
      columns: this.props.columns,
      appendedUI: {
        index: -1,
        block: "",
        name: ""
      },
      selectedIndex: null
    }

  }

  handleClick(index) {
    this.setState({selectedIndex: index})
  }

  sortArr(e) {
    this.setState({
      sort: e.target.dataset.key,
      reverse: !this.state.reverse
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log(nextProps)
  //   this.setState({
  //     dataSource:nextProps.dataSource,
  //     columns:nextProps.columns,
  //     sort : null,
  //     reverse : false,
  //     appendedUI: {
  //       index: -1,
  //       block: "",
  //       name: ""
  //     }
  //   })
  // }

  toggleModal(index,ui) {
    if (ui.type.displayName != this.state.appendedUI.name || this.state.appendedUI.index != index) {
      this.setState({
        appendedUI: {
          index: index,
          block: ui,
          name: ui.type.displayName
        }
      })
    } else {
      this.setState({
        appendedUI: {
          index: -1,
          block: "",
          name: ""
        }
      })
    }
  }

  symbol(market) {
    const pairs = market.split('/')
    return pairs[0].split('0X')[0] + "/" + pairs[1].split('0X')[0]
  }

  openConnect() {
    const { mobile_nav, dispatch } = this.props
        if (mobile_nav) {
            mobile_nav("connect")
        } else {
            dispatch({
                type: TOGGLE_CONNECT_DIALOG,
                data: "connect"
            })
        }
  }

  render() {
    const { sort, reverse, columns, selectedIndex, appendedUI } = this.state
    const { dataSource, mobile, unlocked, network, mobile_nav } = this.props
    const default_markets = window.markets ? Object.keys(window.markets) : []
    const markets = window.marketsHash ? Object.keys(window.marketsHash) : []

    if (sort !== null) {
      if (reverse) {
        dataSource.sort((a,b) => {
          return a[sort].localeCompare(b[sort])
        })
      } else {
        dataSource.sort((a,b) => {
          return b[sort].localeCompare(a[sort])
        })
      }
    }

    const ERC20Label = "Deposit New ERC20"
    return (
      <div className={container + " container-fluid"}>
        <div className="row justify-content-between align-items-center">
          {
              columns.map((col, index) => {
                if (col.type == "buttons") {
                  const new_css = css`width:${col.buttons.length * 96 - 16}px`
                  return (
                    <span key={index} className={new_css}></span>
                  )
                } else if (col.type == "string" || col.type == "symbol" || col.type == "coloredString") {
                  const new_css = css`width:${col.width}px;text-align:left;`
                  return (
                    <div key={index} className={new_css +" theader qt-font-semibold qt-cursor-pointer"} data-key={col.key}>{col.title}</div> // onClick={this.sortArr.bind(this)}>{col.title}</div>
                  )
                } else if (col.type == "number") {
                  const new_css = css`width:${col.width}px;text-align:right;`
                  return (
                    <div key={index} className={new_css +" theader qt-font-semibold qt-cursor-pointer"} data-key={col.key} >{col.title}</div> // onClick={this.sortArr.bind(this)}
                  )
                }
              })
          }
        </div>
        {
          dataSource.map((e,index) => {
            return (
              <div key={index}>
                <div id={index} className={"row justify-content-between align-items-center table-body-row" + (selectedIndex == index ? " active" : "")}  onClick={() => this.handleClick(index)}>
                  {
                    columns.map((col, i) => {
                      if (col.type == "buttons") {

                        const new_css = css`
                          width:${col.buttons.length * 96 - 16}px;

                        `

                        return (
                          <div key={index + '-' + i} className={new_css+" d-flex  action-btn " + (e.pairs == ERC20Label ? "justify-content-end" : "justify-content-between")}>
                            {
                              col.buttons.map((btn) => {
                                if((e.pairs !== ERC20Label && !CONFIG.getEnv().CROSSCHAIN_COINS.includes(e.pairs) && e.pairs.split("0X").length !== 2) && btn.label == "DEPOSIT" || e.pairs == ERC20Label && btn.label == "WITHDRAW" || e.pairs == ERC20Label && btn.label == "TRADE") { 
                                  return null
                                }
                                if(e.pairs !== ERC20Label && btn.label == "TRADE") {
                                  const pair_markets = markets.filter(market => market.includes(e.pairs))
                                  for (let coin of default_markets) {
                                    const token = coin == "TUSD" ? "TUSD0X0000000000085D4780B73119B644AE5ECD22B376" : coin
                                    if (e.pairs !== token && !(pair_markets.includes(e.pairs+ "/" + token) || pair_markets.includes(token + "/" + e.pairs))) {
                                      pair_markets.push(e.pairs+ "/" + token)
                                    }
                                  }
                                  return (
                                    <div className="trade-btn" key={btn.label}>
                                      <QTButton
                                        className={btn.color + " qt-font-base qt-font-semibold"}
                                        borderWidth="1"
                                        width="80"
                                        height="20"
                                        label={btn.label}
                                        color={btn.color}/>
                                        <div className="markets-list text-center">
                                          {pair_markets.map(market => {
                                            return (
                                              <Link key={market} to={`/${network}/exchange/${market.replace("/", "_")}`}
                                                onClick={mobile_nav ? () => mobile_nav(1) : null}
                                              >{this.symbol(market)}</Link>
                                            )
                                          })}
                                        </div>
                                      </div>
                                  )
                                }
                                return (
                                  <QTButton
                                    key={btn.label}
                                    onClick={unlocked ? 
                                      () => this.toggleModal(index,btn.handleClick(e.pairs != ERC20Label ? e.pairs : "ERC20", this.toggleModal.bind(this, index, btn.handleClick(e.pairs != ERC20Label ? e.pairs : "ERC20"))))
                                      : this.openConnect.bind(this)
                                    }
                                    className={btn.color + " qt-font-base qt-font-semibold" + (unlocked ? "" : " locked")}
                                    borderWidth="1"
                                    width="80"
                                    height="20"
                                    label={(e.pairs !== ERC20Label && !CONFIG.getEnv().CROSSCHAIN_COINS.includes(e.pairs) && e.pairs.split("0X").length !== 2) ? "TRANSFER" : btn.label}
                                    color={btn.color}/>
                                )
                              })
                            }
                          </div>
                        )
                      } else if (col.type == "string") {
                        const new_css = css`width:${col.width}px;text-align:left;`
                        return (
                          <span key={index + '-' + i} className={new_css + " qt-font-extra-small text-nowrap " + (mobile ? col.key : "")}>{e[col.key]}</span>
                        )
                      } else if (col.type == "coloredString") {
                        const color = col.colors[e[col.key]]

                        const new_css = css`width:${col.width}px;text-align:left;color:${color}`
                        return (
                          <span key={index + '-' + i} className={new_css + " qt-font-extra-small"}>{e[col.key]}</span>
                        )
                      } else if (col.type == "number") {
                        if (e.pairs == ERC20Label) {
                          return null
                        }
                        const new_css = css`width:${col.width}px;text-align:right;`
                        return (
                          <span key={index + '-' + i} className={new_css + " qt-font-extra-small " + (mobile ? col.key : "")}>{e[col.key].toLocaleString(navigator.language, {maximumFractionDigits: 8})}</span>
                        )
                      } else if (col.type == "symbol") {
                        const new_css = css`width:${col.width}px;text-align:left;`
                        return (
                          <span key={index + '-' + i} className={new_css + " qt-font-extra-small text-nowrap " + (mobile ? col.key : "")}>
                              <SymbolToken name={e[col.key]} />
                          </span>
                        )
                      }
                    })
                  }
                </div>
                {
                  appendedUI.index == index && unlocked
                  ? appendedUI.block
                  : ""
                }
              </div>
            )
          })
        }
      </div>
    );
  }
}

QTTableView.propTypes = {
};
