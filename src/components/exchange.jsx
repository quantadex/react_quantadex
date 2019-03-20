import React, { Component } from 'react';

import ExchangeDesktop from './exchange_desktop.jsx'
import ExchangeMobile from './exchange_mobile.jsx'

import {switchTicker} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

class Exchange extends Component {
	componentDidMount() {
		if (!this.props.match.params.ticker) {
			const default_ticker = window.currentNetwork == "MAINNET" ? 'ETH_TUSD0X0000000000085D4780B73119B644AE5ECD22B376' : 'ETH_USD';
			this.props.history.replace("/exchange/" + default_ticker)
		} else {
			const ticker = this.props.match.params.ticker.replace("_", "/");
			console.log("Loading exchange for=", ticker);
			this.props.dispatch(switchTicker(ticker));
		}
	}
	
	componentDidUpdate(prevProps) {
		if (prevProps.match.params.ticker != this.props.match.params.ticker) {
			this.componentDidMount()
		}
	}

	render() {
		if (this.props.isMobile) {
			return <ExchangeMobile />
		}
		return <ExchangeDesktop />
	}
}

const mapStateToProps = (state) => ({
		isMobile: state.app.isMobile,
		private_key: state.app.private_key,
		currentTicker: state.app.currentTicker,
	});

export default connect(mapStateToProps)(Exchange);
