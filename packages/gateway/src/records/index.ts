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
import { SEARCH_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import { Bundle, Saved } from '@opencrvs/commons/types'

export async function getRecordById(
  recordId: string,
  authorizationToken: string
): Promise<Saved<Bundle>> {
  const url = new URL(
    `/records/${recordId}?includeHistoryResources`,
    SEARCH_URL
  )

  const res = await fetch(url.href, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorizationToken
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch record ${recordId}`)
  }

  return res.json()
}
