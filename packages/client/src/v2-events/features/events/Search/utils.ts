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
import { isArray, isNil, isPlainObject, isString } from 'lodash'
import { parse as parseQuery, stringify } from 'query-string'
import { useSelector } from 'react-redux'
import {
  EventConfig,
  FieldConfig,
  QueryInputType,
  SearchField,
  EventFieldId,
  QueryType,
  SearchQueryParams,
  EventState,
  FieldType,
  QueryExpression,
  NameFieldValue,
  DateRangeFieldValue,
  SelectDateRangeValue,
  AddressFieldValue,
  timePeriodToDateRange,
  EventStatus,
  AdvancedSearchConfigWithFieldsResolved,
  METADATA_FIELD_PREFIX,
  ValidatorContext
} from '@opencrvs/commons/client'
import { findScope, getAllUniqueFields } from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'
import { Name } from '@client/v2-events/features/events/registered-fields/Name'
import {
  IntlErrors,
  getStructuralValidationErrorsForForm
} from '@client/v2-events/components/forms/validation'
import { statusOptions, timePeriodOptions } from './EventMetadataSearchOptions'

export function getAdvancedSearchFieldErrors(
  sections: AdvancedSearchConfigWithFieldsResolved[],
  values: EventState,
  context: ValidatorContext
) {
  return sections.reduce(
    (acc, section) => ({
      ...acc,
      ...getStructuralValidationErrorsForForm(section.fields, values, context)
    }),
    {} as IntlErrors
  )
}

const defaultSearchFieldGenerator: Record<
  EventFieldId,
  (config: SearchField) => FieldConfig
> = {
  'event.legalStatuses.REGISTERED.createdAtLocation': (_) => ({
    id: 'event.legalStatuses.REGISTERED.createdAtLocation',
    type: FieldType.LOCATION,
    label: {
      defaultMessage: 'Place of registration',
      description: 'Label for place of registration field',
      id: 'advancedSearch.registeredAtLocation'
    },
    helperText: {
      defaultMessage: 'Search for a province, district or registration office',
      description: 'Helper text for place of registration field',
      id: 'advancedSearch.registeredAtLocation.helperText'
    },
    configuration: {
      searchableResource: ['locations', 'offices']
    }
  }),
  'event.legalStatuses.REGISTERED.acceptedAt': (_) => ({
    id: 'event.legalStatuses.REGISTERED.acceptedAt',
    type: FieldType.DATE_RANGE,
    label: {
      defaultMessage: 'Date of the registration was accepted',
      description: 'Label for date of registration field',
      id: 'advancedSearch.registeredAt'
    }
  }),
  'event.updatedAt': (_) => {
    if (_.config.type === 'range') {
      return {
        id: 'event.updatedAt',
        type: FieldType.SELECT_DATE_RANGE,
        label: {
          defaultMessage: 'Time period',
          description: 'Label for date of update field',
          id: 'advancedSearch.updatedAt'
        },
        helperText: {
          defaultMessage: 'Period of time since the record status changed',
          description: 'Helper text for date of update field',
          id: 'advancedSearch.updatedAt.helperText'
        },
        options: timePeriodOptions
      }
    } else {
      return {
        id: 'event.updatedAt',
        type: FieldType.DATE_RANGE,
        label: {
          defaultMessage: 'Time period',
          description: 'Label for date of update field',
          id: 'advancedSearch.updatedAt'
        },
        helperText: {
          defaultMessage: 'Period of time since the record status changed',
          description: 'Helper text for date of update field',
          id: 'advancedSearch.updatedAt.helperText'
        }
      }
    }
  },
  'event.trackingId': (_) => ({
    id: 'event.trackingId',
    type: FieldType.TEXT,
    label: {
      defaultMessage: 'Tracking ID',
      description: 'Label for tracking ID field',
      id: 'advancedSearch.trackingId'
    }
  }),
  'event.status': (_) => ({
    id: 'event.status',
    type: FieldType.SELECT,
    label: {
      defaultMessage: 'Status of record',
      description: 'Label for status field',
      id: 'advancedSearch.status'
    },
    options: statusOptions
  })
} satisfies Record<EventFieldId, (config: SearchField) => FieldConfig>

