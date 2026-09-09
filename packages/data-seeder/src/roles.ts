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
import { Read } from './read'

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

export interface ParsedRole {
  position: number
  id: string
  scopes: EncodedScope[]
}

/** How a report names one role: by its id where it has a readable one, and by
 * its position otherwise. */
interface RoleRef {
  position: number
  id?: string
}

export type RoleProblem =
  | { kind: 'roleListUnparsed'; message: string }
  | { kind: 'roleUnparsed'; role: RoleRef; message: string }
  | { kind: 'duplicateRoleId'; id: string }

export type RoleRead = Read<{ roles: ParsedRole[] }, RoleProblem>

/**
 * A role the country config declares. `scopes` is absent where the role did
 * not parse: the role exists and is named, so an initial user referring to it
 * is not referring to something undeclared, but what it grants is unknown.
 */
export interface DeclaredRole {
  id: string
  scopes?: EncodedScope[]
}

function readRole(
  record: unknown,
  position: number,
  schema: ReturnType<typeof RoleRecordSchema>
): ParsedRole | RoleProblem {
  const parsed = schema.safeParse(record)

  return parsed.success
    ? { position, id: parsed.data.id, scopes: parsed.data.scopes }
    : {
        kind: 'roleUnparsed',
        role: { position, id: readString(record, 'id') },
        message: describeParseFailure(parsed.error)
      }
}

function duplicateRoleIds(roles: ParsedRole[]): RoleProblem[] {
  const seen = new Set<string>()
  const reported = new Set<string>()
  const problems: RoleProblem[] = []

  for (const { id } of roles) {
    if (!seen.has(id)) {
      seen.add(id)
      continue
    }

    if (reported.has(id)) {
      continue
    }

    reported.add(id)
    problems.push({ kind: 'duplicateRoleId', id })
  }

  return problems
}

export function parseRoles(document: unknown, eventIds: string[]): RoleRead {
  const list = ListSchema.safeParse(document)

  if (!list.success) {
    return {
      readable: false,
      problem: {
        kind: 'roleListUnparsed',
        message: describeParseFailure(list.error)
      }
    }
  }

  const schema = RoleRecordSchema(eventIds)
  const roles: ParsedRole[] = []
  const problems: RoleProblem[] = []

  list.data.forEach((record, index) => {
    const read = readRole(record, index + 1, schema)

    if ('kind' in read) {
      problems.push(read)
      return
    }

    roles.push(read)
  })

  return {
    readable: true,
    roles,
    problems: [...problems, ...duplicateRoleIds(roles)]
  }
}

export async function readRoles(token: string): Promise<RoleRead> {
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

  return parseRoles(
    await rolesResponse.json(),
    eventsConfig.map((event) => event.id)
  )
}

export function parsedRoles(read: RoleRead): ParsedRole[] {
  return read.readable ? read.roles : []
}

/**
 * Which roles the country config declares: it includes roles that did
 * not parse but are still named, so that a check elsewhere cannot
 * mistake a broken role for an absent one.
 */
export function getDeclaredRoles(read: RoleRead): Map<string, DeclaredRole> {
  if (!read.readable) {
    return new Map()
  }

  const declared = new Map<string, DeclaredRole>(
    read.roles.map((role) => [role.id, { id: role.id, scopes: role.scopes }])
  )

  for (const problem of read.problems) {
    if (problem.kind !== 'roleUnparsed' || problem.role.id === undefined) {
      continue
    }

    if (!declared.has(problem.role.id)) {
      declared.set(problem.role.id, { id: problem.role.id })
    }
  }

  return declared
}
