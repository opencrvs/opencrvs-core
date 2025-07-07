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
/* eslint-disable max-lines */
import startOfDay from 'date-fns/startOfDay'
import addMinutes from 'date-fns/addMinutes'
import endOfDay from 'date-fns/endOfDay'
import parse from 'date-fns/parse'
import { parse as parseQuery, stringify } from 'query-string'
import { isArray, isNil, isPlainObject, isString } from 'lodash'
import { useSelector } from 'react-redux'
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
  EventState,
  FieldType,
  QueryExpression,
  NameFieldValue,
  AddressFieldValue
} from '@opencrvs/commons/client'
import { findScope } from '@opencrvs/commons/client'
import { EventStatus } from '@opencrvs/commons/client'
import {
  Errors,
  getValidationErrorsForForm
} from '@client/v2-events/components/forms/validation'
import { getScope } from '@client/profile/profileSelectors'
import { FIELD_SEPARATOR } from '@client/v2-events/components/forms/utils'
import { getAllUniqueFields } from '@client/v2-events/utils'
import { Name } from '@client/v2-events/features/events/registered-fields/Name'

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

      const modifiedFields = advancedSearchFields.map((f) => {
        const overRiddenValidationFromAdvancedSearch =
          currentSection.fields.find(
            (field) => field.fieldId === f.id
          )?.validations
        return {
          ...f,
          required: false, // advanced search fields need not be required
          validation: (() => {
            if (formValues[f.id]) {
              if (overRiddenValidationFromAdvancedSearch) {
                return overRiddenValidationFromAdvancedSearch
              } else {
                return f.validation
              }
            } else {
              // need to validate fields only when they are not empty
              return []
            }
          })()
        }
      })

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

/**
 * Represents advanced search behavior where **all conditions must match**.
 * Used to build ElasticSearch queries with `must` clauses (logical AND).
 */
const ADVANCED_SEARCH_KEY = 'and' as const
/**
 * Represents quick search behavior where **any condition may match**.
 * Used to build ElasticSearch queries with `should` clauses (logical OR).
 */
const QUICK_SEARCH_KEY = 'or' as const

export function toAdvancedSearchQueryType(
  searchParams: QueryInputType,
  eventType?: string,
  type = ADVANCED_SEARCH_KEY
): QueryType {
  const metadata: Record<string, unknown> = {}
  const declaration: Record<string, unknown> = {}

  Object.entries(searchParams).forEach(([_, value]) => {
    const prefixRegex = new RegExp(`^event${FIELD_SEPARATOR}`)
    const key = _.replace(prefixRegex, '').replaceAll(FIELD_SEPARATOR, '.')
    if (_.startsWith(`event${FIELD_SEPARATOR}`)) {
      metadata[key] = value
    } else {
      declaration[key] = value
    }
  })

  return {
    type,
    clauses: [{ ...metadata, eventType, data: declaration }]
  }
}

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
  return { type: 'anyOf', terms: Object.values([...EventStatus.options]) }
}
/**
 * Converts a date range input string into a UTC-based range string.
 *
 * This function:
 * - Takes a date range input in the format "YYYY-MM-DD,YYYY-MM-DD" or "YYYY-MM-DD".
 * - Converts the local date(s) to UTC by adjusting for the current timezone offset.
 * - Returns a string formatted as "startUTC,endUTC".
 *
 * @param {string} inputDateString - The date range input string.
 * @returns {string} A comma-separated string of ISO-formatted UTC start and end timestamps.
 */
function getUtcRangeFromInput(inputDateString: string) {
  const offsetMinutes = new Date().getTimezoneOffset()

  const [startDateStr, endDateStr] = inputDateString
    .split(',')
    .map((s) => s.trim())

  const dateFormat = 'yyyy-MM-dd'
  const startLocal = startOfDay(parse(startDateStr, dateFormat, new Date()))
  const endLocal = endOfDay(
    parse(endDateStr || startDateStr, dateFormat, new Date())
  )

  const utcStart = addMinutes(startLocal, offsetMinutes)
  const utcEnd = addMinutes(endLocal, offsetMinutes)

  return `${utcStart.toISOString()},${utcEnd.toISOString()}`
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
    (
      result: Record<string, Condition>,
      { fieldId, fieldType, config, fieldConfig }
    ) => {
      let value = String(rawInput[fieldId])
      if (fieldId === 'event.status' && value === 'ALL') {
        const transformedKey = fieldId.replace(/\./g, FIELD_SEPARATOR)
        result[transformedKey] = buildConditionForStatus()
      } else if (value) {
        let searchType = config?.type
        // If the field is of DATE or DATE_RANGE type and the fieldType is 'event' (metadata search field),
        // we treat the input as a range, regardless of whether the user entered a single date (e.g., "2023-01-01")
        // or a date range (e.g., "2023-01-01,2023-12-31").
        // In both cases, we convert the local date(s) into a UTC-based range to ensure
        // accurate matching in Elasticsearch, which stores these metadata dates in UTC.
        if (
          (fieldConfig?.type === FieldType.DATE_RANGE ||
            fieldConfig?.type === FieldType.DATE) &&
          fieldType === 'event'
        ) {
          searchType = 'range'
          value = getUtcRangeFromInput(value)
        }
        if (
          fieldConfig?.type === FieldType.NAME &&
          NameFieldValue.safeParse(rawInput[fieldId]).success
        ) {
          value = Name.stringify(rawInput[fieldId] as NameFieldValue)
        }
        if (
          fieldConfig?.type === FieldType.ADDRESS &&
          AddressFieldValue.safeParse(rawInput[fieldId]).success
        ) {
          value = JSON.stringify(rawInput[fieldId])
        }
        // Handle the case where we want to search by range but the value is not a comma-separated string
        // e.g. "2023-01-01,2023-12-31" should be treated as a range
        // but "2023-01-01" should be treated as an exact match
        else if (config?.type === 'range' && value.split(',').length === 1) {
          searchType = 'exact'
        }

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
  const declarationFieldConfigs = getAllUniqueFields(eventConfig).map((x) => {
    if (x.type === FieldType.ADDRESS) {
      return { ...x, configuration: { searchMode: true } }
    }
    return x
  })
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
      'legalStatus.REGISTERED.registrationNumber': {
        term: value,
        type: 'exact' as const
      }
    }
  ]
}

