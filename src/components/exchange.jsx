import React, { Component } from 'react';

import ExchangeDesktop from './exchange_desktop.jsx'
import ExchangeMobile from './exchange_mobile.jsx'

import { switchTicker, updateUserData } from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

class Exchange extends Component {
	componentDidMount() {
		const { match, history, location, dispatch, publicKey, userId } = this.props
		if (!match.params.net || (match.params.net !== "mainnet" && match.params.net !== "testnet")) {
			const default_ticker = 'ETH_BTC';
			history.push("/mainnet/exchange/" + default_ticker + location.search)
		} else if (!match.params.ticker) {
			const default_ticker = match.params.net == "mainnet" ? 'ETH_BTC' : "ETH_USD"
			history.push("/" + match.params.net + "/exchange/" + default_ticker + location.search)
		} else {
			const ticker = match.params.ticker.replace("_", "/");
			dispatch(switchTicker(ticker));
		}

		if (publicKey && userId) {
			dispatch(updateUserData())
		}
	}
	
	componentDidUpdate(prevProps) {
		const { match } = this.props
		if (prevProps.match.params.ticker != match.params.ticker || prevProps.match.params.net != match.params.net) {
			this.componentDidMount()
		}
	}

	render() {
		const { isMobile, location } = this.props
		if (isMobile || location.search.includes("app=true")) {
			return <ExchangeMobile />
		}
		return <ExchangeDesktop />
	}
}

const mapStateToProps = (state) => ({
		isMobile: state.app.isMobile,
		private_key: state.app.private_key,
		publicKey: state.app.publicKey,
		userId: state.app.userId,
		currentTicker: state.app.currentTicker,
	});

export default connect(mapStateToProps)(Exchange);
