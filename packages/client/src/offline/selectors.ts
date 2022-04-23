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
import { IUserDetails } from '@client/utils/userUtils'
import { NATL_ADMIN_ROLES, SYS_ADMIN_ROLES } from '@client/utils/constants'
import { merge } from 'lodash'

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
    state.pilotLocations &&
    state.config &&
    state.formConfig &&
    state.formDraft &&
    state.templates &&
    state.languages

  const isOfflineDataLoaded = Boolean(hasAllRequiredData)
  if (isOfflineDataLoaded) merge(window.config, state.config)
  return isOfflineDataLoaded
}

export function isSystemAdmin(userDetails: IUserDetails | undefined) {
  return (
    userDetails &&
    userDetails.role &&
    SYS_ADMIN_ROLES.includes(userDetails.role)
  )
}

export function isNationalSystemAdmin(userDetails: IUserDetails | undefined) {
  return (
    userDetails &&
    userDetails.role &&
    NATL_ADMIN_ROLES.includes(userDetails.role)
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

export const getOfflineLoadingError = (
  store: IStoreState
): IOfflineDataState['loadingError'] => getKey(store, 'loadingError')
