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

import { profileReducer, ProfileState } from '@register/profile/profileReducer'
import {
  offlineDataReducer,
  IOfflineDataState
} from '@register/offline/reducer'
import { intlReducer, IntlState } from '@register/i18n/reducer'
import { applicationsReducer, IApplicationsState } from '@register/applications'
import {
  reviewReducer,
  IReviewFormState
} from '@opencrvs/register/src/forms/register/reviewReducer'
import {
  registerFormReducer,
  IRegisterFormState
} from '@register/forms/register/reducer'
import { navigationReducer, INavigationState } from '@register/navigation'
import {
  notificationReducer,
  NotificationState
} from '@register/notification/reducer'
import {
  IRejectState,
  rejectReducer
} from '@opencrvs/register/src/review/reducer'
import {
  IPrintFormState,
  printReducer
} from '@register/forms/certificate/printReducer'
import * as Sentry from '@sentry/browser'
import createSentryMiddleware from 'redux-sentry-middleware'
import {
  userFormReducer,
  IUserFormState
} from '@register/views/SysAdmin/forms/userReducer'

export interface IStoreState {
  profile: ProfileState
  router: RouterState
  i18n: IntlState
  applicationsState: IApplicationsState
  registerForm: IRegisterFormState
  navigation: INavigationState
  notification: NotificationState
  reviewForm: IReviewFormState
  printCertificateForm: IPrintFormState
  reject: IRejectState
  offline: IOfflineDataState
  userForm: IUserFormState
}

const reducers = combineReducers<IStoreState>({
  profile: profileReducer,
  router: routerReducer,
  i18n: intlReducer,
  applicationsState: applicationsReducer,
  registerForm: registerFormReducer,
  navigation: navigationReducer,
  notification: notificationReducer,
  reviewForm: reviewReducer,
  reject: rejectReducer,
  printCertificateForm: printReducer,
  offline: offlineDataReducer,
  userForm: userFormReducer
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
