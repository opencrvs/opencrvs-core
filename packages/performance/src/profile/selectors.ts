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
import { ProfileState } from '@performance/profile/reducer'
import { IStoreState } from '@performance/store'

const getPartialState = (store: IStoreState): ProfileState => store.profile

function getKey<K extends keyof ProfileState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getAuthenticated = (
  store: IStoreState
): ProfileState['authenticated'] => getKey(store, 'authenticated')

export const getTokenPayload = (
  store: IStoreState
): ProfileState['tokenPayload'] => getKey(store, 'tokenPayload')

export const getUserDetails = (
  store: IStoreState
): ProfileState['userDetails'] => getKey(store, 'userDetails')
