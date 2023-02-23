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
import { IOfflineDataState, IOfflineData } from '@client/offline/reducer'
import { IStoreState } from '@client/store'
import { NATL_ADMIN_ROLES, SYS_ADMIN_ROLES } from '@client/utils/constants'
import { merge } from 'lodash'
import { UserDetails } from '@client/utils/userUtils'

export const getOfflineState = (store: IStoreState): IOfflineDataState =>
  store.offline

function getKey<K extends keyof IOfflineDataState>(store: IStoreState, key: K) {
  return getOfflineState(store)[key]
}

export function isOfflineDataLoaded(
  state: Partial<IOfflineData>
): state is IOfflineData {
  const hasAllRequiredData =
    state.facilities &&
    state.locations &&
    state.config &&
    state.formConfig &&
    state.templates &&
    state.languages

  const isOfflineDataLoaded = Boolean(hasAllRequiredData)
  if (isOfflineDataLoaded) merge(window.config, state.config)
  return isOfflineDataLoaded
}

export function isSystemAdmin(userDetails: UserDetails | undefined) {
  return (
    userDetails &&
    userDetails.systemRole &&
    SYS_ADMIN_ROLES.includes(userDetails.systemRole)
  )
}

export function isNationalSystemAdmin(userDetails: UserDetails | undefined) {
  return (
    userDetails &&
    userDetails.systemRole &&
    NATL_ADMIN_ROLES.includes(userDetails.systemRole)
  )
}

export const getOfflineDataLoaded = (
  store: IStoreState
): IOfflineDataState['offlineDataLoaded'] => getKey(store, 'offlineDataLoaded')

export const getOfflineData = (store: IStoreState): IOfflineData => {
  const data = getKey(store, 'offlineData')
  if (!isOfflineDataLoaded(data)) {
    throw new Error('Offline data is not yet loaded. This should never happen')
  }
  return data
}

export const selectCountryBackground = (store: IStoreState) => {
  const countryBackground = getKey(store, 'offlineData').config
    ?.LOGIN_BACKGROUND
  if (countryBackground?.backgroundImage) {
    return {
      backgroundImage: countryBackground.backgroundImage,
      imageFit: countryBackground.imageFit
    }
  }
  return {
    backgroundColor: countryBackground?.backgroundColor ?? '36304E'
  }
}

export const selectCountryLogo = (store: IStoreState) => {
  return getKey(store, 'offlineData').config?.COUNTRY_LOGO?.file
}

export const getOfflineLoadingError = (
  store: IStoreState
): IOfflineDataState['loadingError'] => getKey(store, 'loadingError')
