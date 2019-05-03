import React, { Component } from 'react';
import Header from './headersimple.jsx';
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import MobileHeader from './ui/mobileHeader.jsx';
import MobileNav from './ui/mobileNav.jsx';
import { ToastContainer } from 'react-toastify';
import {switchTicker} from "../redux/actions/app.jsx";
import 'react-toastify/dist/ReactToastify.css';
import Wallets from './wallets.jsx'
import CrosschainHistory from './crosschain_history.jsx'
import Vesting from './vesting.jsx'
import Referral from './referral.jsx'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
  min-height: 100vh;

  .header-row {
    padding:0 20px;
  }

  .tab-row {
    background-color: rgba(52, 62, 68, 0.4);
    height:72px;
    border-top: 1px solid rgba(255,255,255,0.09);
    border-bottom: 1px solid rgba(255,255,255,0.09);

		.tabs {
			font-size: 16px;
			margin-top:auto;

			a {
		    padding:10px 30px;
		    display:inline-block;
		  }

			a.active {
		    border-bottom: solid 1px #fff;
		  }

			a:last-child {
				margin-right:0
			}
		}
  }

  .content {
    margin: auto;
    margin-top: 40px;
    max-width: 1000px;
    padding-bottom: 40px;
  }

  .table-row {
    margin-top: 40px;
  }

  &.mobile {
    padding: 0;
    background-color: transparent !important;
    min-height: unset;

    .content {
      margin-top: 20px;
    }

    .table-row .row {
      height: auto;
      padding: 5px 0;
    }
  }
`;

class Fund extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedTabIndex: 0,
    }
  }

  handleSwitch(index) {
		this.setState({selectedTabIndex: index})
	}

	render() {
    if (!window.markets && !window.isApp) {
			const default_ticker = this.props.match && this.props.match.params.net == "testnet" ? "ETH/USD" : 'ETH/BTC'
			this.props.dispatch(switchTicker(default_ticker));
    } 
    
    if (!this.props.currentTicker && !window.markets) {
      return <div className={container + " container-fluid" + (this.props.isMobile ? " mobile" : "")}></div>
    }

    const tabs = {
			names: ['Wallets', 'Vesting', 'Crosschain History', "Referral"],
			selectedTabIndex: 0,
    }
    const content = [<Wallets />, <Vesting />, <CrosschainHistory user={this.props.name} />, <Referral />]
    const {isMobile} = this.props
		return (
		<div className={container + " container-fluid" + (isMobile ? " mobile" : "")}>
      {isMobile ? 
          null
        :
        <div className="row header-row">
          <Header />
        </div>
      }
      
      <div className="row tab-row d-flex flex-column align-items-center">
        <div className="tabs">
          <QTTabBar
            className="pad-sides underline fluid even-width qt-font-semibold d-flex"
            width={isMobile || 200}
            tabs = {tabs}
            switchTab = {this.handleSwitch.bind(this)}
          />
        </div>
      </div>
      {content[this.state.selectedTabIndex]}
      <ToastContainer />
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
    private_key: state.app.private_key,
    publicKey: state.app.publicKey,
    name: state.app.name,
    currentTicker: state.app.currentTicker
	});


export default connect(mapStateToProps)(Fund);
