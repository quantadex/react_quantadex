import React from 'react';
import {render} from 'react-dom';
import Exchange from './components/exchange.jsx';

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import reducer from './redux/index.jsx'
import thunk from 'redux-thunk';
import DevTools from './redux/devtools.jsx';
import logger from 'redux-logger'

// , applyMiddleware(logger)

const store = createStore(reducer, compose(applyMiddleware(thunk)))

class Container extends React.Component {
  
  render () {
    return (
    <Provider store={store}>
      <Exchange/>
    </Provider>);
  }
}

render(<Container/>, document.getElementById('app'));
