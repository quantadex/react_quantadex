import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'
import HamburgerMenu from './ui/hamburger_menu.jsx'

const container = css`
	padding: 0 20px;
	min-width: 180px;
	align-self: center;

	.row {
		margin: 0;
	}

	.name {
		margin-right:10px;
		max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
	}
`;

class Menu extends Component {
  render() {
    return (
      <div className={container}  style={this.props.style}>
				<div className="row qt-font-bold qt-font-small justify-content-end">
					<span className="name">{this.props.name}</span>
					<HamburgerMenu />
				</div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  	// bids: state.app.tradeBook.bids,
  	// asks: state.app.tradeBook.asks,
		// currentPrice: state.app.currentPrice,
		name: state.app.name
	});

export default connect(mapStateToProps)(Menu);
