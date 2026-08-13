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

/**
 * The country config's roles, fetched and parsed but not written and nothing
 * about them judged here; the validator answers everything in one report. A
 * failing *fetch* is still fatal: there is nothing to report on.
 *
 * The event configuration is fetched alongside them, which looks like a stray
 * dependency and is not: event ids parameterise the role schema, because a
 * scope may name the events it applies to and those must be events the country
 * config declares. It is fetched for role validation and for nothing else.
 */
import {
  decodeScope,
  EncodedScope,
  EventConfig,
  joinUrl,
  parseConfigurableScope
} from '@opencrvs/commons'
import fetch from 'node-fetch'
import { z } from 'zod'
import { env } from './environment'
import { ListSchema, describeParseFailure, readString } from './parse-seed-data'
import { formatUnwrittenFailure } from './seed-failure'
import { raise } from './utils'
import { SeedData, SeedDataRole } from './validate-seed-data'

type RoleSeedData = Pick<SeedData, 'roles' | 'malformedRoleList'>

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

export async function getRoles(
  token: string
): Promise<{ seedData: RoleSeedData }> {
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
    seedData: {
      roles: roleList.success ? parseRoles(roleList.data, eventIds) : [],
      malformedRoleList: roleList.success
        ? undefined
        : describeParseFailure(roleList.error)
    }
  }
}
