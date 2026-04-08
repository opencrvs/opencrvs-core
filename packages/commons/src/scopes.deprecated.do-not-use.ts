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

// TODO CIHAN: this whole file!!!

/**
 * @deprecated - will be removed in v2.1.
 * Configurable scopes are for example:
 * user.create[role=first-role|second-role]
 * record.notify[event=birth]
 * record.registered.print-certified-copies[event=birth|tennis-club-membership]
 */
const rawConfigurableScopeRegex =
  /^([a-zA-Z][a-zA-Z0-9.-]*(?:\.[a-zA-Z0-9.-]+)*)\[((?:\w+=[\w.-]+(?:\|[\w.-]+)*)(?:,[\w]+=[\w.-]+(?:\|[\w.-]+)*)*)\]$/

/**
 * @deprecated - will be removed in v2.1.
 */
const rawConfigurableScope = z.string().regex(rawConfigurableScopeRegex)

const SearchScope = z.object({
  type: z.literal('search'),
  options: z.object({
    event: z.array(z.string()).length(1),
    access: z.array(z.enum(['my-jurisdiction', 'all'])).length(1)
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const CreateUserScope = z.object({
  type: z.literal('user.create'),
  options: z.object({
    role: z.array(z.string())
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const EditUserScope = z.object({
  type: z.literal('user.edit'),
  options: z.object({
    role: z.array(z.string())
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const WorkqueueScope = z.object({
  type: z.literal('workqueue'),
  options: z.object({
    id: z.array(z.string())
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const PrintCertifiedCopiesScope = z.object({
  type: z.literal('record.registered.print-certified-copies'),
  options: z.object({
    event: z.array(z.string()).describe('Event type, e.g. birth, death'),
    templates: z
      .array(z.string())
      .optional()
      .describe(
        'Template IDs for certified copies. If not provided, all templates will be used.'
      )
  })
})

/**
 * Legacy record scopes are not supported in 2.0.
 * They are solely for migration purposes.
 * @deprecated - will be removed in v2.1.
 */
const LegacyRecordScope = z
  .object({
    type: z.enum([
      'record.create',
      'record.read',
      'record.declare',
      'record.notify',
      'record.declared.edit',
      'record.declared.validate',
      'record.declared.reject',
      'record.declared.archive',
      'record.declared.review-duplicates',
      'record.register',
      'record.registered.request-correction',
      'record.registered.correct',
      'record.unassign-others'
    ]),
    options: z.object({
      event: z.array(z.string()).describe('Event type, e.g. birth, death')
    })
  })
  .describe(
    "Scopes used to check user's permission to perform actions on a record."
  )

/**
 * @deprecated - will be removed in v2.1.
 */
const ConfigurableRawScopes = z.discriminatedUnion('type', [
  SearchScope,
  LegacyRecordScope,
  PrintCertifiedCopiesScope,
  CreateUserScope,
  EditUserScope,
  WorkqueueScope
])

type ConfigurableRawScopes = z.infer<typeof ConfigurableRawScopes>
type ConfigurableScopeType = ConfigurableRawScopes['type']

type ConfigurableScopes = Exclude<ConfigurableRawScopes, { type: 'search' }>

type FlattenedSearchScope = {
  type: 'search'
  options: Record<string, 'my-jurisdiction' | 'all'>
}

/**
 * @deprecated will be removed in v2.1.
 *
 */
export function findScope<T extends ConfigurableScopeType>(
  scopes: string[],
  scopeType: T
) {
  const parsedScopes = scopes.map(parseConfigurableScope)
  const searchScopes = parsedScopes.filter((scope) => scope?.type === 'search')
  const otherScopes = parsedScopes.filter((scope) => scope?.type !== 'search')
  const mergedSearchScope = flattenAndMergeScopes(searchScopes)

  return [...otherScopes, mergedSearchScope].find(
    (scope): scope is Extract<ConfigurableScopes, { type: T }> =>
      scope?.type === scopeType
  )
}
/**
 * @deprecated will be removed in v2.1.
 * Parses a raw options string for non-search scopes (e.g., workqueues).
 * @param rawOptions - The raw string, e.g. "event=birth|club-reg,all"
 * @returns An object like: { event: ['birth', 'club-reg'], access: ['all'] }
 */

function flattenAndMergeScopes(
  scopes: Extract<ConfigurableRawScopes, { type: 'search' }>[]
): FlattenedSearchScope | null {
  if (scopes.length === 0) return null

  const type = scopes[0].type // all scopes have same `type`
  const mergedOptions: Record<string, 'my-jurisdiction' | 'all'> = {}

  for (const scope of scopes) {
    const entries = Object.entries(scope.options)

    if (entries.length < 2) continue

    // Assumes the first key (e.g., 'event') holds source values like ['birth', 'death']
    const sourceValues = entries[0][1]

    // Assumes the second key (e.g., 'access') holds corresponding target values like ['my-jurisdiction', 'all']
    const targetValues = entries[1][1]

    for (let i = 0; i < sourceValues.length; i++) {
      mergedOptions[sourceValues[i]] = targetValues[i] as
        | 'my-jurisdiction'
        | 'all'
    }
  }

  return { type, options: mergedOptions }
}

/**
 * @deprecated - will be removed in v2.1.
 */
function getScopeOptions(rawOptions: string) {
  return rawOptions
    .split(',')
    .reduce((acc: Record<string, string[]>, option) => {
      const [key, value] = option.split('=')
      acc[key] = value.split('|')
      return acc
    }, {})
}

/**
 * @deprecated - Remove on 2.1.
 * Parses a configurable scope string into a ConfigurableRawScopes object.
 * @param {string} scope - The scope string to parse
 * @returns {ConfigurableRawScopes | undefined} The parsed scope object if valid, undefined otherwise
 * @example
 * parseScope("user.create[role=field-agent|registration-agent]")
 * // Returns: { type: "user.create", options: { role: ["field-agent", "registration-agent"] } }
 */
export function parseConfigurableScope(scope: string) {
  const maybeConfigurableScope = rawConfigurableScope.safeParse(scope)

  if (!maybeConfigurableScope.success) {
    return
  }

  const rawScope = maybeConfigurableScope.data
  const [, type, rawOptions] = rawScope.match(rawConfigurableScopeRegex) ?? []

  // Different options are separated by commas, and each option value is separated by a pipe e.g.:
  // record.digitise[event=birth|tennis-club-membership, my-jurisdiction]
  const options = getScopeOptions(rawOptions)

  const parsedScope = {
    type,
    options
  }

  const result = ConfigurableRawScopes.safeParse(parsedScope)
  return result.success ? result.data : undefined
}
