import React from 'react';
import {render} from 'react-dom';
import Exchange from './components/exchange.jsx';
import Fund from './components/fund.jsx';
import Message from './components/message.jsx';
import Leaderboard from './components/leaderboard_full.jsx';
import Landing from './pages/main/landing.jsx'
import Technology from './pages/main/technology.jsx'
import ExportKey from './components/export_key.jsx'
import DiceGame from './pages/games/dice.jsx'

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import reducer from './redux/index.jsx'
import thunk from 'redux-thunk';
import DevTools from './redux/devtools.jsx';
import logger from 'redux-logger'
import { Router, Route, Switch } from 'react-router-dom'

import { injectGlobal } from 'emotion'
import globalcss from './components/global-css.js'
import { createHashHistory, createBrowserHistory } from 'history'
import ReactGA from 'react-ga';
 
ReactGA.initialize(window.isApp ? 'UA-114919036-4': 'UA-114919036-3');
ReactGA.set({ checkProtocolTask: null })

if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  window.hidden = "hidden";
} else if (typeof document.msHidden !== "undefined") {
  window.hidden = "msHidden";
} else if (typeof document.webkitHidden !== "undefined") {
  window.hidden = "webkitHidden";
}

window.addEventListener('keyboardDidShow', function () {
	document.getElementById('app').classList.add("keyboard-show")
});

window.addEventListener('keyboardDidHide', function () {
	document.getElementById('app').classList.remove("keyboard-show")
});

// , applyMiddleware(logger)

injectGlobal`
	@font-face {
	  font-family: "SFCompactTextBold";
	  src: url(${devicePath("public/styles/fonts/SFCompactText-Bold.otf")});
	}
	@font-face {
		font-family: "SFCompactTextRegular";
		src: url(${devicePath("public/styles/fonts/SFCompactText-Regular.otf")});
	}
	@font-face {
		font-family: "SFCompactTextLight";
		src: url(${devicePath("public/styles/fonts/SFCompactText-Light.otf")});
	}
	@font-face {
		font-family: "SFCompactTextSemiBold";
		src: url(${devicePath("public/styles/fonts/SFCompactText-Semibold.otf")});
	}

	@font-face {
	  font-family: "Multicolore";
	  src: url(${devicePath("public/styles/fonts/Multicolore.otf")});
	}

	* {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	html {
		font-size: 11px;
	}

	body {
		font-family: SFCompactTextRegular;
		color: #ffffff;
		-webkit-font-smoothing: antialiased;
	 	-moz-osx-font-smoothing: grayscale;
	}

	a {
		cursor: pointer;
    text-decoration:none;
    color:white;
	}

  a:focus, a:hover, a:visited, a:link, a:active {
      text-decoration: none;
      color:white;
  }

	input {
		height: 32px;
		text-align: right;
		background-color:transparent;
		border: 1px solid rgba(255,255,255,0.27);
		color: white;
	}

	textarea:focus, input:focus{
	    outline: none;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
	    /* display: none; <- Crashes Chrome on hover */
	    -webkit-appearance: none;
			margin:8px;
	}

	button {
		border:none;
		padding:0;
	}

	button:focus {
		outline:none !important;
	}

	.qt-number-base {
		font-size: ${globalcss.FONT_BASE};
		letter-spacing: 0.4px;
	}

	.qt-number-small {
		font-size: ${globalcss.FONT_SMALL};
		letter-spacing: 0.5px;
	}

	.qt-number-huge {
		font-size: ${globalcss.FONT_HUGE};
		letter-spacing: 0.8px;
	}

	.qt-color-red {
		color: ${globalcss.COLOR_RED} !important;
	}

	.qt-color-theme {
		color: ${globalcss.COLOR_THEME} !important;
	}

	.qt-font-huge {
		font-size: ${globalcss.FONT_HUGE};
	}

	.qt-font-normal {
		font-size: ${globalcss.FONT_NORMAL}
	}

	.qt-font-small {
		font-size: ${globalcss.FONT_SMALL};
	}

	.qt-font-extra-small {
		font-size: ${globalcss.FONT_EXTRA_SMALL};
	}

	.qt-font-tiny {
		font-size: ${globalcss.FONT_TINY};
	}

	.qt-font-base {
		font-size: ${globalcss.FONT_BASE};
	}

	.qt-font-light {
		font-family: SFCompactTextLight;
	}

	.qt-font-regular {
		font-family: SFCompactTextRegular;
	}

	.qt-font-semibold {
		font-family: SFCompactTextSemiBold;
	}

	.qt-font-bold {
		font-family: SFCompactTextBold;
	}

	.qt-opacity-half {
		opacity: ${globalcss.OPACITY_HALF}
	}

	.qt-opacity-64 {
		opacity: ${globalcss.OPACITY_64}
	}

	.qt-white-62 {
		color: ${globalcss.COLOR_WHITE_62}
	}

	.qt-white-27 {
		color: ${globalcss.COLOR_WHITE_27}
	}

	.qt-cursor-pointer {
		cursor:pointer;
	}

	.qt-menu-item-selected {
		color: rgba(255,255,255,1) !important;
		border-bottom: 2px solid rgba(255,255,255,1) !important;
	}

	.cursor-pointer {
		cursor: pointer;
	}

	.keyboard-show {
		.exchange-bottom {
			display: none !important;
		}

		.mobile-content {
			margin-bottom: 0;
		}
	}
	
	.blue-btn {
		-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;
		-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;
		box-shadow:inset 0px 1px 0px 0px #54a3f7;
		background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));
		background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);
		background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);
		background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);
		background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);
		background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);
		filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);
		background-color:#007dc1;
		-moz-border-radius:3px;
		-webkit-border-radius:3px;
		border-radius:3px;
		border:1px solid #124d77;
		display:inline-block;
		cursor:pointer;
		color:#ffffff;
		font-family:Arial;
		font-size:13px;
		padding:6px 24px;
		text-decoration:none;
		text-shadow:0px 1px 0px #154682;
	}
	.blue-btn:hover {
		background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #0061a7), color-stop(1, #007dc1));
		background:-moz-linear-gradient(top, #0061a7 5%, #007dc1 100%);
		background:-webkit-linear-gradient(top, #0061a7 5%, #007dc1 100%);
		background:-o-linear-gradient(top, #0061a7 5%, #007dc1 100%);
		background:-ms-linear-gradient(top, #0061a7 5%, #007dc1 100%);
		background:linear-gradient(to bottom, #0061a7 5%, #007dc1 100%);
		filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#0061a7', endColorstr='#007dc1',GradientType=0);
		background-color:#0061a7;
	}
	.blue-btn:active {
		position:relative;
		top:1px;
	}	

	.grecaptcha-badge {
		display: none;
	}

	.__react_component_tooltip {
		white-space: normal !important;
	}
`

