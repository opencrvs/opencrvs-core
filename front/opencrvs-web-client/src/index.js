/*
 * @Author: Euan Millar 
 * @Date: 2017-05-25 22:14:06 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-08 17:31:47
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import App from 'containers/App';
import reducer from 'reducers/index';
import thunk from 'redux-thunk';
import styles from 'index.css';

// apply redux thunk middleware for exporting actions
// set up redux devtools for Chrome

const composeEnhancers = typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) :
    compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk),
  // other store enhancers if any
);

const store = createStore(
  reducer, enhancer
);

const rootElement = document.getElementById('root');
/**
 * Logs all actions and states after they are dispatched.
 */


ReactDOM.render(
  <Provider className={styles.root} store={store}>
    <App />
  </Provider>,
  rootElement
);