function isEventFieldId(id: string): id is EventFieldId {
  return EventFieldId.safeParse(id).success
}

export const getMetadataFieldConfigs = (
  fields: SearchField[]
): FieldConfig[] => {
  const searchFields: FieldConfig[] = []
  fields.forEach((fieldConfig) => {
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
  within: 'within',
  anyOf: 'anyOf',
  range: 'range'
} as const

type Condition =
  | { type: 'fuzzy'; term: string }
  | { type: 'within'; location: string }
  | { type: 'exact'; term: string }
  | { type: 'range'; gte: string; lte: string }
  | { type: 'anyOf'; terms: string[] }

/**
 * Represents advanced search behavior where **all conditions must match**.
 * Used to build ElasticSearch queries with `must` clauses (logical AND).
 */
const AND_SEARCH_KEY = 'and' as const
/**
 * Represents quick search behavior where **any condition may match**.
 * Used to build ElasticSearch queries with `should` clauses (logical OR).
 */
const OR_SEARCH_KEY = 'or' as const

export function toAdvancedSearchQueryType(
  searchParams: QueryInputType,
  searchFieldConfigs: SearchField[],
  eventType?: string
): QueryType {
  const metadata: Record<string, unknown> = {}
  const declaration: Record<string, unknown> = {}

  const searchFieldMap = searchFieldConfigs.reduce(
    (acc, field) => {
      acc[field.fieldId] = field
      return acc
    },
    {} as Record<string, SearchField>
  )

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key.startsWith(METADATA_FIELD_PREFIX)) {
      metadata[key.replace(METADATA_FIELD_PREFIX, '')] = value
    } else {
      declaration[key] = value
    }
  })

  const clauses: (QueryExpression | QueryType)[] = []

  clauses.push({
    ...metadata,
    eventType
  })

  Object.entries(declaration).forEach(([formFieldId, fieldValue]) => {
    const searchField = searchFieldMap[formFieldId]
    const searchFields = searchField.config.searchFields

    if (searchFields && searchFields.length > 0) {
      const orClauses: QueryExpression[] = searchFields.map((dbFieldId) => ({
        data: { [dbFieldId]: fieldValue }
      }))

      clauses.push({
        type: OR_SEARCH_KEY,
        clauses: orClauses
      } as QueryType)
    } else {
      const targetFieldId = formFieldId
      clauses.push({
        data: { [targetFieldId]: fieldValue }
      })
    }
  })

  return {
    type: AND_SEARCH_KEY,
    clauses:
      clauses.length > 0
        ? clauses
        : [
            {
              ...metadata,
              eventType,
              data: {}
            }
          ]
  }
}

function buildSearchClause(
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
    case MatchType.within:
      return { type: 'within', location: value }
    default:
      return { type: 'exact', term: value } // Fallback to exact match
  }
}

function toRangeDateString(value: DateRangeFieldValue): string {
  const parsedValue = DateRangeFieldValue.parse(value)
  if (typeof parsedValue === 'string') {
    return `${parsedValue},${parsedValue}`
  }
  return `${parsedValue.start},${parsedValue.end}`
}

function timePeriodToRangeString(value: SelectDateRangeValue): string {
  const { startDate, endDate } = timePeriodToDateRange(value)
  return `${startDate},${endDate}`
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
 * }>} searchConfigurations - The list of fields with their metadata used to build query conditions.
 *
 * @param {EventState} searchInput - The user input or query parameters in flat key-value form.
 *
 * @returns {Record<string, Condition>} A mapping of transformed field keys to their respective query conditions.
 */
