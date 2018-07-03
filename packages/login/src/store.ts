import {
  compose,
  createStore as createReduxStore,
  applyMiddleware
} from 'redux'
import { createBrowserHistory } from 'history'
import { combineReducers, install, StoreCreator } from 'redux-loop'
import {
  connectRouter,
  routerMiddleware,
  RouterState
} from 'connected-react-router'
import { reducer as formReducer, FormState } from 'redux-form'
import { loginReducer, LoginState } from './login/loginReducer'
import { intlReducer, IntlState } from './i18n/intlReducer'

export const history = createBrowserHistory()
const middleware = routerMiddleware(history)

export interface IStoreState {
  login: LoginState
  router: RouterState
  form: FormState
  i18n: IntlState
}

const reducers = combineReducers({
  login: loginReducer,
  router: connectRouter(history),
  form: formReducer,
  i18n: intlReducer
})

const enhancedCreateStore = createReduxStore as StoreCreator

const enhancer = compose(
  applyMiddleware(middleware),
  install(),
  typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    : (f: any) => f
)

export const createStore = () =>
  enhancedCreateStore<any, any>(reducers, {}, enhancer)
