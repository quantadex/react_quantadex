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

const borderWidth = (props) => {
  return css`
    border-width: ${props.borderWidth}px;
  `
}

const Container = styled('button')`
	${width};
  ${height};
  ${borderWidth}
  border-style: solid;
  border-radius: 2px;
  cursor: pointer;

  &.theme {
    background-color: ${globalcss.COLOR_THEME};
    border-color: ${globalcss.COLOR_THEME};
    color: white;
  }
  &.red {
    background-color: ${globalcss.COLOR_RED};
    border-color: ${globalcss.COLOR_RED};
    color: white;
  }
  &.grey {
    background-color: ${globalcss.COLOR_WHITE_27};
    border-color: ${globalcss.COLOR_WHITE_27};
    color: ${globalcss.COLOR_WHITE_62};
  }

  &.inverse {
    background-color:transparent;
  }

  &.theme.inverse:hover {
    background-color: ${globalcss.COLOR_THEME};
  }

  &.red.inverse:hover {
    background-color: ${globalcss.COLOR_RED};
  }

  &.grey.inverse:hover {
    color: ${globalcss.COLOR_THEME};
    border-color: ${globalcss.COLOR_THEME};
  }

  &.theme.unite {
    background-color: transparent;
    color: ${globalcss.COLOR_THEME};

    &:hover {
      background-color: ${globalcss.COLOR_THEME_LIGHT};
    }
  }

  &.red.unite {
    background-color: transparent;
    color: ${globalcss.COLOR_RED};
  }

  &.fluid {
    width: 100% !important;
  }
`

export default class QTButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container width={this.props.width}
                 height={this.props.height}
                 borderWidth={this.props.borderWidth}
                 className={this.props.className}
                 onClick={this.props.onClick}>
                 {this.props.label}</Container>
    );
  }
}

QTButton.propTypes = {
};
