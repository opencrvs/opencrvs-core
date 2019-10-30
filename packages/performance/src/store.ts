import {
  compose,
  createStore as createReduxStore,
  applyMiddleware,
  AnyAction,
  Store,
  StoreEnhancer
} from 'redux'
import { createBrowserHistory, History } from 'history'
import { combineReducers, install, StoreCreator, getModel } from 'redux-loop'
import {
  connectRouter,
  routerMiddleware,
  RouterState
} from 'connected-react-router'
import { profileReducer, ProfileState } from '@performance/profile/reducer'
import { intlReducer, IntlState } from '@performance/i18n/reducer'
import * as Sentry from '@sentry/browser'
import createSentryMiddleware from 'redux-sentry-middleware'

export interface IStoreState {
  profile: ProfileState
  router: RouterState
  i18n: IntlState
}

const enhancedCreateStore = createReduxStore as StoreCreator

export type AppStore = Store<IStoreState, AnyAction>

export const createStore = (): { store: AppStore; history: History } => {
  const history = createBrowserHistory()

  const reducers = combineReducers<IStoreState>({
    profile: profileReducer,
    router: connectRouter(history) as any, // @todo
    i18n: intlReducer
  })

  const enhancer = compose(
    install(),
    applyMiddleware(routerMiddleware(history)),
    // @ts-ignore types are not correct for this module yet
    applyMiddleware(createSentryMiddleware(Sentry)),
    typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
      ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
      : (f: any) => f
  ) as StoreEnhancer<IStoreState>

  const store = enhancedCreateStore<IStoreState, AnyAction>(
    reducers,
    getModel(reducers(undefined, { type: 'NOOP' })),
    enhancer
  )
  return { store, history }
}
