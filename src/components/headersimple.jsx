import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'

import { Link } from 'react-router-dom'
import HamburgerMenu from './ui/hamburger_menu.jsx'

const container = css`
	height: 52px;
  width:100%;
  position:relative;

  .back-link {
    position:absolute;
    left:0;
    top: 50%;
    transform: translateY(-50%);
  }

  .back-link:before {
    background-image: url('/public/images/menu-arrow-left.svg');
    width:6px;
    height:10px;
    background-size: 6px 10px;
    display:inline-block;
    margin-right:5px;
    vertical-align:middle;
    content:"";
  }

  .menu {
    position:absolute;
    right:0;
    top: 50%;
    transform: translateY(-50%);
		display:flex;

		.name {
			margin-right:10px;
		}
  }

  .logo {
    width:119px;
    height:19px;
    background-image: url("/public/images/group-4.svg");
    background-size:cover;
    position:absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
`;

class Header extends Component {
	render() {
		return (
			<div className={container + " qt-font-small"}>
        <Link to="/exchange" className="back-link">Back to Exchange</Link>

        <a href="/" className="logo"></a>
				<div className="menu">
					<span className="name">{this.props.name}</span>
					<HamburgerMenu />
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
		currentTicker: state.app.currentTicker,
    currentPrice: state.app.currentPrice,
    name: state.app.name
	});

export default connect(mapStateToProps)(Header);
