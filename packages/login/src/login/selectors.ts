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
import { LoginState } from '@login/login/reducer'
import { IStoreState } from '@login/store'
import * as React from 'react'
import { useSelector } from 'react-redux'
const getPartialState = (store: IStoreState): LoginState => store.login

function getKey<K extends keyof LoginState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}
export const getSubmissionError = (
  store: IStoreState
): LoginState['submissionError'] => getKey(store, 'submissionError')

export const getErrorCode = (store: IStoreState): LoginState['errorCode'] =>
  getKey(store, 'errorCode')

export const getResentAuthenticationCode = (
  store: IStoreState
): LoginState['resentAuthenticationCode'] =>
  getKey(store, 'resentAuthenticationCode')

export const getsubmitting = (store: IStoreState): LoginState['submitting'] =>
  getKey(store, 'submitting')

export function selectCountryLogo(store: IStoreState) {
  return getKey(store, 'config').COUNTRY_LOGO?.file
}

export function selectCountryBackground(store: IStoreState) {
  const countryBackground = getKey(store, 'config').LOGIN_BACKGROUND
  if (countryBackground?.backgroundImage) {
    return {
      backgroundImage: countryBackground.backgroundImage,
      imageFit: countryBackground.imageFit
    }
  } else if (countryBackground?.backgroundColor) {
    return {
      backgroundColor: countryBackground?.backgroundColor
    }
  }
}
export function selectApplicationName(store: IStoreState) {
  return getKey(store, 'config').APPLICATION_NAME
}

export function selectImageToObjectFit(store: IStoreState) {
  if (getKey(store, 'config').LOGIN_BACKGROUND?.imageFit) {
    return getKey(store, 'config').LOGIN_BACKGROUND?.imageFit
  } else {
    return getKey(store, 'config').LOGIN_BACKGROUND?.imageFit
  }
}

export const getStepOneDetails = (
  store: IStoreState
): LoginState['authenticationDetails'] => getKey(store, 'authenticationDetails')
