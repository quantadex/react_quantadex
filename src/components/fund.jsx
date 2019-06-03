import React, { Component } from 'react';
import Header from './headersimple.jsx';
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import { ToastContainer } from 'react-toastify';
import {switchTicker, updateUserData} from "../redux/actions/app.jsx";
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

    this.eventUpdate = this.eventUpdate.bind(this)
  }

  componentDidMount() {
    const { match , dispatch } = this.props
    if (!window.markets && !window.isApp) {
			const default_ticker = match && match.params.net == "testnet" ? "ETH/USD" : 'ETH/BTC'
			dispatch(switchTicker(default_ticker));
    } 
    
		document.addEventListener('mouseenter', this.eventUpdate, false)
	}

	componentWillUnmount() {
		document.removeEventListener('mouseenter', this.eventUpdate, false)
  }
  
  componentWillReceiveProps(nextProps) {
    const { publicKey, match, history, currentTicker } = nextProps
    if (!publicKey) history.push('/' + (match.params.net == "testnet" ? "testnet" : "mainnet") + '/exchange/' + currentTicker.replace("/", "_"))
  }
	
	eventUpdate() {
		const { currentTicker, dispatch } = this.props
    if (currentTicker) dispatch(switchTicker(currentTicker))
		dispatch(updateUserData())
	}

  handleSwitch(index) {
		this.setState({selectedTabIndex: index})
	}

	render() {
    const { isMobile, currentTicker, name, mobile_nav } = this.props

    if (!currentTicker && !window.markets) {
      return <div className={container + " container-fluid" + (isMobile ? " mobile" : "")}></div>
    }

    const tabs = {
			names: ['Wallets', 'Vesting', 'Crosschain History', "Referral"],
			selectedTabIndex: 0,
    }
    const content = [<Wallets mobile_nav={mobile_nav} />, <Vesting />, <CrosschainHistory user={name} />, <Referral />]
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
