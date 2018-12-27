import React from 'react';
import {render} from 'react-dom';
import Exchange from './components/exchange.jsx';
import Fund from './components/fund.jsx';
import Login, {GenerateKey} from './pages/login.jsx';

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import reducer from './redux/index.jsx'
import thunk from 'redux-thunk';
import DevTools from './redux/devtools.jsx';
import logger from 'redux-logger'
import { Router, Route, Switch,withRouter } from 'react-router-dom'

import { injectGlobal } from 'emotion'
import globalcss from './components/global-css.js'
import createHistory from 'history/createBrowserHistory'
import ReactGA from 'react-ga';

ReactGA.initialize('UA-114919036-3');

// , applyMiddleware(logger)

injectGlobal`
	@font-face {
	  font-family: "SFCompactTextBold";
	  src: url("/public/styles/fonts/SFCompactText-Bold.otf");
	}
	@font-face {
		font-family: "SFCompactTextRegular";
		src: url("/public/styles/fonts/SFCompactText-Regular.otf");
	}
	@font-face {
		font-family: "SFCompactTextLight";
		src: url("/public/styles/fonts/SFCompactText-Light.otf");
	}
	@font-face {
		font-family: "SFCompactTextSemiBold";
		src: url("/public/styles/fonts/SFCompactText-Semibold.otf");
	}

	@font-face {
	  font-family: "Multicolore";
	  src: url("/public/styles/fonts/Multicolore.otf");
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

	span {
		pointer-events: none;
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

	.loader {
		border: 3px solid rgba(255,255,255,0.5);
		border-radius: 50%;
		border-top: 3px solid #fff;
		width: 20px;
		height: 20px;
		margin: auto
		-webkit-animation: spin 2s linear infinite;
		animation: spin 2s linear infinite;
	}
		
	@-webkit-keyframes spin {
		0% { -webkit-transform: rotate(0deg); }
		100% { -webkit-transform: rotate(360deg); }
	}
		
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

`

const store = createStore(reducer, compose(applyMiddleware(thunk)))

const FundPage = (page,props) => {
	return (
		<Fund
			{...props}
			page={page}
		/>
	)
}

const history = createHistory()
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
          <Route exact path="/exchange" component={Exchange} />
          <Route path="/exchange/wallets" render={FundPage.bind(this,"wallets")} />
          <Route path="/exchange/history" render={FundPage.bind(this,"history")} />
          <Route path="/exchange/orders" render={FundPage.bind(this,"orders")} />
          <Route exact path="/login" component={Login} />
		  		<Route exact path="/keygen" component={GenerateKey} />
        </Switch>
      </Router>
    </Provider>);
  }
}


render(<Container/>, document.getElementById('app'));
