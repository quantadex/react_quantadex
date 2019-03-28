import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'

import { Link } from 'react-router-dom'
import HamburgerMenu from './ui/hamburger_menu.jsx'
import Lock from './ui/account_lock.jsx'
import ConnectDialog from './connect.jsx';

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
    background-image: url(${devicePath("public/images/menu-arrow-left.svg")});
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
    background-image: url(${devicePath("public/images/group-4.svg")});
    background-size:cover;
    position:absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
`;

class Header extends Component {
  handleConnectDialog() {
		setTimeout(() => {
			document.getElementById("connect-dialog").style.display = "flex"
		}, 0)
  }
  
	render() {
		return (
      <React.Fragment>
			<div className={container + " qt-font-small"}>
        <Link to={"/" + this.props.network + "/exchange/" + (this.props.currentTicker ? this.props.currentTicker.replace("/", "_") : "")} className="back-link">Back to Exchange</Link>

        <Link to={"/" + this.props.network + "/exchange/" + (this.props.currentTicker ? this.props.currentTicker.replace("/", "_") : "")} className="logo"></Link>
				<div className="menu">
					<span className="name mr-3">{this.props.name}</span>
					<Lock unlock={() => this.handleConnectDialog()} />
					<HamburgerMenu />
				</div>
			</div>
      {this.props.private_key ? null : <ConnectDialog default="connect" />}
      </React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
		currentTicker: state.app.currentTicker,
    currentPrice: state.app.currentPrice,
    name: state.app.name,
    network: state.app.network
	});

export default connect(mapStateToProps)(Header);
