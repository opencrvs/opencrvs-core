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

import {
  decodeScope,
  EventConfig,
  joinUrl,
  parseConfigurableScope,
  EncodedScope,
  CreateUserInputInternal
} from '@opencrvs/commons'
import { fromZodError } from 'zod-validation-error'
import { createInitialisationClient } from './initialisation-client'
import { officeExternalId } from './office-external-id'
import {
  PartialSeedError,
  describeInitialUserFailure,
  formatInitialUserFailure,
  formatUnwrittenFailure
} from './seed-failure'
import { SeedData, SeedDataRole, SeedDataUser } from './validate-seed-data'

const RoleRecordSchema = (eventIds: string[]) =>
  z.object({
    id: z.string(),
    label: z.object({
      defaultMessage: z.string(),
      description: z.string(),
      id: z.string()
    }),
    scopes: z.array(
      EncodedScope.superRefine((scope, ctx) => {
        const parsedConfigurableScope = parseConfigurableScope(scope)
        const parsedV2Scopes = decodeScope(scope)

        if (!parsedConfigurableScope && !parsedV2Scopes) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid scope: "${scope}"`
          })
          return
        }

        if (parsedV2Scopes?.type) {
          if (!('options' in parsedV2Scopes)) {
            return
          }

          const options = parsedV2Scopes.options

          if (options && 'event' in options && Array.isArray(options.event)) {
            const invalidEventIds = options.event.filter(
              (id) => !eventIds.includes(id)
            )

            if (invalidEventIds.length > 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Scope "${scope}" contains invalid event IDs: ${invalidEventIds.join(', ')}`
              })
            }
          }
        }
      })
    )
  })

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

/** Parsing a list and parsing its elements are separate steps, so that one bad
 * element does not take the whole document down with it. */
const ListSchema = z.array(z.unknown())

export type SeedUsers = z.output<typeof UserRecordSchema>[]

type UserSeedData = Omit<
  SeedData,
  'administrativeAreas' | 'locations' | 'PHONE_NUMBER_PATTERN'
>

/** As text, not as the error: a `ZodError` reaching `console.error` prints as
 * a stack trace, where the report needs one line. */
function describeParseFailure(error: z.ZodError): string {
  return fromZodError(error, { prefix: null }).message
}

/** A field read back off a record that did not parse. Nothing else about such
 * a record can be trusted. */
function readString(record: unknown, field: string): string | undefined {
  if (typeof record !== 'object' || record === null) {
    return undefined
  }

  const value = (record as Record<string, unknown>)[field]

  return typeof value === 'string' ? value : undefined
}

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

function parseRoles(roles: unknown[], eventIds: string[]): SeedDataRole[] {
  const schema = RoleRecordSchema(eventIds)

  return roles.map((role) => {
    const parsed = schema.safeParse(role)

    return parsed.success
      ? { id: parsed.data.id, scopes: parsed.data.scopes }
      : {
          id: readString(role, 'id'),
          scopes: [],
          malformed: describeParseFailure(parsed.error)
        }
  })
}

/** The initial users and the roles, fetched and parsed but not written and
 * nothing about them judged here; the validator answers everything in one
 * report. A failing *fetch* is still fatal: there is nothing to report on. */
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

  const rolesUrl = joinUrl(env.COUNTRY_CONFIG_HOST, 'config/roles')
  const eventsUrl = joinUrl(env.COUNTRY_CONFIG_HOST, 'config/events')

  const [rolesResponse, eventsResponse] = await Promise.all([
    fetch(rolesUrl),
    fetch(eventsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  ])

  if (!rolesResponse.ok) {
    raise(
      formatUnwrittenFailure(`Error fetching roles: ${rolesResponse.status}`)
    )
  }

  if (!eventsResponse.ok) {
    raise(
      formatUnwrittenFailure(`Error fetching events: ${eventsResponse.status}`)
    )
  }

  const eventsConfig = (await eventsResponse.json()) as EventConfig[]
  const eventIds = eventsConfig.map((event) => event.id)
  const roleList = ListSchema.safeParse(await rolesResponse.json())

  return {
    users: records.users,
    seedData: {
      users: records.seedData,
      roles: roleList.success ? parseRoles(roleList.data, eventIds) : [],
      malformedUserList: userList.success
        ? undefined
        : describeParseFailure(userList.error),
      malformedRoleList: roleList.success
        ? undefined
        : describeParseFailure(roleList.error)
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
 * the one place that knows both which record it is and how far the run got. */
export async function seedUsers(token: string, users: SeedUsers) {
  let created = 0

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
        formatInitialUserFailure({
          // 1-based, matching how the validator identifies a record.
          record: { position: index + 1, username },
          reason: describeInitialUserFailure(error, user),
          // Skipped users are not counted; they were not created.
          created,
          total: users.length
        })
      )
    }

    created = created + 1
  }
}
