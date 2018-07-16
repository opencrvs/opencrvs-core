import {
  compose,
  createStore as createReduxStore,
  applyMiddleware
} from 'redux'
import { History } from 'history'
import { combineReducers, install, StoreCreator, getModel } from 'redux-loop'
import {
  routerReducer,
  routerMiddleware,
  RouterState
} from 'react-router-redux'
import { reducer as formReducer, FormState } from 'redux-form'
import { loginReducer, LoginState } from './login/loginReducer'
import { intlReducer, IntlState } from './i18n/intlReducer'

export interface IStoreState {
  login: LoginState
  router: RouterState
  form: FormState
  i18n: IntlState
}
const reducers = combineReducers({
  login: loginReducer,
  router: routerReducer,
  form: formReducer,
  i18n: intlReducer
})

const enhancedCreateStore = createReduxStore as StoreCreator
export const createStore = (history: History) => {
  const middleware = routerMiddleware(history)

  const enhancer = compose(
    install(),
    applyMiddleware(middleware),
    typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
      ? /* istanbul ignore next */ (window as any).__REDUX_DEVTOOLS_EXTENSION__()
      : (f: any) => f
  )

  return enhancedCreateStore(
    reducers,
    getModel(reducers(undefined, { type: 'NOOP' })),
    enhancer
  )
}
