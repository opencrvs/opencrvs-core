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
import { Readable } from 'stream'
import { TRPCError } from '@trpc/server'
import fetch from 'node-fetch'
import { zfd } from 'zod-form-data'
import * as z from 'zod/v4'
import FormData from 'form-data'
import {
  ActionValues,
  DocumentPath,
  getFilePathsFromEvent,
  getFilePathsFromValues,
  joinUrlPaths,
  parseDocumentPath,
  EventDocument
} from '@opencrvs/commons'
import { env } from '@events/environment'

export async function deleteFile(path: DocumentPath | string, token: string) {
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
export async function fileExists(path: DocumentPath | string, token: string) {
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

export async function presignFile(path: DocumentPath, token: string) {
  const requestPath = joinUrlPaths('/presigned-url', path)
  const url = new URL(requestPath, env.DOCUMENTS_URL)

  /*
   * URL resolution collapses `.`/`..` segments (encoded ones too), so the key
   * documents-service signs could differ from the one that was authorized.
   */
  if (url.pathname !== requestPath) {
    throw new Error(`Refusing to presign a non-canonical path: ${path}`)
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Failed to presign file ${path}: ${res.status} ${res.statusText}`
    )
  }

  return res.json() as Promise<{ presignedURL: string }>
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

  return res.json() as Promise<DocumentPath[]>
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
    filesToDelete.map(async (file: DocumentPath) => deleteFile(file, token))
  )
}

/**
 * Throws unless every file the values name is stored under the record's own
 * prefix, or is already named by the record (e.g. a pre-2.0 key carried over
 * by a correction). A record's readers can presign every file it names, so a
 * record must not be able to name anyone else's.
 */
export function assertFilesBelongToEvent(
  event: EventDocument,
  values: ActionValues
) {
  const namedByRecord = getFilePathsFromEvent(event)

  // Files the record already names are carried over as they are (e.g. a
  // pre-2.0 key in a correction), so only new ones are checked
  const newFiles = getFilePathsFromValues(values).filter(
    (path) => !namedByRecord.includes(path)
  )

  for (const path of newFiles) {
    const file = parseDocumentPath(path)

    if (file?.kind !== 'event' || file.eventId !== event.id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `File does not belong to this record: ${path}`
      })
    }
  }
}

/**
 * An imported record has no stored state to compare against, so it may name
 * only its own attachments and pre-2.0 keys. An action's signature may also be
 * one of its author's own files.
 */
export function assertImportedFilesBelongToEvent(event: EventDocument) {
  function assertPath(path: string, signedBy?: string) {
    const file = parseDocumentPath(path)
    const allowed =
      file?.kind === 'legacy' ||
      (file?.kind === 'event' && file.eventId === event.id) ||
      (file?.kind === 'user' && file.userId === signedBy)

    if (!allowed) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `File does not belong to this record: ${path}`
      })
    }
  }

  for (const action of event.actions) {
    getFilePathsFromValues({
      declaration: 'declaration' in action ? action.declaration : {},
      annotation: 'annotation' in action ? action.annotation : undefined
    }).forEach((path) => assertPath(path))

    if ('createdBySignature' in action && action.createdBySignature) {
      assertPath(action.createdBySignature, action.createdBy)
    }
  }
}

export const AttachmentInput = zfd.formData({
  file: zfd.file(),
  transactionId: zfd.text(),
  path: zfd.text(z.string().min(1).optional())
})

export async function uploadFile(
  input: z.infer<typeof AttachmentInput>,
  token: string
): Promise<string> {
  const form = new FormData()
  form.append(
    'file',
    Readable.from(Buffer.from(await input.file.arrayBuffer())),
    {
      filename: input.file.name,
      contentType: input.file.type
    }
  )
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

  return res.text()
}
