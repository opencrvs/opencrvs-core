/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  connectRouter,
  routerMiddleware,
  RouterState
} from 'connected-react-router'
import { createBrowserHistory, History } from 'history'
import {
  AnyAction,
  applyMiddleware,
  compose,
  createStore as createReduxStore,
  Store,
  StoreEnhancer
} from 'redux'
import { combineReducers, getModel, install, StoreCreator } from 'redux-loop'

import { declarationsReducer, IDeclarationsState } from '@client/declarations'
import {
  IPrintFormState,
  printReducer
} from '@client/forms/certificate/printReducer'
import {
  IRegisterFormState,
  registerFormReducer
} from '@client/forms/register/reducer'
import { intlReducer, IntlState } from '@client/i18n/reducer'
import { INavigationState, navigationReducer } from '@client/navigation'
import {
  notificationReducer,
  NotificationState
} from '@client/notification/reducer'
import { IOfflineDataState, offlineDataReducer } from '@client/offline/reducer'
import { profileReducer, ProfileState } from '@client/profile/profileReducer'
import {
  IReviewFormState,
  reviewReducer
} from '@opencrvs/client/src/forms/register/reviewReducer'
// eslint-disable-next-line no-restricted-imports
import {
  advancedSearchParamReducer,
  IAdvancedSearchParamState
} from '@client/search/advancedSearch/reducer'
import { IUserFormState, userFormReducer } from '@client/user/userReducer'
import * as Sentry from '@sentry/react'
import createSentryMiddleware from 'redux-sentry-middleware'
import { submissionMiddleware } from './declarations/submissionMiddleware'
import { workqueueReducer, WorkqueueState } from './workqueue'
import { persistenceMiddleware } from './utils/persistence/persistenceMiddleware'

export interface IStoreState {
  profile: ProfileState
  router: RouterState
  i18n: IntlState
  declarationsState: IDeclarationsState
  registerForm: IRegisterFormState
  navigation: INavigationState
  notification: NotificationState
  reviewForm: IReviewFormState
  printCertificateForm: IPrintFormState
  offline: IOfflineDataState
  userForm: IUserFormState
  workqueueState: WorkqueueState
  advancedSearch: IAdvancedSearchParamState
}

const enhancedCreateStore = createReduxStore as StoreCreator

export type AppStore = Store<IStoreState, AnyAction>

const config = { DONT_LOG_ERRORS_ON_HANDLED_FAILURES: true }

export const createStore = <T>(
  existingHistory?: History<T>
): { store: AppStore; history: History } => {
  const history = existingHistory || createBrowserHistory()
  const reducers = combineReducers<IStoreState>({
    profile: profileReducer,
    router: connectRouter(history) as any, // @todo
    i18n: intlReducer,
    declarationsState: declarationsReducer,
    registerForm: registerFormReducer,
    navigation: navigationReducer,
    notification: notificationReducer,
    reviewForm: reviewReducer,
    printCertificateForm: printReducer,
    offline: offlineDataReducer,
    userForm: userFormReducer,
    workqueueState: workqueueReducer,
    advancedSearch: advancedSearchParamReducer
  })
  // @ts-ignore
  const enhancer = compose(
    applyMiddleware(submissionMiddleware),
    install(config),
    applyMiddleware(persistenceMiddleware),
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
