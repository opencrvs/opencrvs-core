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
import { FetchUserQuery, HumanName } from '@client/utils/gateway'
import { createNamesMap } from './data-formatting'
import { LANG_EN } from './constants'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ITokenPayload } from './authUtils'
import { dataUrlToFile } from './imageUtils'
import { cacheFile, extractFilenameFromUrl } from './persistence/fileCache'

export const USER_DETAILS = 'USER_DETAILS'

export type UserDetails = NonNullable<FetchUserQuery['getUser']>

export function getUserLocation(userDetails: UserDetails) {
  if (!userDetails.primaryOffice) {
    throw Error('The user has no primary office')
  }

  return userDetails.primaryOffice
}

export async function storeUserDetails(userDetails: UserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
export async function removeUserDetails() {
  storage.removeItem(USER_DETAILS)
}

/**
 * Precache the user signature file from url.
 * NOTE: Required for events v2 offline functionality for user signature (declaration, printing)
 * NOTE: Precaching is done for the url **WITHOUT** the search params (signature part.)
 * @param presignedUrl - The presigned URL for the user signature
 */
export const precacheUserSignature = async (
  presignedUrl: string | undefined | null
): Promise<string | undefined> => {
  if (!presignedUrl) {
    return
  }

  try {
    const filename = extractFilenameFromUrl(presignedUrl)
    const file = await dataUrlToFile(presignedUrl, filename)

    await cacheFile({ filename, file })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error precaching user signature:', error)
  }
}

export function getIndividualNameObj(
  individualNameArr: Array<HumanName | null>,
  language: string
) {
  return (
    individualNameArr.find((name: HumanName | null) => {
      return name && name.use === language ? true : false
    }) || individualNameArr[0]
  )
}

export function getUserName(userDetails: UserDetails | null) {
  return (
    (userDetails &&
      userDetails.name &&
      createNamesMap(userDetails.name)[LANG_EN]) ||
    ''
  )
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
