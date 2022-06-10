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
import { LoginState } from '@login/login/reducer'
import { IStoreState } from '@login/store'
const getPartialState = (store: IStoreState): LoginState => store.login

function getKey<K extends keyof LoginState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}
export const getSubmissionError = (
  store: IStoreState
): LoginState['submissionError'] => getKey(store, 'submissionError')

export const getErrorCode = (store: IStoreState): LoginState['errorCode'] =>
  getKey(store, 'errorCode')

export const getResentSMS = (store: IStoreState): LoginState['resentSMS'] =>
  getKey(store, 'resentSMS')

export const getsubmitting = (store: IStoreState): LoginState['submitting'] =>
  getKey(store, 'submitting')

export function selectCountryLogo(store: IStoreState) {
  return getKey(store, 'config').COUNTRY_LOGO?.file
}
