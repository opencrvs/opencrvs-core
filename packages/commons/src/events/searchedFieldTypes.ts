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
import { EventConfig, VersionedEventConfig } from './EventConfig'
import { ClauseOutput } from './DeduplicationConfig'
import { everyVersionHasOneDeclareAction, findAllFields } from './utils'
import { findFieldOfPath } from './fieldPath'

/** The fields that a deduplication query reads or matches against. */
function getClauseFieldPaths(clause: ClauseOutput): string[] {
  if (clause.type === 'not') {
    return getClauseFieldPaths(clause.clause)
  }
  if (clause.type === 'and' || clause.type === 'or') {
    return clause.clauses.flatMap(getClauseFieldPaths)
  }
  return [clause.fieldId, ...[clause.options.matchAgainst ?? []].flat()]
}

/** The fields that advanced search and the deduplication configs of `versions` use. */
function getSearchedFieldPaths(
  advancedSearch: VersionedEventConfig['advancedSearch'],
  versions: EventConfig[]
) {
  const searchPaths = advancedSearch
    .flatMap((section) => section.fields)
    .flatMap((field) => [field.fieldId, ...(field.config.searchFields ?? [])])
  const deduplicationPaths = versions
    .flatMap((version) => version.actions)
    .flatMap((action) =>
      'deduplication' in action && action.deduplication
        ? getClauseFieldPaths(action.deduplication.query)
        : []
    )
  return [...searchPaths, ...deduplicationPaths]
}

/**
 * Rejects a field whose type differs between versions when advanced search or a
 * deduplication config uses it. The records of each version are indexed with the type
 * of their own version, so a search with one type does not find the records of the other.
 *
 * @param versionConfigs the event config of each of `config.versions`, in the same order
 */
export function validateSearchedFieldTypes(
  config: Pick<VersionedEventConfig, 'advancedSearch' | 'versions'>,
  versionConfigs: EventConfig[],
  ctx: Pick<z.RefinementCtx<unknown>, 'addIssue'>
) {
  if (!everyVersionHasOneDeclareAction(versionConfigs)) {
    return
  }

  const fieldsOfVersions = versionConfigs.map(findAllFields)
  const allFields = fieldsOfVersions.flat()
  // A part of a field, such as `child.name.firstname`, uses the field `child.name`.
  const searchedFieldIds = new Set(
    getSearchedFieldPaths(config.advancedSearch, versionConfigs).flatMap(
      (path) => findFieldOfPath(path, allFields)?.field.id ?? []
    )
  )

  for (const fieldId of searchedFieldIds) {
    const typeInVersions = fieldsOfVersions.flatMap((fields, index) => {
      const field = fields.find(({ id }) => id === fieldId)
      return field
        ? [{ type: field.type, version: config.versions[index].id }]
        : []
    })
    const [first] = typeInVersions
    const other = typeInVersions.find(({ type }) => type !== first.type)
    if (other) {
      ctx.addIssue({
        code: 'custom',
        message: `Field ${fieldId} is a ${first.type} field in version ${first.version} and a ${other.type} field in version ${other.version}. Advanced search or deduplication uses the field, so it must have the same type in every version. Give the field of the new type a new id.`,
        path: ['versions']
      })
    }
  }
}
