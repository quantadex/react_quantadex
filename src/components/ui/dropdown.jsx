import React, {PropTypes} from 'react';

import styled, { css } from 'react-emotion'
import globalcss from '../global-css.js'

const width = (props) => {
  return css`
    width: ${props.width}px;
  `
}

const height = (props) => {
  return css`
    height: ${props.height}px;
  `
}

const directionUp = (props) => {
  return css`
    position:absolute;
    left:0;
    bottom:${props.height}px;
  `
}

const directionDown = (props) => {
  return css`
    position:absolute;
    left:0;
    top:${props.height}px;
  `
}

const Container = styled('div')`

  position:relative;

  .qt-dropdown-btn {
    background:transparent;
    cursor:pointer;
    ${width};
    ${height};
    color:white;

    &:hover {
      background-color:#22282c;
    }
  }

  &.bordered .qt-dropdown-btn {
    border: solid 1px rgba(255, 255, 255, 0.27);
    font-family: SFCompactTextBold;
  }

  &.icon-before.down .qt-dropdown-btn:before {
    background-image: url(${devicePath("public/images/menu-arrow-down.svg")});
    width:6px;
    height:8px;
    background-size: 6px 10px;
    display:inline-block;
    margin-right:5px;
    vertical-align:middle;
    content:"";
  }

  &.icon-after.down .qt-dropdown-btn:after {
    background-image: url(${devicePath("public/images/menu-arrow-down.svg")});
    width:6px;
    height:8px;
    background-size: 6px 10px;
    display:inline-block;
    margin-left:5px;
    vertical-align:middle;
    content:"";
  }

  .qt-dropdown-menu {
    ${width};
    z-index:9999;
    border: solid 1px #55575A;
  }

  &.bordered.up .qt-dropdown-menu {
    border-bottom:none;
  }

  &.bordered.down .qt-dropdown-menu {
    border-top:none;
  }

  .qt-dropdown-item {
    ${height};
    color: rgba(255,255,255,0.7);
    cursor:pointer;
    font-family: SFCompactTextRegular;
  }

  &.up .qt-dropdown-menu {
    ${directionUp}

    .qt-dropdown-item {
      border-top:solid 1px rgba(255, 255, 255, 0.24);

      &:nth-of-type(1) {
        border-top:none;
      }
    }
  }

  &.down .qt-dropdown-menu {
    ${directionDown}

    .qt-dropdown-item {
      border-bottom:solid 1px rgba(255, 255, 255, 0.24);

      &:nth-last-of-type(1) {
        border-bottom:none;
      }
    }
  }


  &.dark .qt-dropdown-item {
    background-color: #222;
  }

  &.dark .qt-dropdown-item:hover {
    background-color: #333;
  }

  &.light .qt-dropdown-item {
    background-color: #22282c;
  }

`

export default class QTButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen:false,
      value:this.props.value
    }

    this.toggleDropdown = this.toggleDropdown.bind(this)
  }

  toggleDropdown(e) {
    const dropdown = this.refs.dropdown;
    var isClickInside = dropdown.contains(e.target);
    if (isClickInside) {
      this.setState({
        menuOpen:!this.state.menuOpen
      })
    } else {
      this.setState({menuOpen:false})
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.toggleDropdown)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.toggleDropdown)
  }

  updateValue(e) {
    this.setState({value:e.target.dataset.value})
    this.props.onChange(e.target.dataset.value)
  }

  render() {

    return (
      <Container
        width={this.props.width}
        height={this.props.height}
        className={this.props.className}>

        <button ref="dropdown" className="qt-dropdown-btn">{this.state.value}</button>
        <div className={"qt-dropdown-menu flex-column " + (this.state.menuOpen ? "d-flex" : "d-none")}>
          {
            this.props.items.map((item,index) => {
              return (
                <button key={index} className="qt-dropdown-item" data-value={item} onClick={this.updateValue.bind(this)}>{item}</button>
              )
            })
          }
        </div>
      </Container>
    );
  }
}

QTButton.propTypes = {
};
