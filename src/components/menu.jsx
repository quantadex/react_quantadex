import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'
import HamburgerMenu from './ui/hamburger_menu.jsx'
import Connect from './connect.jsx';

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
		position: absolute;
		right: 0;
		.name {
			max-width: 80px;
		}
	}
`;

class Menu extends Component {
  render() {
		const {isMobile, style, name, mobile_nav} = this.props
    return (
      <div className={container + (isMobile ? " mobile" : "")}  style={style}>
				<div className="row qt-font-bold qt-font-small justify-content-end">
					<span className="name mr-3">{name}</span>
					<Connect type="lock" mobile_nav={isMobile ? () => mobile_nav("connect") : null}/>
					{name && <HamburgerMenu mobile_nav={mobile_nav} />}
				</div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
		private_key: state.app.private_key,
		name: state.app.name,
		isMobile: state.app.isMobile
	});

export default connect(mapStateToProps)(Menu);
