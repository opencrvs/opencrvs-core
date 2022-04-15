/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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

import { profileReducer, ProfileState } from '@client/profile/profileReducer'
import { offlineDataReducer, IOfflineDataState } from '@client/offline/reducer'
import { intlReducer, IntlState } from '@client/i18n/reducer'
import {
  declarationsReducer,
  IDeclarationsState,
  WorkqueueState,
  registrarWorkqueueReducer
} from '@client/declarations'
import {
  reviewReducer,
  IReviewFormState
} from '@opencrvs/client/src/forms/register/reviewReducer'
import {
  registerFormReducer,
  IRegisterFormState
} from '@client/forms/register/reducer'
import { navigationReducer, INavigationState } from '@client/navigation'
import {
  notificationReducer,
  NotificationState
} from '@client/notification/reducer'
import {
  IRejectState,
  rejectReducer
} from '@opencrvs/client/src/review/reducer'
import {
  IPrintFormState,
  printReducer
} from '@client/forms/certificate/printReducer'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import createSentryMiddleware from 'redux-sentry-middleware'
import { userFormReducer, IUserFormState } from '@client/user/userReducer'
import {
  formDraftReducer,
  IFormDraftDataState
} from '@client/forms/configuration/formDrafts/reducer'
import {
  configFieldsReducer,
  IConfigFieldsState
} from './forms/configuration/configFields/reducer'

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
  reject: IRejectState
  offline: IOfflineDataState
  userForm: IUserFormState
  workqueueState: WorkqueueState
  formDraft: IFormDraftDataState
  configFields: IConfigFieldsState
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
    reject: rejectReducer,
    printCertificateForm: printReducer,
    offline: offlineDataReducer,
    userForm: userFormReducer,
    workqueueState: registrarWorkqueueReducer,
    formDraft: formDraftReducer,
    configFields: configFieldsReducer
  })
  const enhancer = compose(
    install(config),
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
