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

import { ObjectId } from 'mongodb'
import fetch from 'node-fetch'
import { z } from 'zod'
import { ResolvedUser } from '@opencrvs/commons'
import * as userMgntDb from '@events/storage/mongodb/user-mgnt'
import { env } from '@events/environment'

async function getPresignedSingleUrl(filename: string, token: string) {
  const url = `${env.DOCUMENTS_URL}/presigned-url`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ fileUri: filename }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to get presigned URL for ${filename}: ${response.statusText}`
    )
    return undefined
  }
  const res = z
    .object({ presignedURL: z.string() })
    .safeParse(await response.json())
  return res.data?.presignedURL
}

export const getUsersById = async (ids: string[], token: string) => {
  const db = await userMgntDb.getClient()

  if (ids.length === 0) {
    return []
  }

  const results = await db
    .collection<{
      _id: ObjectId
      name: ResolvedUser['name']
      role: string
      signatureUrl?: string
    }>('users')
    .find({
      _id: {
        $in: ids
          .filter((id) => ObjectId.isValid(id))
          .map((id) => new ObjectId(id))
      }
    })
    .toArray()

  await Promise.all(
    results.map(async (user) => {
      if (user.signatureUrl) {
        try {
          const presignedURL = await getPresignedSingleUrl(
            user.signatureUrl,
            token
          )
          user.signatureUrl = presignedURL || user.signatureUrl
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            `Failed to get presigned URL for ${user.signatureUrl}`,
            err
          )
        }
      }
    })
  )

  return results.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    signatureUrl: user.signatureUrl
  }))
}
