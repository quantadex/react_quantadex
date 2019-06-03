import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'

import { Link } from 'react-router-dom'
import HamburgerMenu from './ui/hamburger_menu.jsx'
import Connect, { ConnectDialog } from './connect.jsx';

const container = css`
	height: 52px;
  width:100%;

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
  }
`;

class Header extends Component {
	render() {
    const { network, currentTicker, name, connectDialog, dispatch } = this.props
		return (
      <React.Fragment>
        <div className={container + " qt-font-small d-flex justify-content-between align-items-center"}>
          <Link to={"/" + network + "/exchange/" + (currentTicker ? currentTicker.replace("/", "_") : "")} className="back-link">Back to Exchange</Link>

          <Link to={"/" + network + "/exchange/" + (currentTicker ? currentTicker.replace("/", "_") : "")} className="logo"></Link>
            <div className="menu">
              <span className="name mr-3">{name}</span>
              <Connect type="lock" />
              {name ?
                <HamburgerMenu />
                : null
              }
            </div>
          
        </div>
        { connectDialog ? 
					<ConnectDialog default={connectDialog} 
						network={network} 
						dispatch={dispatch}/> 
					: null
				}
      </React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
		currentTicker: state.app.currentTicker,
    name: state.app.name,
    network: state.app.network,
    connectDialog: state.app.ui.connectDialog
	});

export default connect(mapStateToProps)(Header);
