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
import {
  decodeScope,
  EncodedScope,
  EventConfig,
  joinUrl
} from '@opencrvs/commons'
import fetch from 'node-fetch'
import { z } from 'zod'
import { env } from './environment'
import { ListSchema, describeParseFailure, readString } from './parse-seed-data'
import { formatUnwrittenFailure } from './seed-failure'
import { raise } from './utils'
import { SeedData, SeedDataRole } from './seed-data'

const RoleRecordSchema = (eventIds: string[]) =>
  z.object({
    id: z.string().min(1),
    label: z.object({
      defaultMessage: z.string().min(1),
      description: z.string(),
      id: z.string().min(1)
    }),
    scopes: z.array(
      EncodedScope.superRefine((scope, ctx) => {
        const parsedScope = decodeScope(scope)

        if (!parsedScope) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid scope: "${scope}"`
          })
          return
        }

        if (!('options' in parsedScope)) {
          return
        }

        const options = parsedScope.options

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
): Promise<{ seedData: Pick<SeedData, 'roles' | 'roleListError'> }> {
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
      roleListError: roleList.success
        ? undefined
        : describeParseFailure(roleList.error)
    }
  }
}
