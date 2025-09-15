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
import {
  FullDocumentPath,
  getFilepathsFromEvent,
  joinUrlPaths,
  EventDocument
} from '@opencrvs/commons'
import { env } from '@events/environment'

export async function deleteFile(path: FullDocumentPath, token: string) {
  const res = await fetch(
    new URL(joinUrlPaths('/files', path), env.DOCUMENTS_URL),
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
    new URL(joinUrlPaths('/files', path), env.DOCUMENTS_URL),
    {
      method: 'HEAD',
      headers: {
        Authorization: token
      }
    }
  )

  if (res.status === 404) {
    return false
  } else if (!res.ok) {
    throw new Error(
      `Failed to check file existence: ${res.status} ${res.statusText}`
    )
  }

  return true
}

export async function listFiles(path: string, token: string) {
  const res = await fetch(
    new URL(joinUrlPaths('/list-files', path), env.DOCUMENTS_URL),
    {
      method: 'GET',
      headers: {
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to list files in ${path}`)
  }

  return res.json()
}

export async function cleanupUnreferencedFiles(
  event: EventDocument,
  token: string
) {
  const referencedFiles = getFilepathsFromEvent(event)
  const filesSavedInMinio = await listFiles(event.id, token)

  filesSavedInMinio.forEach(async (file: string) => {
    if (!referencedFiles.includes(file)) {
      await deleteFile(file, token)
    }
  })
}
