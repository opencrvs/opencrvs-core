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
import fetch from 'node-fetch'
import { IAuthHeader , logger } from '@opencrvs/commons'
import {
  USER_MANAGEMENT_URL,
  DOCUMENTS_URL
} from '@metrics/constants'

export interface ICountByLocation {
  total: number
  locationId: string
}

export async function countRegistrarsByLocation(
  authHeader: IAuthHeader,
  locationId?: string
): Promise<{ registrars: number }> {
  const res = await fetch(`${USER_MANAGEMENT_URL}/countUsersByLocation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify({
      locationId
    })
  })
  return res.json()
}

export async function uploadFileToMinio(fileData: Buffer): Promise<string> {
  try {
    const result = await fetch(`${DOCUMENTS_URL}/upload-vs-export`, {
      method: 'post',
      headers: {
        'Content-Type': 'text/csv'
      },
      body: fileData
    })
    const res = await result.json()
    return res.refUrl
  } catch (err) {
    logger.error(err)
    return err
  }
}
