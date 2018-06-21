import { compose, createStore, applyMiddleware } from 'redux'
import createHistory from 'history/createBrowserHistory'
import { combineReducers, install, StoreCreator } from 'redux-loop'
import { routerReducer, routerMiddleware } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'
import { loginReducer } from './login/LoginReducer'
import { intlReducer } from './i18n/IntlReducer'

export const history = createHistory()
const middleware = routerMiddleware(history)
const reducers = combineReducers({
  router: routerReducer,
  login: loginReducer,
  form: formReducer,
  i18n: intlReducer
})
const enhancedCreateStore = createStore as StoreCreator

const enhancer = compose(
  applyMiddleware(middleware),
  install(),
  typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    : (f: any) => f
)

export const store = enhancedCreateStore(reducers, {}, enhancer)
