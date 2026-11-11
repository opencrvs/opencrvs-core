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
  AttachmentPath,
  DocumentPath,
  eventAttachmentPath,
  getFilePathsFromEvent,
  getFilePathsFromValues,
  joinUrlPaths,
  parseDocumentPath,
  logger,
  EventDocument,
  UUID
} from '@opencrvs/commons'
import { env } from '@events/environment'

async function deleteFile(path: DocumentPath | string, token: string) {
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

/**
 * Presigns every path in one request, keyed by path. documents-service signs
 * whatever it's given, so callers must only pass paths the caller may read.
 */
export async function presignFiles(
  paths: DocumentPath[],
  token: string
): Promise<Record<DocumentPath, string>> {
  if (paths.length === 0) {
    return {}
  }

  const res = await fetch(new URL('/presigned-urls', env.DOCUMENTS_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({ filenames: paths })
  })

  if (!res.ok) {
    throw new Error(`Failed to presign files: ${res.status} ${res.statusText}`)
  }

  // documents-service answers in the order it was asked
  const urls = (await res.json()) as string[]

  return Object.fromEntries(paths.map((path, i) => [path, urls[i]])) as Record<
    DocumentPath,
    string
  >
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

/**
 * Deletes everything stored under a record's or a user's prefix.
 */
export async function deleteFilesByPrefix(
  prefix: AttachmentPath,
  token: string
): Promise<void> {
  const res = await fetch(
    new URL(joinUrlPaths('/prefix', prefix), env.DOCUMENTS_URL),
    {
      method: 'DELETE',
      headers: {
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    logger.error(
      `Failed to delete files under ${prefix}: ${res.status} ${res.statusText}`
    )
  }
}

/**
 * Deletes every object under the record's prefix that no action in the record
 * names. A file uploaded into a form the user then abandoned is reachable no
 * other way, since nothing references it.
 */
export async function sweepUnreferencedFiles(
  event: EventDocument,
  token: string
): Promise<void> {
  const prefix = eventAttachmentPath(event.id)
  const referencedFiles = getFilePathsFromEvent(event)
  const filesSavedInMinio = await listFiles(prefix, token)

  const filesToDelete = filesSavedInMinio.filter(
    (file) => !referencedFiles.includes(file)
  )

  const results = await Promise.all(
    filesToDelete.map(async (file: DocumentPath) => ({
      file,
      deleted: await deleteFile(file, token)
    }))
  )

  const failed = results.filter(({ deleted }) => !deleted)

  if (failed.length > 0) {
    logger.error(
      `Failed to delete ${failed.length} unreferenced file(s) under ${prefix}: ${failed
        .map(({ file }) => file)
        .join(', ')}`
    )
  }
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

  for (const path of getFilePathsFromValues(values)) {
    const file = parseDocumentPath(path)
    // Stored under this record, or already named by it (e.g. a pre-2.0 key a
    // correction carries over); anything else is rejected
    const allowed =
      (file?.kind === 'event' && file.eventId === event.id) ||
      namedByRecord.includes(path)

    if (!allowed) {
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
  eventId: zfd.text(UUID.optional()),
  /**
   * @deprecated Send `eventId` instead and let the server derive the key. A
   * caller-chosen path can land outside every record's prefix, where no
   * deletion or sweep will ever reach it.
   */
  path: zfd.text(z.string().min(1).optional())
})

/**
 * An upload must land under some prefix. A pathless upload writes to the bucket
 * root, where it belongs to no record and no sweep will ever reach it.
 */
export function getUploadPath(input: z.infer<typeof AttachmentInput>) {
  if (input.eventId) {
    return eventAttachmentPath(input.eventId)
  }

  if (input.path) {
    return input.path
  }

  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Either eventId or path is required to upload an attachment'
  })
}

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
  form.append('path', getUploadPath(input))

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
