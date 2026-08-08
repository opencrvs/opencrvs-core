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
import { env } from './environment'
import { z } from 'zod'
import { getOfficeExternalId, raise } from './utils'

import { CreateUserInputInternal } from '@opencrvs/commons'
import { createInitialisationClient } from './initialisation-client'
import { ListSchema, describeParseFailure, readString } from './parse-seed-data'
import {
  CREATING_INITIAL_USERS,
  PartialSeedError,
  describeInitialUserFailure,
  formatSeedFailure,
  formatUnwrittenFailure
} from './seed-failure'
import { InitialUserRef } from './seed-report'
import { Read, validatedContents } from './read'

const UserRecordSchema = z
  .strictObject({
    primaryOfficeId: z.string().min(1),
    givenNames: z.string().min(1),
    familyName: z.string().min(1),
    role: z.string().min(1),
    username: CreateUserInputInternal.shape.username,
    password: z.string().min(1),
    mobile: z.string().optional(),
    email: CreateUserInputInternal.shape.email
  })
  .refine((user) => Boolean(user.mobile) || Boolean(user.email), {
    message: 'must provide at least one of email or mobile',
    path: []
  })
  .transform(({ familyName, givenNames, ...user }) => ({
    ...user,
    firstname: givenNames,
    surname: familyName
  }))

/** What the write path sends for one initial user. Carries the password. */
export type UserPayload = z.output<typeof UserRecordSchema>

/**
 * One initial user that parsed. `position` travels with it because a problem
 * another module finds still has to name it, and a report names an initial
 * user by where it sits in the seed-data.
 */
export interface ParsedUser {
  position: number
  username: string
  email?: string
  mobile?: string
  /** A compound reference, not the office's own id. */
  primaryOfficeId: string
  role: string
  payload: UserPayload
}

/**
 * What a check sees: an initial user without its payload, so no check can put
 * a password in a report. A `ParsedUser[]` satisfies this, so the narrowing
 * costs the caller nothing.
 */
export type CheckedUser = Omit<ParsedUser, 'payload'>

const UNIQUE_USER_FIELDS = ['email', 'mobile', 'username'] as const

export type UniqueUserField = (typeof UNIQUE_USER_FIELDS)[number]

export type UserProblem =
  | { kind: 'userListUnparsed'; message: string }
  | { kind: 'userUnparsed'; user: InitialUserRef; message: string }
  | {
      kind: 'duplicateUserField'
      user: InitialUserRef
      field: UniqueUserField
      value: string
      /** The position of the initial user that claimed the value first. */
      firstSeenAt: number
    }

export type UserRead = Read<{ users: ParsedUser[] }, UserProblem>

/** How a report names one initial user. Positions are 1-based. */
export function identifyUser({
  position,
  username
}: CheckedUser): InitialUserRef {
  return { position, username }
}

/** Named one by one rather than spread, so that renaming a field on the schema
 * without telling the checks is a compile error rather than a check that
 * silently stops finding anything. Also keeps the password out of the entity's
 * checked half. */
function toParsed(user: UserPayload, position: number): ParsedUser {
  return {
    position,
    username: user.username,
    email: user.email,
    mobile: user.mobile,
    primaryOfficeId: user.primaryOfficeId,
    role: user.role,
    payload: user
  }
}

/** `normalise` mirrors how the write path compares the field, so both agree on
 * what a duplicate is: emails and usernames are lowercased on write, mobile
 * numbers are stored verbatim. */
const NORMALISE: Record<UniqueUserField, (value: string) => string> = {
  email: (value) => value.toLowerCase(),
  mobile: (value) => value,
  username: (value) => value.toLowerCase()
}

function duplicatesOf(
  users: CheckedUser[],
  field: UniqueUserField
): UserProblem[] {
  const problems: UserProblem[] = []
  const firstSeenAt = new Map<string, number>()
  const normalise = NORMALISE[field]

  for (const user of users) {
    const value = user[field]

    if (value === undefined) {
      continue
    }

    const key = normalise(value)
    const original = firstSeenAt.get(key)

    if (original === undefined) {
      firstSeenAt.set(key, user.position)
      continue
    }

    problems.push({
      kind: 'duplicateUserField',
      user: identifyUser(user),
      field,
      value,
      firstSeenAt: original
    })
  }

  return problems
}

