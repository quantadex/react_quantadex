import React, {PropTypes} from 'react';
import CONFIG from '../../config.js'
import styled, { css } from 'react-emotion'
import globalcss from '../global-css'
import QTButton from './button.jsx'

const container = css`
  width:100%;

  thead {
    pointer-events: none;
  }

  thead.hidden {
    opacity: 0;
  }

  tr {
    height:20px;
  }
  td {
    white-space: nowrap;
  }

  tbody tr {
    cursor:pointer;

    &:hover {
      background-color: rgba(52, 62, 68, 0.4);
    }
  }

  th {
    font-size: ${globalcss.FONT_BASE};
    font-family: SFCompactTextRegular;
    color: rgba(255,255,255,0.5);
  }

  th.left, td.left {
    text-align: left;
  }

  th.right, td.right {
    text-align: right;
  }

  th.center, td.center {
    text-align: center;
  }

  td.red {
    color: ${globalcss.COLOR_RED};
  }

  td.white {
    color: white;
  }

  td.theme {
    color: ${globalcss.COLOR_THEME};
    a {
      color: ${globalcss.COLOR_THEME};
    }
  }

  td.white72 {
    color: rgba(255,255,255,0.72);
  }

  td.base {
    font-size: ${globalcss.FONT_BASE}
  }

  td.extra-small {
    font-size: ${globalcss.FONT_EXTRA_SMALL}
  }

  td.light {
    font-family: SFCompactTextLight;
  }

  td.regular {
    font-family: SFCompactTextRegular;
  }

  .perc-bar {
    position: absolute;
    height: 20px;
  }
  .perc-bar.left {
    left: -5px;
  }
  .perc-bar.right {
    right: 5px;
  }

`

export default class QTTableViewSimple extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick(e) {
      this.props.onAction(e)
  }

  formatNumber(n) {
    let num = Number(n)
    if (isNaN(Number(n))) {
      return n
    } else {
      return num.toLocaleString(navigator.language, { maximumFractionDigits: 20 })
    }
  }

  render() {
    return (
      <table className={container}>

        <thead className={this.props.HideHeader ? "hidden" : ""}><tr>
          {
            this.props.columns.map((col, index) => {
              return <th key={index} className={col.float}>{typeof(col.name) === "string" ? col.name : col.name(this.props.ticker)}</th>
            })
          }
        </tr></thead>
        <tbody>
        {
          this.props.dataSource.map((row, index) => {
            return (
              <tr key={row.id ? row.id + index : index}
                onClick={this.props.onAction ? () => this.props.onAction(row) : null}>
                {this.props.columns.map((col, colindex) => {
                    var col_color = row[col.key];
                    if (row.color_key != undefined) {
                      col_color = row.color_key;
                    }
                    if (col.type == "icon") {
                      return (
                        <td key={index + "-" + colindex}><img
                          src={row[col.key] ? col.favoritedIconUrl : col.unfavoritedIconUrl}
                          width="10"
                          height="10"
                          onClick={() => {
                            this.props.dispatch(col.handleClick(row.pair))
                          }} />
                        </td>
                      )
                    }
                    if (col.type == "id") {
                      return (
                        <td key={index + "-" + colindex} className={[col.float,col.color(col_color),col.fontWeight,col.fontSize].join(" ")}>
                          <a href={CONFIG.getEnv().EXPLORER_URL + "/object/" + row[col.key]} target="_blank">{row[col.key]}</a>
                        </td>
                      )
                    }
                    if (col.type == "block") {
                      return (
                        <td key={index + "-" + colindex} className={[col.float,col.color(col_color),col.fontWeight,col.fontSize].join(" ")}>
                          <a href={CONFIG.getEnv().EXPLORER_URL + "/ledgers/" + row[col.key]} target="_blank">{row[col.key]}</a>
                        </td>
                      )
                    }
                    if (col.type == "cancel") {
                      return (
                        <td key={index + "-" + colindex} id={"cancel-" + row.id.replace(/\./g, '-')} className={col.float}>
                            <div className="loader"></div>
                            <QTButton className="grey inverse qt-font-semibold qt-font-base" 
                            borderWidth="1" width="66" height="18" label="CANCEL"
                            onClick={() => {
                              this.props.cancelOrder(row.assets, row.id)
                            }}/>
                        </td>
                        
                      )
                    }
                    
                    return (
                      <td key={index + "-" + colindex}
                        className={[col.float,col.color(col_color),col.fontWeight,col.fontSize].join(" ")}>
                        {this.formatNumber(row[col.key])}
                      </td>
                    )
                  })
                }
                
                {this.props.max ? 
                  <td className={"perc-bar " + this.props.barDir}
                  style={{background: `rgba(${row.color_key != undefined ? (row.color_key == 0 ? "33,224,219" : "255,35,116") : this.props.barColor},${0.05 + Math.round((row.total / this.props.max)*100)/1000})`, 
                          width: `${Math.round((row.total / this.props.max)*100)}%`}}></td> 
                : null}
              </tr>
            )
          })
        }
        </tbody>
      </table>
    );
  }
}

QTTableViewSimple.propTypes = {
};
