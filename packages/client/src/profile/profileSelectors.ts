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
import { ProfileState } from '@client/profile/profileReducer'
import { IStoreState } from '@client/store'
import { Scope } from '@client/utils/authUtils'

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

export const getScope = (store: IStoreState): Scope | null => {
  const tokenPayload = getTokenPayload(store)
  return tokenPayload && tokenPayload.scope
}

export const getUserDetails = (
  store: IStoreState
): ProfileState['userDetails'] => getKey(store, 'userDetails')

export const getUserNonce = (store: IStoreState): ProfileState['nonce'] =>
  getKey(store, 'nonce')