const store = createStore(reducer, compose(applyMiddleware(thunk)))

var history
if (window.isApp) {
	history = createHashHistory()
} else {
	history = createBrowserHistory()
}

history.listen((location, action) => {
	//console.log("history change ", location.pathname);
	ReactGA.set({ page: location.pathname });
	ReactGA.pageview(location.pathname);
});

if (/Android|iPad|iPhone|iPod/i.test(navigator.userAgent)) {
	$(document).on('focus', 'input, textarea', function() {
		document.getElementById('app').classList.add('kb-opened')
	});

	$(document).on('blur', 'input, textarea', function() {
		document.getElementById('app').classList.remove('kb-opened')
	});
}

class Container extends React.Component {
  render () {
    return (
    <Provider store={store}>
		<Router history={history}>
			<Switch>
				<Route exact path="/" component={window.isApp ? Exchange : Landing} />
				<Route exact path="/technology" component={Technology} />
				<Route exact path="/:net" component={Exchange} />
				<Route exact path="/:net/dice" component={DiceGame} />
				<Route exact path="/:net/exchange" component={Exchange} />
				<Route exact path="/:net/exchange/:ticker" component={Exchange} />
				<Route exact path="/:net/wallets" component={Fund} />
				<Route exact path="/:net/message" component={Message} />
				<Route exact path="/:net/export_key" component={ExportKey} />
				<Route exact path="/:net/leaderboard" component={Leaderboard} />

				<Route component={window.isApp ? Exchange : Landing}/>
			</Switch>
      	</Router>
    </Provider>);
  }
}


render(<Container/>, document.getElementById('app'));
