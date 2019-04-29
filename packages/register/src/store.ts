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
import { offlineDataReducer, IOfflineDataState } from './offline/reducer'
import { intlReducer, IntlState } from './i18n/reducer'
import { draftsReducer, IDraftsState } from 'drafts'
import {
  reviewReducer,
  IReviewFormState
} from '/forms/register/reviewReducer'
import {
  registerFormReducer,
  IRegisterFormState
} from './forms/register/reducer'
import { navigationReducer, INavigationState } from 'navigation'
import {
  notificationReducer,
  NotificationState
} from 'notification/reducer'
import {
  IRejectState,
  rejectReducer
} from '/review/reducer'
import { IPrintFormState, printReducer } from './forms/certificate/printReducer'
import * as Sentry from '@sentry/browser'
import * as createSentryMiddleware from 'redux-sentry-middleware'

export interface IStoreState {
  profile: ProfileState
  router: RouterState
  i18n: IntlState
  drafts: IDraftsState
  registerForm: IRegisterFormState
  navigation: INavigationState
  notification: NotificationState
  reviewForm: IReviewFormState
  printCertificateForm: IPrintFormState
  reject: IRejectState
  offline: IOfflineDataState
}

const reducers = combineReducers<IStoreState>({
  profile: profileReducer,
  router: routerReducer,
  i18n: intlReducer,
  drafts: draftsReducer,
  registerForm: registerFormReducer,
  navigation: navigationReducer,
  notification: notificationReducer,
  reviewForm: reviewReducer,
  reject: rejectReducer,
  printCertificateForm: printReducer,
  offline: offlineDataReducer
})

const enhancedCreateStore = createReduxStore as StoreCreator

export type AppStore = Store<IStoreState, AnyAction>

export const createStore = (): { store: AppStore; history: History } => {
  const history = createBrowserHistory()
  const enhancer = compose(
    install(),
    applyMiddleware(routerMiddleware(history)),
    // @ts-ignore types are not correct for this module yet
    applyMiddleware(createSentryMiddleware(Sentry)),
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
