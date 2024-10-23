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

import { intlReducer, IntlState } from '@client/i18n/reducer'
import { INavigationState, navigationReducer } from '@client/navigation'
import {
  notificationReducer,
  NotificationState
} from '@client/notification/reducer'
import { IOfflineDataState, offlineDataReducer } from '@client/offline/reducer'
import { profileReducer, ProfileState } from '@client/profile/profileReducer'

import { IUserFormState, userFormReducer } from '@client/user/userReducer'
import * as Sentry from '@sentry/react'
import createSentryMiddleware from 'redux-sentry-middleware'

import { persistenceMiddleware } from './utils/persistence/persistenceMiddleware'
import {
  IReloadModalVisibilityState,
  reloadModalVisibilityReducer
} from './reload/reducer'

export interface IStoreState {
  profile: ProfileState
  router: RouterState
  i18n: IntlState
  navigation: INavigationState
  notification: NotificationState
  offline: IOfflineDataState
  userForm: IUserFormState
  reloadModalVisibility: IReloadModalVisibilityState
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
    router: connectRouter(history) as any,
    i18n: intlReducer,
    navigation: navigationReducer,
    notification: notificationReducer,
    offline: offlineDataReducer,
    userForm: userFormReducer,
    reloadModalVisibility: reloadModalVisibilityReducer
  })

  const enhancer = compose(
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
