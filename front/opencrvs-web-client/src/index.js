/*
 * @Author: Euan Millar 
 * @Date: 2017-05-25 22:14:06 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-06-02 17:25:55
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware} from 'redux';
import { Provider } from 'react-redux';
import App from './containers/App';
import reducer from './reducers/index';
import thunk from 'redux-thunk';
import styles from './index.css';

const store = createStore(reducer, applyMiddleware(thunk));
const rootElement = document.getElementById('root');

ReactDOM.render(
  <Provider className={styles.root} store={store}>
    <App />
  </Provider>,
  rootElement
);
