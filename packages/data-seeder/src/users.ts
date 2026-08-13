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
import { raise } from './utils'

import { CreateUserInputInternal } from '@opencrvs/commons'
import { createInitialisationClient } from './initialisation-client'
import { officeExternalId } from './office-external-id'
import { ListSchema, describeParseFailure, readString } from './parse-seed-data'
import {
  CREATING_INITIAL_USERS,
  PartialSeedError,
  describeInitialUserFailure,
  formatSeedFailure,
  formatUnwrittenFailure
} from './seed-failure'
import { SeedData, SeedDataUser } from './validate-seed-data'

const WithoutContact = z.object({
  primaryOfficeId: z.string(),
  givenNames: z.string(),
  familyName: z.string(),
  role: z.string(),
  username: z.string(),
  password: z.string()
})

const UserRecordSchema = WithoutContact.extend({
  mobile: z.string(),
  email: z.string().email().optional()
})
  .or(
    WithoutContact.extend({
      email: z.string().email(),
      mobile: z.string().optional()
    })
  )
  .transform(({ familyName, givenNames, ...user }) => ({
    ...user,
    firstname: givenNames,
    surname: familyName
  }))

export type SeedUsers = z.output<typeof UserRecordSchema>[]

type UserSeedData = Pick<SeedData, 'users' | 'malformedUserList'>

/** Named one by one rather than spread, so that renaming a field on the schema
 * without telling the validator is a compile error rather than a check that
 * silently stops finding anything. Also keeps the password out of seed-data. */
function readParsed(user: SeedUsers[number]): SeedDataUser {
  return {
    username: user.username,
    email: user.email,
    mobile: user.mobile,
    primaryOfficeId: user.primaryOfficeId,
    role: user.role
  }
}

/** A record that did not parse keeps its place in `seedData`, so the records
 * after it keep the positions the report will name them by, and is left out of
 * `users`, which is what would be written. */
function parseRecords(records: unknown[]): {
  users: SeedUsers
  seedData: SeedDataUser[]
} {
  const users: SeedUsers = []
  const seedData: SeedDataUser[] = []

  for (const record of records) {
    const parsed = UserRecordSchema.safeParse(record)

    if (parsed.success) {
      users.push(parsed.data)
      seedData.push(readParsed(parsed.data))
      continue
    }

    seedData.push({
      username: readString(record, 'username'),
      role: readString(record, 'role'),
      malformed: describeParseFailure(parsed.error)
    })
  }

  return { users, seedData }
}

/** The initial users, fetched and parsed but not written and nothing about them
 * judged here; the validator answers everything in one report. A failing
 * *fetch* is still fatal: there is nothing to report on. */
export async function getUsers(
  token: string
): Promise<{ users: SeedUsers; seedData: UserSeedData }> {
  const url = new URL('config/users', env.COUNTRY_CONFIG_HOST).toString()
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

  const userList = ListSchema.safeParse(await res.json())
  const records = parseRecords(userList.success ? userList.data : [])

  return {
    users: records.users,
    seedData: {
      users: records.seedData,
      malformedUserList: userList.success
        ? undefined
        : describeParseFailure(userList.error)
    }
  }
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
 * in the database. Each record is attempted inside a handler because this is
 * the one place that knows which record it is. */
export async function seedUsers(token: string, users: SeedUsers) {
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

      const externalId = officeExternalId(officeIdentifier)

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
            about: 'record',
            // 1-based, matching how the validator identifies a record.
            record: { position: index + 1, username }
          },
          reason: describeInitialUserFailure(error, user)
        })
      )
    }
  }
}