function addMetadataFieldsInQuickSearchQuery(
  clauses: QueryExpression[],
  terms: string[]
): QueryExpression[] {
  const metadataClauses = terms.reduce<QueryExpression[]>((acc, term) => {
    const mappings = metadataFieldTypeMapping(term)

    for (const mapping of mappings) {
      for (const [field, config] of Object.entries(mapping)) {
        acc.push({ [field]: config })
      }
    }

    return acc
  }, [])

  return [...clauses, ...metadataClauses]
}

function buildQueryFromQuickSearchFields(
  searchableFields: Inferred[],
  terms: string[]
): QueryType {
  let clauses: QueryExpression[] = []
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

  clauses = addMetadataFieldsInQuickSearchQuery(clauses, terms)

  return {
    type: QUICK_SEARCH_KEY,
    clauses
  } as QueryType
}

/**
 * Builds a quick search query for Elasticsearch based on the provided search parameters and event configurations.
 *
 * Quick search is designed for user-friendly, broad matching. It performs:
 * - `fuzzy` matches on fields like name.
 * - `exact` matches on fields like ID, email, phone.
 * - additional exact matches on metadata fields like `trackingId` and `registrationNumber`.
 *
 * The resulting query uses `OR` logic (`type: 'or'`), meaning any matching clause is sufficient.
 *
 * @param searchParams - A flat object of field-value pairs submitted from the UI.
 * @param events - The event configurations to extract searchable fields from.
 * @returns QueryType - A structured query used to hit Elasticsearch.
 */
export function buildQuickSearchQuery(
  searchParams: Record<string, string>,
  events: EventConfig[]
): QueryType {
  // Flatten all searchable fields from the selected events
  const fieldsOfEvents = events.reduce<Inferred[]>((acc, event) => {
    const fields = getAllUniqueFields(event)
    return [...acc, ...fields]
  }, [])

  // Filter fields to only include those that are supported in quick search
  const fieldsToSearch = fieldsOfEvents.filter((field) =>
    searchFields.includes(field.type as keyof typeof searchFieldTypeMapping)
  )
  // Get all non-empty search terms from user input
  const terms = Object.values(searchParams).filter(Boolean)

  // Delegate to the actual query builder
  return buildQueryFromQuickSearchFields(fieldsToSearch, terms)
}

/**
 * @returns a boolean indicating whether the current user has the scope to search for an event
 */
export function checkScopeForEventSearch(eventId: string) {
  const scopes = useSelector(getScope)
  const searchScopes = findScope(scopes ?? [], 'search')

  const isEventSearchAllowed =
    searchScopes &&
    Object.keys(searchScopes.options).some((id) => eventId === id)

  return isEventSearchAllowed
}

function serializeValue(value: unknown) {
  if (isArray(value)) {
    return value.length > 0
      ? value.map((v) => (isPlainObject(v) ? JSON.stringify(v) : v))
      : undefined
  }
  if (isPlainObject(value)) {
    return JSON.stringify(value)
  }

  return value
}

export function serializeSearchParams(
  eventState: Record<string, unknown>
): string {
  const simplifiedValue = Object.entries(eventState).reduce(
    (acc, [key, value]) => {
      const serialized = serializeValue(value)
      // If we don't care about the empty objects, we might be able to keep it as simple as this:
      if (!isNil(serialized)) {
        acc[key] = serialized
      }

      return acc
    },
    {} as Record<string, unknown>
  )
  return stringify(simplifiedValue, { skipEmptyString: true })
}

function tryParse(value: unknown): unknown {
  if (!isString(value)) {
    return value
  }

  try {
    if (isArray(value)) {
      return value.map(tryParse)
    } else {
      const parsed = JSON.parse(value)
      // Only return parsed if it's an object or array (i.e., something we stringified before)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch {}

  return value
}
export function deserializeSearchParams(
  queryParams: string
): Record<string, unknown> {
  const parsedParams = parseQuery(queryParams)

  const deserialized = Object.entries(parsedParams).reduce(
    (acc, [key, value]) => {
      if (isArray(value)) {
        acc[key] = value.map(tryParse)
      } else {
        acc[key] = tryParse(value)
      }

      return acc
    },
    {} as Record<string, unknown>
  )

  return deserialized
}