/** Field by field rather than user by user, so that one initial user with
 * three duplicated fields reads as three problems. */
function duplicateUserFields(users: CheckedUser[]): UserProblem[] {
  return UNIQUE_USER_FIELDS.flatMap((field) => duplicatesOf(users, field))
}

export function parseUsers(document: unknown): UserRead {
  const list = ListSchema.safeParse(document)

  if (!list.success) {
    return {
      readable: false,
      problem: {
        kind: 'userListUnparsed',
        message: describeParseFailure(list.error)
      }
    }
  }

  const users: ParsedUser[] = []
  const problems: UserProblem[] = []

  list.data.forEach((record, index) => {
    const position = index + 1
    const parsed = UserRecordSchema.safeParse(record)

    if (parsed.success) {
      users.push(toParsed(parsed.data, position))
      return
    }

    problems.push({
      kind: 'userUnparsed',
      // Nothing else about an entry that did not parse can be trusted.
      user: { position, username: readString(record, 'username') },
      message: describeParseFailure(parsed.error)
    })
  })

  return {
    readable: true,
    users,
    problems: [...problems, ...duplicateUserFields(users)]
  }
}

export async function readUsers(token: string): Promise<UserRead> {
  const url = new URL('config/users', env.COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    raise(formatUnwrittenFailure(`Expected to get the users from ${url}`))
  }

  return parseUsers(await res.json())
}

/** The initial users a check may read. Empty where the list did not parse,
 * which stands every check that reads them down. */
export function getParsedUsers(read: UserRead): CheckedUser[] {
  return read.readable ? read.users : []
}

/** The payloads to write, which only exist once validation has passed. */
export function toUserPayloads(read: UserRead): UserPayload[] {
  return validatedContents(read, 'The initial users').users.map(
    ({ payload }) => payload
  )
}

async function userAlreadyExists(
  token: string,
  username: string
): Promise<boolean> {
  const client = createInitialisationClient(token)

  const res = await client.users.search.query({
    username,
    count: 1,
    skip: 0,
    sortOrder: 'asc'
  })

  return Boolean(res.length)
}

async function createUser(token: string, userPayload: CreateUserInputInternal) {
  const client = createInitialisationClient(token)
  return client.users.create.mutate(userPayload)
}

/** Validation has already passed, so a failure here lands with earlier users
 * in the database. Each entry is attempted inside a handler because this is
 * the one place that knows which initial user it is. */
export async function seedUsers(token: string, users: UserPayload[]) {
  for (const [index, userMetadata] of users.entries()) {
    const {
      firstname,
      surname,
      primaryOfficeId: officeIdentifier,
      username,
      ...user
    } = userMetadata

    try {
      if (await userAlreadyExists(token, username)) {
        // eslint-disable-next-line no-console
        console.log(
          `User with the username "${username}" already exists. Skipping user "${username}"`
        )
        continue
      }

      const externalId = getOfficeExternalId(officeIdentifier)

      const client = createInitialisationClient(token)

      const [primaryOffice] = await client.locations.list.query({
        externalId
      })

      if (!primaryOffice) {
        // Validation proved this office is declared, so a miss here is a bug
        // in the seeder, not something an operator can act on.
        throw new Error(
          `Office "${externalId}" passed validation but is not in the database`
        )
      }

      const userPayload = {
        ...user,
        name: {
          firstname,
          surname
        },
        ...(env.ACTIVATE_USERS && { status: 'active' as const }),
        primaryOfficeId: primaryOffice.id,
        username
      }

      await createUser(token, userPayload)
    } catch (error) {
      throw new PartialSeedError(
        formatSeedFailure({
          headline: CREATING_INITIAL_USERS,
          subject: {
            about: 'initialUser',
            // 1-based, matching how a problem identifies an initial user.
            user: { position: index + 1, username }
          },
          reason: describeInitialUserFailure(error, user)
        })
      )
    }
  }
}
