import React, { Component } from 'react';

import ExchangeDesktop from './exchange_desktop.jsx'
import ExchangeMobile from './exchange_mobile.jsx'

import {switchTicker} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

class Exchange extends Component {
	componentDidMount() {
		if (!this.props.match.params.ticker) {
			const default_ticker = window.currentNetwork == "MAINNET" ? 'QDEX_ETH' : 'ETH_USD';
			this.props.history.replace("/exchange/" + default_ticker)
		} else {
			this.props.dispatch(switchTicker(this.props.match.params.ticker.replace("_","/")));
		}
	}
	
	componentDidUpdate() {
		this.componentDidMount()
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
