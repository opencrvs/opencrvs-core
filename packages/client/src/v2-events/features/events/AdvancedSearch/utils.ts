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
  EventFieldId
} from '@opencrvs/commons/client'
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
  // this should be strictly typed, not just any string
  string,
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

export const getDefaultSearchFields = (
  section: AdvancedSearchConfig
): FieldConfig[] => {
  const searchFields: FieldConfig[] = []

  section.fields.forEach((fieldConfig) => {
    const generator = defaultSearchFieldGenerator[fieldConfig.fieldId]

    if (generator) {
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

type Condition =
  | { type: 'fuzzy'; term: string }
  | { type: 'exact'; term: string }
  | { type: 'range'; gte: string; lte: string }
  | { type: 'anyOf'; terms: string[] }

export const ADVANCED_SEARCH_KEY = 'and'

function buildCondition(type: string, value: string): Condition {
  switch (type) {
    case 'FUZZY':
      return { type: 'fuzzy', term: value }
    case 'EXACT':
      return { type: 'exact', term: value }
    case 'ANY_OF':
      return { type: 'anyOf', terms: value.split(',') }
    case 'RANGE':
      const [gte, lte] = value.split(',')
      return { type: 'range', gte, lte }
    default:
      return { type: 'exact', term: value } // Fallback to exact match
  }
}

function buildConditionForStatus(): Condition {
  return { type: 'anyOf', terms: Object.values(RegStatus) }
}

function buildDataConditionFromSearchKeys(
  searchKeys: {
    fieldId: string
    config?: {
      type: 'FUZZY' | 'EXACT' | 'RANGE'
    }
    fieldType: 'field' | 'event'
  }[],
  rawInput: Record<string, string> // values from UI or query string
): Record<string, Condition> {
  return searchKeys.reduce(
    (result: Record<string, Condition>, { fieldId, config, fieldType }) => {
      const fieldIdEdited = fieldType === 'event' ? `event.${fieldId}` : fieldId
      const value = rawInput[fieldIdEdited]

      if (fieldIdEdited === 'event.status' && value === 'ALL') {
        const transformedKey = fieldIdEdited.replace(/\./g, '____')
        result[transformedKey] = buildConditionForStatus()
      } else if (value) {
        const condition = buildCondition(config?.type ?? 'EXACT', value)
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
      fieldType: field.fieldType
    }))
  )

  return buildDataConditionFromSearchKeys(searchKeys, flat)
}
