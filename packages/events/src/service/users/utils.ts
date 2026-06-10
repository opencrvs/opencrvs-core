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

import { randomBytes } from 'crypto'
import {
  DocumentPath,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  TokenUserType,
  User
} from '@opencrvs/commons'
import { getUserById } from '@events/storage/postgres/events/users'

function normalizeUsername(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (ä,ö,å etc.)
    .replace(/[^a-zA-Z0-9.\-]/g, '') // keep latin, digits, dots, dashes
    .replace(/^[.\-]+|[.\-]+$/g, '') // trim leading/trailing dots & dashes
    .toLowerCase()
}

function getInitials(firstname: string): string {
  return firstname
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
}

export function generateUsername(name: User['name']): string {
  const initials = normalizeUsername(getInitials(name.firstname))
  const surname = normalizeUsername(name.surname)
  const separator = initials.length > 0 ? '.' : ''
  const raw = `${initials}${separator}${surname}`
  const padded =
    raw.length >= MIN_USERNAME_LENGTH
      ? raw
      : raw.padEnd(MIN_USERNAME_LENGTH, '0')
  return padded.slice(0, MAX_USERNAME_LENGTH).replace(/[.\-]+$/, '')
}

export function generateRandomPassword() {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const length = 12
  // Rejection sampling eliminates modulo bias (256 % 62 = 8, so bytes 248-255 are discarded)
  const result: string[] = []
  const limit = 256 - (256 % charset.length)
  while (result.length < length) {
    const byte = randomBytes(1)[0]
    if (byte < limit) {
      result.push(charset[byte % charset.length])
    }
  }
  return result.join('')
}

type DbUser = NonNullable<Awaited<ReturnType<typeof getUserById>>>

export function mapDbUserToUser(user: DbUser): User & { username: string } {
  return {
    type: TokenUserType.enum.user,
    id: user.id,
    name: {
      firstname: user.firstname,
      surname: user.surname
    },
    role: user.role,
    email: user.email ?? undefined,
    mobile: user.mobile ?? undefined,
    device: user.device ?? undefined,
    username: user.username,
    status: user.status as User['status'],
    signature: user.signaturePath
      ? (user.signaturePath as DocumentPath)
      : undefined,
    avatar: user.profileImagePath
      ? (user.profileImagePath as DocumentPath)
      : undefined,
    primaryOfficeId: user.officeId,
    administrativeAreaId: user.administrativeAreaId ?? undefined,
    fullHonorificName: user.fullHonorificName ?? undefined,
    data: Object.keys(user.data).length > 0 ? user.data : undefined
  }
}
