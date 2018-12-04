import React, {PropTypes} from 'react';
import styled, { css } from 'react-emotion'
import globalcss from '../global-css'

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

  tbody tr {
    cursor:pointer;

    &:hover {
      background-color: rgba(52, 62, 68,0.83);
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

  td.red {
    color: ${globalcss.COLOR_RED};
  }

  td.white {
    color: white;
  }

  td.theme {
    color: ${globalcss.COLOR_THEME};
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

`

export default class QTTableViewSimple extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <table className={container}>

        <thead className={this.props.HideHeader ? "hidden" : ""}><tr>
          {
            this.props.columns.map((col) => {
              return <th className={col.float}>{col.name}</th>
            })
          }
        </tr></thead>
        <tbody>
        {
          this.props.dataSource.map((row) => {
            return (
              <tr>
                {
                  this.props.columns.map((col) => {
                    if (col.type == "icon") {
                      return (
                        <td><img
                          src={row[col.key] ? col.favoritedIconUrl : col.unfavoritedIconUrl}
                          width="10"
                          height="10"
                          onClick={() => {
                            this.props.dispatch(col.handleClick(row.pair))
                          }} />
                        </td>
                      )
                    }
                    return (
                      <td
                        className={[col.float,col.color(row[col.key]),col.fontWeight,col.fontSize].join(" ")}>
                        {row[col.key]}
                      </td>
                    )
                  })
                }
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
