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
  SearchQueryParams,
  Inferred
} from '@opencrvs/commons/client'
import { FieldType } from '@opencrvs/commons/client'
import { getAllUniqueFields } from '@client/v2-events/utils'
import {
  Errors,
  getValidationErrorsForForm
} from '@client/v2-events/components/forms/validation'

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
  Archived: 'ARCHIVED',
  Certified: 'CERTIFIED',
  CorrectionRequested: 'CORRECTION_REQUESTED',
  DeclarationUpdated: 'DECLARATION_UPDATED',
  Declared: 'DECLARED',
  InProgress: 'IN_PROGRESS',
  Issued: 'ISSUED',
  Registered: 'REGISTERED',
  Rejected: 'REJECTED',
  Validated: 'VALIDATED',
  WaitingValidation: 'WAITING_VALIDATION',
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
  rawInput: Record<string, FieldValue> // values from UI or query string
): Record<string, Condition> {
  return searchKeys.reduce(
    (
      result: Record<string, Condition>,
      { fieldId, config, fieldType, fieldConfig }
    ) => {
      const value = formatValue(rawInput, fieldId, fieldConfig)
      if (fieldId === 'event.status' && value === 'ALL') {
        const transformedKey = fieldId.replace(/\./g, '____')
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
        const transformedKey = fieldId.replace(/\./g, '____')
        result[transformedKey] = condition
      }
      return result
    },
    {}
  )
}

export function buildDataCondition(
  flat: Record<string, FieldValue>,
  eventConfig: EventConfig
): QueryInputType {
  const advancedSearch = eventConfig.advancedSearch

  const defaultMetadataSearchFields = advancedSearch.flatMap((section) =>
    getDefaultSearchFields(section)
  )

  const defaultSearchKeys = defaultMetadataSearchFields.map((field) => ({
    fieldId: field.id,
    config: advancedSearch
      .flatMap((x) => x.fields)
      .filter((x) => x.fieldType === 'event')
      .find((x) => field.id.includes(x.fieldId))?.config,
    fieldType: 'event' as const,
    fieldConfig: field
  }))

  // Flatten all fields into a single list of search keys
  const allFields = advancedSearch.flatMap((section) => section.fields)

  const searchKeys = allFields.map((field) => ({
    fieldId: field.fieldId,
    config: field.config, // assuming field structure has a `config` prop
    fieldType: field.fieldType,
    fieldConfig: eventConfig.declaration.pages
      .flatMap((page) => page.fields)
      .find((f) => f.id === field.fieldId)
  }))
  const filteredSearchKeys = [...defaultSearchKeys, ...searchKeys].filter(
    (searchKey) => Object.keys(flat).some((key) => key === searchKey.fieldId)
  )

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

export function filterValuesBasedOnFieldConfigs(
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
