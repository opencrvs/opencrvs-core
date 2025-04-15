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
import { ResolvedUser } from '@opencrvs/commons'
import * as userMgntDb from '@events/storage/mongodb/user-mgnt'
import { env } from '@events/environment'

export async function getPresignedSingleUrl(filename: string, token: string) {
  const url = `${env.DOCUMENTS_URL}/presigned-url`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ fileUri: filename }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  const res = (await response.json()) as { presignedURL: string }
  return res
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
      signatureFile?: string
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
      if (user.signatureFile) {
        try {
          const { presignedURL } = await getPresignedSingleUrl(
            user.signatureFile,
            token
          )
          user.signatureFile = presignedURL || user.signatureFile
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            `Failed to get presigned URL for ${user.signatureFile}`,
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
    signatureFile: user.signatureFile
  }))
}
