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

export const getResentSMS = (store: IStoreState): LoginState['resentSMS'] =>
  getKey(store, 'resentSMS')

export const getsubmitting = (store: IStoreState): LoginState['submitting'] =>
  getKey(store, 'submitting')

export function selectCountryLogo(store: IStoreState) {
  return getKey(store, 'config').COUNTRY_LOGO?.file
}

export function selectCountryBackground(store: IStoreState) {
  if (getKey(store, 'config').LOGIN_BACKGROUND?.backgroundImage) {
    return getKey(store, 'config').LOGIN_BACKGROUND?.backgroundImage
  } else {
    return getKey(store, 'config').LOGIN_BACKGROUND?.backgroundColor
  }
}
export function selectApplicationName(store: IStoreState) {
  return getKey(store, 'config').APPLICATION_NAME
}

export const getStepOneDetails = (
  store: IStoreState
): LoginState['authenticationDetails'] => getKey(store, 'authenticationDetails')

export function selectImageToObjectFit(store: IStoreState) {
  if (getKey(store, 'config').LOGIN_BACKGROUND?.imageFit) {
    return getKey(store, 'config').LOGIN_BACKGROUND?.imageFit
  } else {
    return getKey(store, 'config').LOGIN_BACKGROUND?.imageFit
  }
}

export function usePersistentCountryBackground() {
  const [offlineBackground, setOfflineBackground] = React.useState(
    localStorage.getItem('country-background') ?? ''
  )
  const background = useSelector(selectCountryBackground)
  if (background && background !== offlineBackground) {
    setOfflineBackground(background)
    localStorage.setItem('country-background', background)
  }

  return offlineBackground
}
export function useImageToObjectFit() {
  const [offlineBackground, setOfflineBackground] = React.useState(
    localStorage.getItem('country-image-fit') ?? ''
  )
  const background = useSelector(selectImageToObjectFit)
  if (background && background !== offlineBackground) {
    setOfflineBackground(background)
    localStorage.setItem('country-image-fit', background)
  }

  return offlineBackground
}

export function usePersistentCountryLogo() {
  const [offlineLogo, setOfflineLogo] = React.useState(
    localStorage.getItem('country-logo') ?? ''
  )
  const logo = useSelector(selectCountryLogo)
  if (logo && logo !== offlineLogo) {
    setOfflineLogo(logo)
    localStorage.setItem('country-logo', logo)
  }
  return offlineLogo
}
