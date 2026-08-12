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

/**
 * Anything the country config served as a list, before any of its elements
 * have been looked at. Parsing a list of records and parsing each record are
 * separate steps so that one bad element is reported as one bad element rather
 * than taking the whole document down with it.
 */
const ListSchema = z.array(z.unknown())

/** The initial users of a set of seed-data, parsed and ready to be written. */
export type SeedUsers = z.output<typeof UserRecordSchema>[]

/**
 * The half of a set of seed-data this module fetches: the initial users and
 * the roles they are given, in the shape the validator reads them in.
 */
type UserSeedData = Omit<
  SeedData,
  'administrativeAreas' | 'locations' | 'PHONE_NUMBER_PATTERN'
>

/**
 * Why something the country config served did not parse, as text.
 *
 * As text, and not as the error: a `ZodError` reaching `console.error` prints
 * as a stack trace over many lines, which is how an operator with a typo'd
 * record used to be answered while an operator with a duplicate email got a
 * line of prose. Every parse failure now becomes one line of the one report —
 * see `./validate-seed-data.ts` — and this is where it turns into words.
 */
function describeParseFailure(error: z.ZodError): string {
  return fromZodError(error, { prefix: null }).message
}

/** A field read back off a record that did not parse, when it is there and is
 * a string. Nothing else about such a record can be trusted. */
function readString(record: unknown, field: string): string | undefined {
  if (typeof record !== 'object' || record === null) {
    return undefined
  }

  const value = (record as Record<string, unknown>)[field]

  return typeof value === 'string' ? value : undefined
}

/**
 * Every initial user record the country config served, parsed one at a time.
 *
 * One at a time, because the whole point of a report is that it lists what is
 * wrong with every record: parsing the list as a unit means one bad record
 * hides the rest. A record that did not parse keeps its place in `seedData`,
 * so the records after it keep the positions the operator will find them at,
 * and it is left out of `users`, which is what would be written.
 */
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
      seedData.push(parsed.data)
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

/** Every role the country config served, parsed one at a time and for the same
 * reason: one unreadable role is one line of the report, not the end of it. */
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

/**
 * The initial users and the roles the country config declares, fetched and
 * parsed but not written, and nothing about them judged here. Fetching is
 * separate from writing so that the entry point can validate the whole set of
 * seed-data before any of it reaches the database — see
 * `./validate-seed-data.ts`.
 *
 * The five checks that used to end the run from here the moment they fired —
 * a record that would not parse, a role list that would not parse, a role no
 * declared role matched, a duplicated role id, and the requirement that
 * somebody be able to configure the seeded system — are checks no longer.
 * What this function does instead is hand the validator what those checks need
 * and let all of them be answered in the one report, in the one style, in the
 * one run. A *fetch* that fails is still fatal here: there is no seed-data to
 * report on, so there is nothing to accumulate.
 *
 * Nothing here writes, so every failure it reports ends `nothing was seeded`:
 * the operator's database is still clean and there is nothing to clear. See
 * `./seed-failure.ts` for the other side of that line.
 */
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

/**
 * Creates every initial user, one call at a time.
 *
 * Pre-flight validation has already passed by the time this runs, so a failure
 * here is a constraint violation, a network fault, or drift between validating
 * and writing — rare, but not impossible, and it lands with earlier users
 * already in the database. Each record is therefore attempted inside a handler
 * that knows which record it is and how many were created before it, since
 * that is the one moment where those two facts are both in hand. Everything
 * the operator then reads is rendered by `./seed-failure.ts`, and the
 * `PartialSeedError` is what tells the entry point that writing had begun.
 */
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
          // 1-based, and the same identity the validator reports a problem
          // against, so one record reads the same in both reports.
          record: { position: index + 1, username },
          reason: describeInitialUserFailure(error, user),
          // Skipped users are not counted: the line says how many were
          // created, and a skipped one was not.
          created,
          total: users.length
        })
      )
    }

    created = created + 1
  }
}
