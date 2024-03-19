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
import { Bundle, SavedTask, ValidRecord } from '@opencrvs/commons/types'
import { SEARCH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

export async function indexBundle(bundle: ValidRecord, authToken: string) {
  const res = await fetch(new URL('/record', SEARCH_URL).href, {
    method: 'POST',
    body: JSON.stringify(bundle),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    }
  })
  if (!res.ok) {
    throw new Error(
      `Indexing a bundle to search service failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }

  return res
}

export async function indexBundleToRoute(
  bundle: ValidRecord,
  authToken: string,
  path: '/events/not-duplicate'
): Promise<void>

export async function indexBundleToRoute(
  bundle: Bundle<SavedTask>,
  authToken: string,
  path: `/events/${'assigned' | 'unassigned'}`
): Promise<void>

export async function indexBundleToRoute(
  bundle: Bundle<SavedTask> | ValidRecord,
  authToken: string,
  path: `/events/${'assigned' | 'unassigned' | 'not-duplicate'}`
) {
  const res = await fetch(new URL(path, SEARCH_URL).href, {
    method: 'POST',
    body: JSON.stringify(bundle),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    }
  })

  if (!res.ok) {
    throw new Error(
      `Indexing a bundle to search service to ${path} failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }
}
