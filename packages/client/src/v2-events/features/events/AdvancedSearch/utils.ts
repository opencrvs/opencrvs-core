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
  QueryInputType,
  SearchField,
  EventFieldId,
  QueryType,
  SearchQueryParams,
  Inferred,
  EventState
} from '@opencrvs/commons/client'
import { FieldType } from '@opencrvs/commons/client'
import { getAllUniqueFields } from '@client/v2-events/utils'
import {
  Errors,
  getValidationErrorsForForm
} from '@client/v2-events/components/forms/validation'
import { FIELD_SEPARATOR } from '@client/v2-events/components/forms/utils'

export const getAdvancedSearchFieldErrors = (
  currentEvent: EventConfig,
  formValues: EventState
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
  [EventFieldId.enum['legalStatus.REGISTERED.createdAtLocation']]: (_) => ({
    id: 'event.legalStatus.REGISTERED.createdAtLocation',
    type: FieldType.OFFICE,
    label: {
      defaultMessage: 'Place of registration',
      description: 'Label for place of registration field',
      id: 'v2.advancedSearch.registeredAtLocation'
    },
    helperText: {
      defaultMessage: 'Search for a province, district or registration office',
      description: 'Helper text for place of registration field',
      id: 'v2.advancedSearch.registeredAtLocation.helperText'
    }
  }),
  [EventFieldId.enum['legalStatus.REGISTERED.createdAt']]: (_) => ({
    id: 'event.legalStatus.REGISTERED.createdAt',
    type: FieldType.DATE_RANGE,
    label: {
      defaultMessage: 'Date of registration',
      description: 'Label for date of registration field',
      id: 'v2.advancedSearch.registeredAt'
    }
  }),
  [EventFieldId.enum.updatedAt]: (config) => ({
    id: 'event.updatedAt',
    type: FieldType.SELECT,
    label: {
      defaultMessage: 'Time period',
      description: 'Label for date of update field',
      id: 'v2.advancedSearch.updatedAt'
    },
    helperText: {
      defaultMessage: 'Period of time since the record status changed',
      description: 'Helper text for date of update field',
      id: 'v2.advancedSearch.updatedAt.helperText'
    },
    options: config.options ?? []
  }),
  [EventFieldId.enum.trackingId]: (_) => ({
    id: 'event.trackingId',
    type: FieldType.TEXT,
    label: {
      defaultMessage: 'Tracking ID',
      description: 'Label for tracking ID field',
      id: 'v2.advancedSearch.trackingId'
    }
  }),
  [EventFieldId.enum.status]: (config) => ({
    id: 'event.status',
    type: FieldType.SELECT,
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
  Created: 'CREATED',
  Notified: 'NOTIFIED',
  Declared: 'DECLARED',
  Validated: 'VALIDATED',
  Registered: 'REGISTERED',
  Certified: 'CERTIFIED',
  Rejected: 'REJECTED',
  Archived: 'ARCHIVED'
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

export const ADVANCED_SEARCH_KEY = 'and'

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
  rawInput: EventState,
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

/**
 * Builds a condition object for querying data based on a set of search keys and raw input values.
 *
 * This function:
 * - Formats raw values depending on the field configuration (e.g., formats date ranges).
 * - Transforms `event.status` with value "ALL" into a special status condition.
 * - Converts other values into query conditions based on their configured match type (e.g., exact, range).
 * - Normalizes field keys by replacing dots (`.`) with double underscores (`____`) to align with query system format.
 *
 * @param {Array<{
 *   fieldId: string,
 *   config?: { type: keyof typeof MatchType },
 *   fieldType: 'field' | 'event',
 *   fieldConfig?: FieldConfig
 * }>} searchKeys - The list of fields with their metadata used to build query conditions.
 *
 * @param {EventState} rawInput - The user input or query parameters in flat key-value form.
 *
 * @returns {Record<string, Condition>} A mapping of transformed field keys to their respective query conditions.
 */
function buildDataConditionFromSearchKeys(
  searchKeys: {
    fieldId: string
    config?: {
      type: keyof typeof MatchType
    }
    fieldType: 'field' | 'event'
    fieldConfig?: FieldConfig
  }[],
  rawInput: EventState // values from UI or query string
): Record<string, Condition> {
  return searchKeys.reduce(
    (result: Record<string, Condition>, { fieldId, config, fieldConfig }) => {
      // Format the raw field value based on its type (e.g., date range value is a string tuple, format it as comma-separated string)
      const value = formatValue(rawInput, fieldId, fieldConfig)
      if (fieldId === 'event.status' && value === 'ALL') {
        const transformedKey = fieldId.replace(/\./g, FIELD_SEPARATOR)
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
        const transformedKey = fieldId.replace(/\./g, FIELD_SEPARATOR)
        result[transformedKey] = condition
      }
      return result
    },
    {}
  )
}

/**
 * Builds a data condition object based on the provided event state and configuration.
 *
 * This function:
 * - Extracts default metadata fields and advanced search fields from the event configuration.
 * - Constructs a list of search keys by resolving the matching field configurations.
 * - Filters out any search keys that don't have corresponding values in the raw input (`flat`).
 * - Uses the filtered search keys and raw input to construct a query-compatible condition.
 *
 * @param {EventState} flat - A flat key-value object representing the current form/input state.
 * @param {EventConfig} eventConfig - The event configuration object that includes
 *                                    advanced search sections and declaration field mappings.
 * @returns {QueryInputType} A query object representing the current search condition,
 *                           ready to be used for filtering or querying data.
 */
export function buildDataCondition(
  flat: EventState,
  eventConfig: EventConfig
): QueryInputType {
  const advancedSearch = eventConfig.advancedSearch

  // Extract default metadata-based search fields from each advanced search section.
  const defaultMetadataSearchFields = advancedSearch.flatMap((section) =>
    getDefaultSearchFields(section)
  )

  // Build default search key metadata for event-level fields
  const defaultSearchKeys = defaultMetadataSearchFields.map((field) => ({
    fieldId: field.id,
    // Find matching event field config based on fieldId pattern
    config: advancedSearch
      .flatMap((x) => x.fields)
      .filter((x) => x.fieldType === 'event')
      .find((x) => field.id.includes(x.fieldId))?.config,
    fieldType: 'event' as const,
    fieldConfig: field
  }))

  // Flatten all advanced search fields across all sections
  const allFields = advancedSearch.flatMap((section) => section.fields)

  // Build a list of search keys from all advanced search fields,
  // linking each to the corresponding declaration field config
  const searchKeys = allFields.map((field) => ({
    fieldId: field.fieldId,
    config: field.config, // assumes each advanced search field has a config
    fieldType: field.fieldType,
    fieldConfig: eventConfig.declaration.pages
      .flatMap((page) => page.fields)
      .find((f) => f.id === field.fieldId)
  }))

  // Combine default and advanced search keys, and filter to only include keys
  // that are present in the actual flat input data (i.e., user provided values)
  const filteredSearchKeys = [...defaultSearchKeys, ...searchKeys].filter(
    (searchKey) => Object.keys(flat).some((key) => key === searchKey.fieldId)
  )

  // Generate the final query condition object from the filtered keys and raw input
  return buildDataConditionFromSearchKeys(filteredSearchKeys, flat)
}

export function getSearchParamsFieldConfigs(
  eventConfig: EventConfig,
  searchParams: SearchQueryParams
): Inferred[] {
  const eventFieldConfigs = Object.entries(eventConfig.advancedSearch).flatMap(
    ([, value]) => getDefaultSearchFields(value)
  )
  const declarationFieldConfigs = getAllUniqueFields(eventConfig)
  const searchFieldConfigs = [
    ...eventFieldConfigs,
    ...declarationFieldConfigs
  ].filter((field) => {
    return Object.keys(searchParams).some((key) => key === field.id)
  })
  return searchFieldConfigs
}

export function parseFieldSearchParams(
  eventConfig: EventConfig,
  searchParams: SearchQueryParams
) {
  const searchFieldConfigs = getSearchParamsFieldConfigs(
    eventConfig,
    searchParams
  )
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key]) =>
      searchFieldConfigs.some((config) => config.id === key)
    )
  )
  return filteredSearchParams
}

export function toQueryType(
  eventType: string,
  searchParams: QueryInputType,
  type: 'and' | 'or'
): QueryType {
  const topLevelFields: Record<string, unknown> = {}
  const dataFields: Record<string, unknown> = {}

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key.startsWith('event')) {
      const strippedKey = key.replace(/^event____/, '')
      topLevelFields[strippedKey] = value
    } else {
      dataFields[key] = value
    }
  })

  return {
    type,
    clauses: [{ ...topLevelFields, eventType, data: dataFields }]
  }
}
