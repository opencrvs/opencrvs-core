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
import { StateIdenfitiers } from '@opencrvs/commons/types'
import { SEARCH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

export async function getRecordById<T extends Array<keyof StateIdenfitiers>>(
  recordId: string,
  authorizationToken: string,
  allowedStates: T,
  includeHistoryResources = false
): Promise<StateIdenfitiers[T[number]]> {
  const url = new URL(
    `/records/${recordId}${
      includeHistoryResources ? '?includeHistoryResources' : ''
    }`,
    SEARCH_URL
  )
  url.searchParams.append('states', allowedStates.join(','))

  const res = await fetch(url.href, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorizationToken
    }
  })

  return res.json()
}

export async function getValidRecordById(
  recordId: string,
  token: string,
  includeHistoryResources = false
) {
  return await getRecordById(
    recordId,
    token,
    [
      'ARCHIVED',
      'CERTIFIED',
      'CORRECTION_REQUESTED',
      'IN_PROGRESS',
      'ISSUED',
      'READY_FOR_REVIEW',
      'REGISTERED',
      'REJECTED',
      'VALIDATED',
      'WAITING_VALIDATION'
    ],
    includeHistoryResources
  )
}