function buildSearchQueryFields(
  searchConfigurations: {
    fieldId: string
    searchType: keyof typeof MatchType
    fieldConfig: FieldConfig
  }[],
  searchInput: EventState // values from UI or query string
): Record<string, Condition> {
  return searchConfigurations.reduce(
    (result: Record<string, Condition>, config) => {
      const value = searchInput[config.fieldId]
      const fieldId = config.fieldId

      const searchType = config.searchType

      if (!value) {
        return result
      }

      if (config.fieldId === 'event.status' && value === 'ALL') {
        return {
          ...result,
          [fieldId]: buildSearchClause(EventStatus.options.join(','), 'anyOf')
        }
      }

      if (config.fieldId === 'event.updatedAt') {
        return {
          ...result,
          [fieldId]: buildSearchClause(
            timePeriodToRangeString(SelectDateRangeValue.parse(value)),
            'range'
          )
        }
      }

      if (config.fieldConfig.type === FieldType.NAME) {
        const parsedName = NameFieldValue.safeParse(searchInput[config.fieldId])

        if (parsedName.success) {
          if (Name.stringify(parsedName.data) === '') {
            return result
          }
          return {
            ...result,
            [fieldId]: buildSearchClause(
              Name.stringify(parsedName.data),
              searchType
            )
          }
        }
      }

      if (
        config.fieldConfig.type === FieldType.ADDRESS &&
        AddressFieldValue.safeParse(searchInput[config.fieldId]).success
      ) {
        return {
          ...result,
          [fieldId]: buildSearchClause(
            JSON.stringify(searchInput[config.fieldId]),
            searchType
          )
        }
      }

      /* If the field is of DATE_RANGE type we treat the input as a range,
       * regardless of whether the user entered a single date (e.g., "2023-01-01")
       * or a date range (e.g., { start: "2023-01-01" end: "2024-01-01" }).
       * In both cases, we convert the local date(s) into a UTC-based range to ensure
       * accurate matching in Elasticsearch, which stores these metadata dates in UTC.
       */
      if (config.fieldConfig.type === FieldType.DATE_RANGE) {
        return {
          ...result,
          [fieldId]: buildSearchClause(
            toRangeDateString(DateRangeFieldValue.parse(value)),
            'range'
          )
        }
      }

      return {
        ...result,
        [fieldId]: buildSearchClause(value.toString(), searchType)
      }
    },
    {}
  )
}

/**
 * @returns the field configuration with overrides applied from the search field
 */
function applySearchFieldOverridesToFieldConfig(
  field: FieldConfig,
  searchField: SearchField
): FieldConfig {
  const commonConfig = {
    conditionals: searchField.conditionals ?? field.conditionals,
    validation: searchField.validations ?? field.validation,
    required: false as const
  }
  if (field.type === FieldType.DATE && searchField.config.type === 'range') {
    return {
      ...field,
      ...commonConfig,
      validation: [],
      type: FieldType.DATE_RANGE,
      defaultValue: undefined
    }
  }
  if (field.type === FieldType.ADDRESS) {
    return {
      ...field,
      ...commonConfig,
      configuration: {
        ...field.configuration,
        fields: ['country']
      }
    }
  }
  if (field.type === FieldType.NAME) {
    return {
      ...field,
      ...commonConfig,
      configuration: {
        ...field.configuration,
        name: {
          firstname: {
            ...field.configuration?.name?.firstname,
            required: false
          },
          surname: {
            ...field.configuration?.name?.surname,
            required: false
          },
          middlename: field.configuration?.name?.middlename
            ? {
                ...field.configuration.name.middlename,
                required: false
              }
            : undefined
        }
      }
    }
  }
  if (field.type === FieldType.SELECT) {
    return {
      ...field,
      ...commonConfig,
      ...(searchField.options && { options: searchField.options })
    }
  }
  return {
    ...field,
    ...commonConfig
  }
}

/**
 * @returns the unique field configurations with search overrides applied for
 * the given event
 */
function getFieldConfigsWithSearchOverrides(eventConfig: EventConfig) {
  const searchFieldMap = eventConfig.advancedSearch
    .flatMap((section) => section.fields)
    .reduce(
      (acc, field) => {
        acc[field.fieldId] = field
        return acc
      },
      {} as Record<string, SearchField | undefined>
    )
  return getAllUniqueFields(eventConfig).map((field) => {
    const searchField = searchFieldMap[field.id]
    if (searchField) {
      return applySearchFieldOverridesToFieldConfig(field, searchField)
    }
    return field
  })
}

