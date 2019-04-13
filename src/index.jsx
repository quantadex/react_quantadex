import React from 'react';
import {render} from 'react-dom';
import Exchange from './components/exchange.jsx';
import Fund from './components/fund.jsx';
import Message from './components/message.jsx';
import Leaderboard from './components/leaderboard_full.jsx';

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import reducer from './redux/index.jsx'
import thunk from 'redux-thunk';
import DevTools from './redux/devtools.jsx';
import logger from 'redux-logger'
import { Router, Route, Switch } from 'react-router-dom'

import { injectGlobal } from 'emotion'
import globalcss from './components/global-css.js'
import createHashHistory from 'history/createHashHistory'
import createBrowserHistory from 'history/createBrowserHistory'
import ReactGA from 'react-ga';
 
ReactGA.initialize('UA-114919036-3');

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
`

const store = createStore(reducer, compose(applyMiddleware(thunk)))

// var history
// if (window.isApp) {
// 	history = createHashHistory()
// } else {
	
// }
var history = createBrowserHistory()
history.listen((location, action) => {
	//console.log("history change ", location.pathname);
	ReactGA.set({ page: location.pathname });
	ReactGA.pageview(location.pathname);
});


class Container extends React.Component {
  render () {
    return (
    <Provider store={store}>
				<Router history={history}>
        <Switch>
					<Route exact path="/" component={Exchange} />
					<Route exact path="/:net" component={Exchange} />
					<Route exact path="/:net/exchange" component={Exchange} />
					<Route exact path="/:net/exchange/:ticker" component={Exchange} />
					<Route exact path="/:net/wallets" component={Fund} />
					<Route exact path="/:net/message" component={Message} />
					<Route exact path="/:net/leaderboard" component={Leaderboard} />
        </Switch>
      </Router>
    </Provider>);
  }
}


render(<Container/>, document.getElementById('app'));
