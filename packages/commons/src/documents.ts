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

import * as z from 'zod/v4'
import { UUID } from './uuid'

export const MINIO_REGEX =
  /^https?:\/\/[^\/]+(.*)?\/[^\/?]+\.(jpg|jpeg|jfif|png|pdf|svg)(\?.*)?$/i

export function isBase64FileString(str: string) {
  if (str === '' || str.trim() === '') {
    return false
  }
  const strSplit = str.split(':')
  return strSplit.length > 0 && strSplit[0] === 'data'
}

export const isMinioUrl = (url: string): url is FullDocumentUrl =>
  MINIO_REGEX.test(url)

export const FullDocumentUrl = z
  .string()
  .brand('FullDocumentUrl')
  .describe(
    'A full url with protocol, host, bucket name, starting from the root of the S3 server, https://minio.opencrvs.com/bucket-name/document-id.jpg'
  )

export type FullDocumentUrl = z.infer<typeof FullDocumentUrl>

export const FullDocumentPath = z
  .string()
  .overwrite((val) => (val.startsWith('/') ? val : `/${val}`))
  .meta({ effectType: 'input', type: 'string' })
  .describe(
    'A full absolute path with bucket name, starting from the root of the S3 server, /bucket-name/document-id.jpg'
  )

export type FullDocumentPath = z.infer<typeof FullDocumentPath>

export const DocumentPath = z
  .string()
  .brand('DocumentPath')
  .describe(
    'A relative path within the S3 bucket, never starting with /. e.g. document-id.jpg or directory/document-id.jpg. The document service constructs the full /bucket/path internally.'
  )

export type DocumentPath = z.infer<typeof DocumentPath>

export const toDocumentPath = (path: FullDocumentPath): DocumentPath => {
  return path.split('/').slice(2).join('/') as DocumentPath
}
/**
 * The prefix under which every attachment belonging to a record is stored.
 * Deletion and sweeps operate on this prefix, so an object written outside one
 * belongs to no record and nothing will ever remove it.
 */
export type EventAttachmentPath = `events/${string}/`

/**
 * The prefix under which a user's own assets are stored, their avatar and their
 * signature. These are shared across every record the user touches, so deleting
 * a record must never reach them.
 */
export type UserAttachmentPath = `users/${string}/`

/**
 * Where a form writes the files uploaded into it. Every upload path is one of
 * these two, and nothing may upload without one.
 */
export type AttachmentPath = EventAttachmentPath | UserAttachmentPath

export function eventAttachmentPath(eventId: UUID): EventAttachmentPath {
  return `events/${eventId}/`
}

export function userAttachmentPath(userId: UUID): UserAttachmentPath {
  return `users/${userId}/`
}

const ATTACHMENT_PATH = /^(events|users)\/[^/]+\/$/

export function isAttachmentPath(value: string): value is AttachmentPath {
  return ATTACHMENT_PATH.test(value)
}

/**
 * A storage key in one of the shapes the system writes, with its owner:
 * - `events/{eventId}/{file}`: a record attachment
 * - `users/{userId}/{file}`: a user's avatar or signature
 * - `users/tmp-{uuid}/{file}`: a signature uploaded while creating a user,
 *   before the user had an id (userId is null)
 * - `{file}`: a key from before attachment prefixes existed (record or user)
 */
export type ParsedDocumentPath =
  | { kind: 'event'; eventId: UUID; path: DocumentPath }
  | { kind: 'user'; userId: UUID | null; path: DocumentPath }
  | { kind: 'legacy'; path: DocumentPath }

/**
 * A file name segment. It can't start with a dot, so `.` and `..` are rejected,
 * and it can't contain `%`, `/` or `\`, so nothing gets decoded or collapsed
 * into a different key later on.
 */
const FILE_SEGMENT = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/

/**
 * Parses a storage key strictly. Returns null for anything that isn't exactly
 * one of the known shapes, so authorization and the key that gets used are
 * always decided from the same string.
 */
export function parseDocumentPath(value: string): ParsedDocumentPath | null {
  const segments = value.split('/')
  const path = value as DocumentPath

  if (segments.length === 1) {
    return FILE_SEGMENT.test(value) ? { kind: 'legacy', path } : null
  }

  if (segments.length !== 3) {
    return null
  }

  const [prefix, ownerId, file] = segments
  // Same check as UUID, without importing it at runtime (it pulls in `uuid`)
  const isUuid = (id: string) => z.uuid().safeParse(id).success

  if (!FILE_SEGMENT.test(file)) {
    return null
  }

  // The user form uploads the signature under a temporary id that is never replaced
  // TODO: remove once new users' files are stored under their real id and existing tmp- paths are migrated
  if (
    prefix === 'users' &&
    ownerId.startsWith('tmp-') &&
    isUuid(ownerId.slice('tmp-'.length))
  ) {
    return { kind: 'user', userId: null, path }
  }

  if (!isUuid(ownerId)) {
    return null
  }

  if (prefix === 'events') {
    return { kind: 'event', eventId: ownerId as UUID, path }
  }

  if (prefix === 'users') {
    return { kind: 'user', userId: ownerId as UUID, path }
  }

  return null
}
