import React, { Component } from 'react';

import ExchangeDesktop from './exchange_desktop.jsx'
import ExchangeMobile from './exchange_mobile.jsx'

import {switchTicker, initBalance, getMarketQuotes} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

import { css } from 'emotion'
import globalcss from './global-css.js'

import { Link } from 'react-router-dom'

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
	position: relative;

	.exchange-left {
		width:281px;
		padding:22px 20px;
	}

	.exchange-middle {
		padding: 21px 19px;
		flex-grow:1;
		background-color:rgba(17,20,22,1);
		padding-bottom: 0;
	}

	.exchange-right {
		width:300px;
		background-color: rgba(0,0,0,0.26)
	}

	.exchange-bottom {
		bottom: 0;
		background-color: #23282c;
		justify-content: center;
		border-top: 3px solid black;
		z-index: 99;
	}
	
	#tv_chart_container {
		height: calc(100vh - 530px);
		min-height: 370px !important;
		padding-bottom: 20px;
		border-bottom: 1px solid #333;
	}

	.exchange-dashboard {
		border-bottom: solid 1px #121517;
	}

	.no-scroll-bar {
		position: relative;
		overflow: hidden;
	}
	.no-scroll-bar > div {
		height: 100%;
		position: absolute;
		left: 0;
		overflow-y: scroll;
	}
`;

const screenWidth = screen.width

class Exchange extends Component {
	componentDidMount() {
		this.props.dispatch(switchTicker(this.props.currentTicker));
	}



	render() {
		if (screenWidth > 992) {
			return <ExchangeDesktop />
		}
		
		return <ExchangeMobile />
		
	}
}

const mapStateToProps = (state) => ({
		private_key: state.app.private_key,
		currentTicker: state.app.currentTicker,
	});


export default connect(mapStateToProps)(Exchange);
