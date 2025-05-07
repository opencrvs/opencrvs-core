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
/* istanbul ignore next */
import {
  compose,
  createStore as createReduxStore,
  applyMiddleware,
  AnyAction,
  Store,
  StoreEnhancer
} from 'redux'
import { combineReducers, install, StoreCreator, getModel } from 'redux-loop'
import { loginReducer, LoginState } from '@login/login/reducer'
import { intlReducer, IntlState } from '@login/i18n/reducer'
import * as Sentry from '@sentry/react'
import createSentryMiddleware from 'redux-sentry-middleware'

export interface IStoreState {
  login: LoginState
  i18n: IntlState
}

// @ts-ignore

const enhancedCreateStore = createReduxStore as StoreCreator

export type AppStore = Store<IStoreState, AnyAction>

export const createStore = () => {
  const reducers = combineReducers<IStoreState>({
    login: loginReducer,
    i18n: intlReducer
  })

  const enhancer = compose(
    install(),
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
  return { store }
}
