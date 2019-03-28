import React, {PropTypes} from 'react';
import { css } from 'emotion'
import globalcss from '../global-css.js'
import CONFIG from '../../config.js';

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
    if (this.state.selectedIndex == index) {
      this.setState({selectedIndex: null})
    } else {
      this.setState({selectedIndex: index})
    }
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


  render() {
    if (this.state.sort !== null) {
      if (this.state.reverse) {
        this.props.dataSource.sort((a,b) => {
          return a[this.state.sort].localeCompare(b[this.state.sort])
        })
      } else {
        this.props.dataSource.sort((a,b) => {

          return b[this.state.sort].localeCompare(a[this.state.sort])
        })
      }
    }

    const ERC20Label = "Deposit New ERC20"
    return (
      <div className={container + " container-fluid"}>
        <div className="row justify-content-between align-items-center">
          {
              this.state.columns.map((col, index) => {
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
          this.props.dataSource.map((e,index) => {
            return (
              <div key={index}>
                <div id={index} className={"row justify-content-between align-items-center table-body-row" + (this.state.selectedIndex == index ? " active" : "")}  onClick={() => this.handleClick(index)}>
                  {
                    this.state.columns.map((col, i) => {
                      if (col.type == "buttons") {

                        const new_css = css`
                          width:${col.buttons.length * 96 - 16}px;

                        `

                        return (
                          <div key={index + '-' + i} className={new_css+" d-flex  action-btn " + (e.pairs == ERC20Label ? "justify-content-end" : "justify-content-between")}>
                            {
                              col.buttons.map((btn) => {
                                if((e.pairs !== ERC20Label && !CONFIG.getEnv().CROSSCHAIN_COINS.includes(e.pairs) && e.pairs.split("0X").length !== 2) && btn.label == "DEPOSIT" || e.pairs == ERC20Label && btn.label == "WITHDRAW") { 
                                  return null
                                 }
                                return (
                                  <QTButton
                                    key={btn.label}
                                    disabled={btn.disabled()}
                                    onClick={() => this.toggleModal(index,btn.handleClick(e.pairs != ERC20Label ? e.pairs : "ERC20", this.toggleModal.bind(this, index, btn.handleClick(e.pairs != ERC20Label ? e.pairs : "ERC20"))))}
                                    className={btn.color + " qt-font-base qt-font-semibold"}
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
                          <span key={index + '-' + i} className={new_css + " qt-font-extra-small text-nowrap " + (this.props.mobile ? col.key : "")}>{e[col.key]}</span>
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
                          <span key={index + '-' + i} className={new_css + " qt-font-extra-small " + (this.props.mobile ? col.key : "")}>{e[col.key].toLocaleString(navigator.language, {maximumFractionDigits: 8})}</span>
                        )
                      } else if (col.type == "symbol") {
                        const new_css = css`width:${col.width}px;text-align:left;`
                        return (
                          <span key={index + '-' + i} className={new_css + " qt-font-extra-small text-nowrap " + (this.props.mobile ? col.key : "")}>
                              <SymbolToken name={e[col.key]} />
                          </span>
                        )
                      }
                    })
                  }
                </div>
                {
                  this.state.appendedUI.index == index
                  ? this.state.appendedUI.block
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
