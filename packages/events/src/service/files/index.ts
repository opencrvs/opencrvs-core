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
import FormData from 'form-data'
import { Readable } from 'stream'
import { File } from 'buffer'
import {
  FullDocumentPath,
  getFilePathsFromEvent,
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

  return res.json() as Promise<string[]>
}

export async function cleanupUnreferencedFiles(
  event: EventDocument,
  token: string
) {
  const referencedFiles = getFilePathsFromEvent(event)
  const filesSavedInMinio = await listFiles(event.id, token)

  const filesToDelete = filesSavedInMinio.filter(
    (file) => !referencedFiles.includes(file)
  )

  return Promise.all(
    filesToDelete.map(async (file: string) => deleteFile(file, token))
  )
}

export async function uploadFile(
  input: { file: File; transactionId: string; path?: string },
  token: string
): Promise<{ fileUrl: string }> {
  const form = new FormData()
  form.append('file', Readable.from(Buffer.from(await input.file.arrayBuffer())), {
    filename: input.file.name,
    contentType: input.file.type
  })
  form.append('transactionId', input.transactionId)
  if (input.path) {
    form.append('path', input.path)
  }

  const res = await fetch(new URL('/files', env.DOCUMENTS_URL).toString(), {
    method: 'POST',
    headers: {
      ...form.getHeaders(),
      Authorization: token
    },
    body: form
  })

  if (!res.ok) {
    throw new Error(`File upload failed: ${res.status} ${res.statusText}`)
  }

  const fileUrl = await res.text()
  return { fileUrl }
}