function generateSearchFieldConfig(searchField: SearchField): FieldConfig {
  const baseFieldConfig: FieldConfig = {
    id: searchField.fieldId,
    type: searchField.type,
    label: searchField.label,
    conditionals: [],
    validation: []
  } as FieldConfig

  return applySearchFieldOverridesToFieldConfig(baseFieldConfig, searchField)
}

export function resolveAdvancedSearchConfig(
  eventConfig: EventConfig
): AdvancedSearchConfigWithFieldsResolved[] {
  const declarationFieldsMap = getAllUniqueFields(eventConfig).reduce(
    (acc, field) => {
      acc[field.id] = field
      return acc
    },
    {} as Record<string, FieldConfig>
  )
  return eventConfig.advancedSearch.map((section) => {
    return {
      ...section,
      fields: section.fields.map((field) => {
        if (isEventFieldId(field.fieldId)) {
          return defaultSearchFieldGenerator[field.fieldId](field)
        } else if (
          field.config.searchFields &&
          field.config.searchFields.length > 0
        ) {
          return generateSearchFieldConfig(field)
        } else {
          return applySearchFieldOverridesToFieldConfig(
            declarationFieldsMap[field.fieldId],
            field
          )
        }
      })
    }
  })
}

/**
 * @returns field configurations for advanced search fields (@see EventFieldId) and declaration fields that are in the search parameters.
 */
export function getSearchParamsFieldConfigs(
  eventConfig: EventConfig,
  searchParams: SearchQueryParams
): FieldConfig[] {
  // Flatten all advanced search fields across all sections
  const allSearchFields = eventConfig.advancedSearch.flatMap(
    (section) => section.fields
  )
  const declarationFieldConfigs =
    getFieldConfigsWithSearchOverrides(eventConfig)
  const metadataFieldConfigs = getMetadataFieldConfigs(allSearchFields)

  const searchOnlyFieldConfigs = allSearchFields
    .filter(
      (field) =>
        field.config.searchFields && field.config.searchFields.length > 0
    )
    .map(generateSearchFieldConfig)
  const searchFieldConfigs = [
    ...metadataFieldConfigs,
    ...declarationFieldConfigs,
    ...searchOnlyFieldConfigs
  ].filter((field) => {
    return Object.keys(searchParams).some((key) => key === field.id)
  })

  return searchFieldConfigs
}

/**
 * @returns A filtered object of search parameters that include only fields in the event configuration.
 *
 */
export function parseFieldSearchParams(
  eventConfig: EventConfig,
  searchParams: SearchQueryParams
) {
  const searchFieldConfigs = getSearchParamsFieldConfigs(
    eventConfig,
    searchParams
  )

  // filter out any unrelated search parameters
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key]) =>
      searchFieldConfigs.some((config) => config.id === key)
    )
  )

  return filteredSearchParams
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
 *
 * @param {EventState} formValues - A flat key-value object representing the current search
 * @param {FieldConfig[]} resolvedFieldConfigs - The resolved field configurations
 * for an advanced search form, including both metadata and declaration
 * fields.
 * @param {SearchField[]} searchFieldConfigs - The search field configurations
 * the advanced search form
 * @returns {QueryInputType} A query object representing the current search condition,
 *                           ready to be used for filtering or querying data.
 */
export function buildSearchQuery(
  formValues: EventState,
  resolvedFieldConfigs: FieldConfig[],
  searchFieldConfigs: SearchField[]
): QueryInputType {
  const fieldsMap = searchFieldConfigs.reduce(
    (acc, config) => {
      acc[config.fieldId] = config
      return acc
    },
    {} as Record<string, SearchField>
  )

  const searchConfigs = resolvedFieldConfigs.map((fieldConfig) => ({
    fieldId: fieldConfig.id,
    searchType: fieldsMap[fieldConfig.id].config.type,
    fieldConfig
  }))

  // Generate the final query condition object from the filtered keys and raw input
  return buildSearchQueryFields(searchConfigs, formValues)
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
      'legalStatuses.REGISTERED.registrationNumber': {
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
  searchableFields: FieldConfig[],
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
    type: OR_SEARCH_KEY,
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
  const fieldsOfEvents = events.reduce<FieldConfig[]>((acc, event) => {
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
