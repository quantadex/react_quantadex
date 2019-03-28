import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'
import HamburgerMenu from './ui/hamburger_menu.jsx'
import Lock from './ui/account_lock.jsx'

const container = css`
	padding: 0 20px;
	min-width: 180px;
	align-self: center;

	.row {
		margin: 0;
	}

	.name {
		max-width: 88px;
		overflow: hidden;
		white-space: nowrap;
    text-overflow: ellipsis;
	}

	&.mobile {
		.name {
			max-width: 80px;
		}
	}
`;

class Menu extends Component {
  render() {
		const {private_key, isMobile, style, name} = this.props
    return (
      <div className={container + (isMobile ? " mobile" : "")}  style={style}>
				<div className="row qt-font-bold qt-font-small justify-content-end">
					<span className="name mr-3">{name}</span>
					<Lock unlock={() => this.props.unlock("connect")} />
					{this.props.name && <HamburgerMenu />}
				</div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
		private_key: state.app.private_key,
		name: state.app.name
	});

export default connect(mapStateToProps)(Menu);
