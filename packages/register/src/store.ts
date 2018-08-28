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
  routerReducer,
  routerMiddleware,
  RouterState
} from 'react-router-redux'

import { profileReducer, ProfileState } from './profile/profileReducer'

import { i18nReducer, I18nState } from './i18n/i18nReducer'

export interface IStoreState {
  profile: ProfileState
  router: RouterState
  i18n: I18nState
}

const reducers = combineReducers<IStoreState>({
  profile: profileReducer,
  router: routerReducer,
  i18n: i18nReducer
})

const enhancedCreateStore = createReduxStore as StoreCreator

export type AppStore = Store<IStoreState, AnyAction>

export const createStore = (): { store: AppStore; history: History } => {
  const history = createBrowserHistory()
  const middleware = routerMiddleware(history)

  const enhancer = compose(
    install(),
    applyMiddleware(middleware),
    // tslint:disable no-any
    typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
      ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
      : (f: any) => f
    // tslint:enable no-any
  ) as StoreEnhancer<IStoreState>

  const store = enhancedCreateStore<IStoreState, AnyAction>(
    reducers,
    getModel(reducers(undefined, { type: 'NOOP' })),
    enhancer
  )

  return { store, history }
}
