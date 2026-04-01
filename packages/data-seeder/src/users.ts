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
  parseConfigurableScope
} from '@opencrvs/commons'
import { parseLiteralScope } from '@opencrvs/commons/authentication'
import { fromZodError } from 'zod-validation-error'
import { createClient } from '@opencrvs/toolkit/api'

const RoleSchema = (eventIds: string[]) =>
  z.array(
    z.object({
      id: z.string(),
      label: z.object({
        defaultMessage: z.string(),
        description: z.string(),
        id: z.string()
      }),
      scopes: z.array(
        z.string().superRefine((scope, ctx) => {
          const parsedLiteralScope = parseLiteralScope(scope)
          const parsedConfigurableScope = parseConfigurableScope(scope)
          const parsedV2Scopes = decodeScope(scope)

          if (
            !parsedLiteralScope &&
            !parsedConfigurableScope &&
            !parsedV2Scopes
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Invalid scope: "${scope}"`
            })
            return
          }

          if (parsedV2Scopes?.type) {
            const options = parsedV2Scopes.options

            if (options?.event && Array.isArray(options.event)) {
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
  )

const WithoutContact = z.object({
  primaryOfficeId: z.string(),
  givenNames: z.string(),
  familyName: z.string(),
  role: z.string(),
  username: z.string(),
  password: z.string()
})

const UserSchema = z.array(
  WithoutContact.extend({
    mobile: z.string(),
    email: z.string().email().optional()
  }).or(
    WithoutContact.extend({
      email: z.string().email(),
      mobile: z.string().optional()
    })
  )
)

async function getUsers(token: string) {
  const url = new URL('config/users', env.COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  if (!res.ok) {
    raise(`Expected to get the users from ${url}`)
  }

  const parsedUsers = UserSchema.safeParse(await res.json())

  if (!parsedUsers.success) {
    raise(
      fromZodError(parsedUsers.error, {
        prefix: `Error validating users metadata returned from ${url}`
      })
    )
  }

  const userRoles = parsedUsers.data.map((user) => user.role)

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

  if (!rolesResponse.ok) raise(`Error fetching roles: ${rolesResponse.status}`)
  if (!eventsResponse.ok)
    raise(`Error fetching events: ${eventsResponse.status}`)

  const eventsConfig = (await eventsResponse.json()) as EventConfig[]
  const eventIds = eventsConfig.map((event) => event.id)

  const parsedRoles = RoleSchema(eventIds).safeParse(await rolesResponse.json())

  if (!parsedRoles.success) {
    console.log('parsedRoles. :>> ', parsedRoles.error)
    raise(
      fromZodError(parsedRoles.error, {
        prefix: `Validation failed for roles returned from ${rolesUrl}`
      }).message
    )
  }

  const allRoles = parsedRoles.data

  let isConfigUpdateAllScopeAvailable = false
  const configScope = 'config.update:all' as const

  for (const userRole of userRoles) {
    const currRole = allRoles.find((role) => role.id === userRole)
    if (!currRole)
      raise(`Role with id ${userRole} is not found in roles.ts file`)
    if (currRole.scopes.includes(configScope))
      isConfigUpdateAllScopeAvailable = true
  }

  const seen = new Set<string>()
  const duplicates: string[] = []

  for (const role of allRoles) {
    if (seen.has(role.id)) {
      duplicates.push(role.id)
    } else {
      seen.add(role.id)
    }
  }

  if (duplicates.length > 0) {
    raise(`Duplicate role ids found: ${duplicates.join(', ')}`)
  }

  if (!isConfigUpdateAllScopeAvailable) {
    raise(`At least one user with ${configScope} scope must be created`)
  }
  return parsedUsers.data
}

async function userAlreadyExists(
  token: string,
  username: string
): Promise<boolean> {
  const url = new URL('events', env.GATEWAY_HOST).toString()
  const client = createClient(url, `Bearer ${token}`)
  const res = await client.user.search.query({
    username,
    count: 1,
    skip: 0,
    sortOrder: 'asc'
  })
  return Boolean(res.length)
}

async function createUser(token: string, userPayload: any) {
  const url = new URL('events', env.GATEWAY_HOST).toString()
  const client = createClient(url, `Bearer ${token}`)
  return client.user.create.mutate(userPayload)
}

export async function seedUsers(token: string) {
  const rawUsers = await getUsers(token)

  for (const userMetadata of rawUsers) {
    const {
      givenNames,
      familyName,
      primaryOfficeId: officeIdentifier,
      username,
      ...user
    } = userMetadata

    if (await userAlreadyExists(token, username)) {
      // eslint-disable-next-line no-console
      console.log(
        `User with the username "${username}" already exists. Skipping user "${username}"`
      )
      continue
    }

    const externalId = officeIdentifier.split('_').at(-1)

    const url = new URL('events', env.GATEWAY_HOST).toString()
    const client = createClient(url, `Bearer ${token}`)
    const [primaryOffice] = await client.locations.list.query({
      externalId
    })

    const userPayload = {
      ...user,
      name: [
        {
          use: 'en',
          family: familyName,
          given: [givenNames]
        }
      ],
      ...(env.ACTIVATE_USERS && { status: 'active' }),
      primaryOfficeId: primaryOffice.id,
      username
    }

    await createUser(token, userPayload)
  }
}
