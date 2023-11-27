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
import { IAuthHeader } from '@opencrvs/commons'
import { getTokenPayload } from './features/user/utils'
import { SEARCH_URL } from './constants'

import fetch from '@gateway/fetch'

export async function postAssignmentSearch(
  authHeader: IAuthHeader,
  compositionId: string
) {
  return fetch(`${SEARCH_URL}search/assignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify({ compositionId })
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Search assignment failed: ${error.message}`)
      )
    })
}

export async function checkUserAssignment(
  id: string,
  authHeader: IAuthHeader
): Promise<boolean> {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  const userId = tokenPayload.sub
  const res: { userId?: string } = await postAssignmentSearch(authHeader, id)

  return userId === res?.userId
}
