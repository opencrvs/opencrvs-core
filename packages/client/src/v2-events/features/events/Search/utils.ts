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
  AdvancedSearchConfig,
  EventConfig,
  FieldConfig,
  FieldValue,
  QueryInputType,
  SearchField,
  EventFieldId,
  FieldType,
  Inferred,
  QueryExpression,
  QueryType
} from '@opencrvs/commons/client'
import {
  Errors,
  getValidationErrorsForForm
} from '@client/v2-events/components/forms/validation'
import { getAllUniqueFields } from '@client/v2-events/utils'

export const getAdvancedSearchFieldErrors = (
  currentEvent: EventConfig,
  formValues: Record<string, FieldValue>
) => {
  const allUniqueFields = getAllUniqueFields(currentEvent)
  return currentEvent.advancedSearch.reduce(
    (errorsOnFields, currentSection) => {
      const advancedSearchFieldIds = currentSection.fields.map((f) => f.fieldId)
      const advancedSearchFields = allUniqueFields.filter((field) =>
        advancedSearchFieldIds.includes(field.id)
      )

      const modifiedFields = advancedSearchFields.map((f) => ({
        ...f,
        required: false, // advanced search fields need not be required
        validation: formValues[f.id] ? f.validation : [] // need to validate fields only when they are not empty
      }))

      const err = getValidationErrorsForForm(modifiedFields, formValues)

      return {
        ...errorsOnFields,
        ...err
      }
    },
    {}
  )
}

export const flattenFieldErrors = (fieldErrors: Errors) =>
  Object.values(fieldErrors).flatMap((errObj) => errObj.errors)

const defaultSearchFieldGenerator: Record<
  EventFieldId,
  (config: SearchField) => FieldConfig
> = {
  [EventFieldId.enum.trackingId]: (_) => ({
    id: 'event.trackingId',
    type: 'TEXT',
    label: {
      defaultMessage: 'Tracking ID',
      description: 'Label for tracking ID field',
      id: 'v2.advancedSearch.trackingId'
    }
  }),
  [EventFieldId.enum.status]: (config) => ({
    id: 'event.status',
    type: 'SELECT',
    label: {
      defaultMessage: 'Status of record',
      description: 'Label for status field',
      id: 'v2.advancedSearch.status'
    },
    options: config.options ?? []
  })
}

function isEventFieldId(id: string): id is EventFieldId {
  return Object.values(EventFieldId.enum).includes(id as EventFieldId)
}

export const getDefaultSearchFields = (
  section: AdvancedSearchConfig
): FieldConfig[] => {
  const searchFields: FieldConfig[] = []
  section.fields.forEach((fieldConfig) => {
    const fieldId = fieldConfig.fieldId
    if (isEventFieldId(fieldId)) {
      const generator = defaultSearchFieldGenerator[fieldId]
      searchFields.push(generator(fieldConfig))
    }
  })
  return searchFields
}

const RegStatus = {
  Archived: 'ARCHIVED',
  Rejected: 'REJECTED',
  Certified: 'CERTIFIED',
  Registered: 'REGISTERED',
  Validated: 'VALIDATED',
  Declared: 'DECLARED',
  Notified: 'NOTIFIED',
  Created: 'CREATED'
} as const

const MatchType = {
  fuzzy: 'fuzzy',
  exact: 'exact',
  anyOf: 'anyOf',
  range: 'range'
} as const

type Condition =
  | { type: 'fuzzy'; term: string }
  | { type: 'exact'; term: string }
  | { type: 'range'; gte: string; lte: string }
  | { type: 'anyOf'; terms: string[] }

export const ADVANCED_SEARCH_KEY = 'and' as const
export const QUICK_SEARCH_KEY = 'or' as const

function buildCondition(
  value: string,
  type: keyof typeof MatchType = 'exact'
): Condition {
  switch (type) {
    case MatchType.fuzzy:
      return { type: 'fuzzy', term: value }
    case MatchType.exact:
      return { type: 'exact', term: value }
    case MatchType.anyOf:
      return { type: 'anyOf', terms: value.split(',') }
    case MatchType.range:
      const [gte, lte] = value.split(',')
      return { type: 'range', gte, lte }
    default:
      return { type: 'exact', term: value } // Fallback to exact match
  }
}

function buildConditionForStatus(): Condition {
  return { type: 'anyOf', terms: Object.values(RegStatus) }
}

function formatValue(
  rawInput: Record<string, FieldValue>,
  fieldId: string,
  fieldConfig?: FieldConfig
): string | undefined {
  const value = rawInput[fieldId]

  if (
    fieldConfig &&
    fieldConfig.type === FieldType.DATE_RANGE &&
    Array.isArray(value) &&
    value.length === 2
  ) {
    return `${value[0]},${value[1]}`
  }
  return value ? String(value) : undefined
}

