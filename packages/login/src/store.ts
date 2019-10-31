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
/* istanbul ignore next */
import {
  compose,
  createStore as createReduxStore,
  applyMiddleware,
  AnyAction,
  Store,
  StoreEnhancer
} from 'redux'
import { createBrowserHistory } from 'history'
import {
  combineReducers,
  install,
  StoreCreator,
  getModel,
  LoopReducer
} from 'redux-loop'
import {
  connectRouter,
  routerMiddleware,
  RouterState
} from 'connected-react-router'
import { reducer as formReducer, FormStateMap, FormAction } from 'redux-form'
import { loginReducer, LoginState } from '@login/login/reducer'
import { intlReducer, IntlState } from '@login/i18n/reducer'
import * as Sentry from '@sentry/browser'
import createSentryMiddleware from 'redux-sentry-middleware'

export interface IStoreState {
  login: LoginState
  router: RouterState
  form: FormStateMap
  i18n: IntlState
}

// @ts-ignore
const formRed: LoopReducer<FormStateMap, FormAction> = (
  state: FormStateMap,
  action: FormAction
) => formReducer(state as FormStateMap, action)

const enhancedCreateStore = createReduxStore as StoreCreator

export type AppStore = Store<IStoreState, AnyAction>

export const createStore = () => {
  const history = createBrowserHistory()

  const reducers = combineReducers<IStoreState>({
    login: loginReducer,
    router: connectRouter(history) as any, // @todo
    form: formRed,
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
