import React, { Component } from 'react';

import ExchangeDesktop from './exchange_desktop.jsx'
import ExchangeMobile from './exchange_mobile.jsx'

import {switchTicker} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

class Exchange extends Component {
	componentDidMount() {
		let ticker = this.props.currentTicker
		if (this.props.location.hash.split('/').length == 2) {
			ticker = this.props.location.hash.replace('#', '')
		}
		this.props.dispatch(switchTicker(ticker));
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
