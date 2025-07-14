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
import { FullDocumentPath, joinURLPaths } from '@opencrvs/commons'
import { env } from '@events/environment'

export async function deleteFile(path: FullDocumentPath, token: string) {
  const res = await fetch(
    new URL(joinURLPaths('/files', path), env.DOCUMENTS_URL),
    {
      method: 'DELETE',
      headers: {
        Authorization: token
      }
    }
  )
  return res.ok
}
export async function fileExists(path: FullDocumentPath, token: string) {
  const res = await fetch(
    new URL(joinURLPaths('/files', path), env.DOCUMENTS_URL),
    {
      method: 'HEAD',
      headers: {
        Authorization: token
      }
    }
  )

  return res.ok
}
