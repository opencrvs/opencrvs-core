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
import { storage } from '@opencrvs/client/src/storage'
import { LANG_EN } from './constants'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ITokenPayload, User } from '@opencrvs/commons/client'
import { getUsersFullName } from '@client/v2-events/utils'

export const USER_DETAILS = 'USER_DETAILS'

export type UserDetails = User

export async function storeUserDetails(userDetails: UserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
export async function removeUserDetails() {
  return storage.removeItem(USER_DETAILS)
}

export function getUserName(userDetails: UserDetails | null) {
  if (!userDetails?.name?.length) return ''
  return getUsersFullName(userDetails.name, LANG_EN)
}

export function useAuthentication() {
  return useSelector<IStoreState, ITokenPayload | null>(
    (state) => state.profile.tokenPayload
  )
}

export function useUserName() {
  return useSelector<IStoreState, string>((state) => {
    const { userDetails } = state.profile
    return getUserName(userDetails)
  })
}
