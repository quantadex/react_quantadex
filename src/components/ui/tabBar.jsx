import React, {PropTypes} from 'react';
import styled, { css } from 'react-emotion'
import globalcss from '../global-css.js'

const itemWidth = (props) => {
  return css`
    width:${props.width}px;
  `
}

const gutterWidth = (props) => {
  return css`
    margin-left:${props.gutter}px;
  `
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
      border-bottom: solid 1px rgba(255,255,255,0.19);
      color: rgba(255,255,255,0.5);

      &.selected {
        border-bottom: solid 2px white;
        color:white;
      }
    }

  }

  &.even-width {

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
    return (
      <Container
        className={this.props.className}
        number={this.props.tabs.names.length}
        width={this.props.width}
        gutter={this.props.gutter}
        >
        {
          this.props.tabs.names.map((tab,index) => {
            return (
                <div
                  key={tab}
                  data-index={index}
                  className={(this.state.selectedTabIndex == index ? "selected" : "") + " item"}
                  onClick={(e) => {this.setState({selectedTabIndex:e.target.dataset.index})}}>
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
