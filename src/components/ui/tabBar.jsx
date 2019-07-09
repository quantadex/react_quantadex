import React, {PropTypes} from 'react';
import styled, { css } from 'react-emotion'
import globalcss from '../global-css.js'

// const itemWidth = (props) => {
//   return css`
//     width:${props.width}px;
//   `
// }

// const gutterWidth = (props) => {
//   return css`
//     margin-left:${props.gutter}px;
//   `
// }

const itemWidth = (props) => {
  return css`
    width:${props.width}px;
  `
}

const gutterWidth = (props) => {
  return css`
    margin-left:0;
  `
}

const color = (props) => {
  return props.color || "255,255,255"
}

const Container = styled('div')`


  &.fluid {
    width: 100%;
  }

  &.static {
    .item ~ .item {
      ${gutterWidth}
    }
  }

  &.small {
    font-size: 12px;
  }

  &.medium {
    font-size: 13px;
  }

  &.large {
    font-size: 16px;
  }

  .item {
    cursor:pointer;
  }

  &.block {
    background-color: rgba(0,0,0,0.26);

    .item {
      min-width:60px;
      padding:7px 7px;

      &.selected {
        color: white;
    		background-color: #22282c;
      }
    }
  }

  &.underline {
    .item {
      padding:4px 0;
      text-align: center;
      border-bottom: solid 1px rgba(${color},0.19);
      color: rgba(${color},0.5);

      &.selected {
        border-bottom: solid 2px rgba(${color},1);
        color:rgba(${color},1);
      }
    }

  }

  &.button {
    .item {
      padding:4px 0;
      margin-right: 10px;
      text-align: center;
      border: 2px solid #4a4a4a;
      border-radius: 20px;
      color: #ddd;

      &.selected {
        border: solid 2px #50b3b7;
        color:white;
      }
    }

  }

  &.even-width {

    .item {
      width:100%;
    }
  }
  &.set-width {

    .item {
      ${itemWidth};
    }
  }
`

export default class QTTabBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTabIndex:this.props.tabs.selectedTabIndex,
    }
  }

  render() {
    const { className, tabs, gutter, color, width, switchTab, selectedTabIndex, disabled } = this.props

    return (
      <Container
        className={className}
        number={tabs.names.length}
        gutter={gutter}
        color={color}
        >
        {
          tabs.names.map((tab,index) => {
            return (
                <div
                  key={tab}
                  data-index={index}
                  style={{width: width}}
                  className={(this.state.selectedTabIndex == index ? "selected" : "") + " item"}
                  onClick={(e) => {
                    if (disabled && disabled.includes(e.target.dataset.index)) return
                    this.setState({selectedTabIndex: e.target.dataset.index})
                    switchTab(e.target.dataset.index, this.state.selectedTabIndex)
                  }}>
                  {tab}
                </div>
            )
          })
        }
      </Container>
    );
  }
}

QTTabBar.defaultProps = {

}

QTTabBar.propTypes = {
};
