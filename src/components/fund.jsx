import React, { Component } from 'react';
import CONFIG from '../config.js'
import Header from './headersimple.jsx';
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import MobileHeader from './ui/mobileHeader.jsx';
import MobileNav from './ui/mobileNav.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Wallets from './wallets.jsx'
import CrosschainHistory from './crosschain_history.jsx'
import Vesting from './vesting.jsx'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
  min-height: 100vh;

  .header-row {
    padding:0 20px;
  }

  .mobile-nav {
		position: fixed;
		width: 100%;
		bottom: 0;
		background-color: #23282c;
		z-index: 99;
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

    .tab-row {
      display: none !important;
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
    if (this.props.private_key == null) {
			window.location.assign('/')
    } 

    const tabs = {
			names: ['Wallets', 'Vesting', 'Crosschain History'],
			selectedTabIndex: 0,
    }
    const content = [<Wallets />, <Vesting />, <CrosschainHistory user={this.props.name} />]
    
		return (
		<div className={container + " container-fluid" + (this.props.isMobile ? " mobile" : "")}>
      {this.props.isMobile ? 
          <MobileHeader />
        :
        <div className="row header-row">
          <Header />
        </div>
      }
      
      <div className="row tab-row d-flex flex-column align-items-center">
        <div className="tabs">
          <QTTabBar
            className="pad-sides underline fluid even-width qt-font-semibold d-flex"
            width={200}
            tabs = {tabs}
            switchTab = {this.handleSwitch.bind(this)}
          />
        </div>
      </div>
      {content[this.state.selectedTabIndex]}
        {this.props.isMobile ? 
        <div className="mobile-nav">
          <MobileNav tabs={tabs} selectedTabIndex={this.state.selectedTabIndex} switchTab={this.handleSwitch.bind(this)} /> 
        </div>
          : null
        }
      <ToastContainer />
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
    private_key: state.app.private_key,
		name: state.app.name
	});


export default connect(mapStateToProps)(Fund);