function buildDataConditionFromSearchKeys(
  searchKeys: {
    fieldId: string
    config?: {
      type: keyof typeof MatchType
    }
    fieldType: 'field' | 'event'
    fieldConfig?: FieldConfig
  }[],
  rawInput: Record<string, string> // values from UI or query string
): Record<string, Condition> {
  return searchKeys.reduce(
    (
      result: Record<string, Condition>,
      { fieldId, config, fieldType, fieldConfig }
    ) => {
      const fieldIdEdited = fieldType === 'event' ? `event.${fieldId}` : fieldId
      const value = formatValue(rawInput, fieldIdEdited, fieldConfig)

      if (fieldIdEdited === 'event.status' && value === 'ALL') {
        const transformedKey = fieldIdEdited.replace(/\./g, '____')
        result[transformedKey] = buildConditionForStatus()
      } else if (value) {
        // Handle the case where we want to search by range but the value is not a comma-separated string
        // e.g. "2023-01-01,2023-12-31" should be treated as a range
        // but "2023-01-01" should be treated as an exact match
        const searchType =
          config?.type === 'range' && value.split(',').length === 1
            ? 'exact'
            : config?.type
        const condition = buildCondition(value, searchType)
        const transformedKey = fieldIdEdited.replace(/\./g, '____')
        result[transformedKey] = condition
      }
      return result
    },
    {}
  )
}

export function buildDataCondition(
  flat: Record<string, string>,
  eventConfig: EventConfig
): QueryInputType {
  const advancedSearch = eventConfig.advancedSearch

  // Flatten all fields into a single list of search keys
  const searchKeys = advancedSearch.flatMap((section) =>
    section.fields.map((field) => ({
      fieldId: field.fieldId,
      config: field.config, // assuming field structure has a `config` prop
      fieldType: field.fieldType,
      fieldConfig: eventConfig.declaration.pages
        .flatMap((page) => page.fields)
        .find((f) => f.id === field.fieldId)
    }))
  )

  return buildDataConditionFromSearchKeys(searchKeys, flat)
}

const searchFieldTypeMapping = {
  [FieldType.NAME]: 'fuzzy',
  [FieldType.ID]: 'exact',
  [FieldType.EMAIL]: 'exact',
  [FieldType.PHONE]: 'exact'
} as const

const searchFields = Object.keys(
  searchFieldTypeMapping
) as (keyof typeof searchFieldTypeMapping)[]

function metadataFieldTypeMapping(value: string) {
  return [
    {
      trackingId: {
        term: value,
        type: 'exact' as const
      },
      registrationNumber: {
        term: value,
        type: 'exact' as const
      }
    }
  ]
}

function addMetadataFieldsInQuickSearchQuery(
  clauses: QueryExpression[],
  terms: string[]
) {
  for (const term of terms) {
    const mappings = metadataFieldTypeMapping(term)

    for (const mapping of mappings) {
      for (const [field, config] of Object.entries(mapping)) {
        clauses.push({
          [field]: config
        })
      }
    }
  }
}

function buildQueryFromQuickSearchFields(
  searchableFields: Inferred[],
  terms: string[]
): QueryType {
  const clauses: QueryExpression[] = []

  for (const field of searchableFields) {
    const matchType =
      searchFieldTypeMapping[field.type as keyof typeof searchFieldTypeMapping]

    for (const term of terms) {
      const queryClause: QueryExpression = Object.keys(
        searchFieldTypeMapping
      ).includes(field.type) // Check if the field type is in the mapping to determine if it's a declaration field
        ? { data: { [field.id]: { type: matchType, term } } }
        : { [field.id]: { type: matchType, term } }

      clauses.push(queryClause)
    }
  }
  addMetadataFieldsInQuickSearchQuery(clauses, terms)

  return {
    type: QUICK_SEARCH_KEY,
    clauses
  }
}

export function buildQuickSearchQuery(
  searchParams: Record<string, string>,
  events: EventConfig[]
): QueryType {
  const fieldsOfEvents = events.reduce<Inferred[]>((acc, event) => {
    const fields = getAllUniqueFields(event)
    return [...acc, ...fields]
  }, [])

  const fieldsToSearch = fieldsOfEvents.filter((field) =>
    searchFields.includes(field.type as keyof typeof searchFieldTypeMapping)
  )
  const terms = Object.values(searchParams).filter(Boolean)

  return buildQueryFromQuickSearchFields(fieldsToSearch, terms)
}
