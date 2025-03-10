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

import { TranslationConfig } from './TranslationConfig'

import { flattenDeep, omitBy } from 'lodash'
import { workqueues } from '../workqueues'
import { ActionType } from './ActionType'
import { EventConfig } from './EventConfig'
import { EventConfigInput } from './EventConfigInput'
import { EventMetadataKeys, eventMetadataLabelMap } from './EventMetadata'
import { FieldConfig } from './FieldConfig'
import { WorkqueueConfig } from './WorkqueueConfig'
import { ActionFormData } from './ActionDocument'
import { FormConfig } from './FormConfig'
import { isFieldVisible } from '../conditionals/validate'
import { FieldType } from './FieldType'

function isMetadataField<T extends string>(
  field: T | EventMetadataKeys
): field is EventMetadataKeys {
  return field in eventMetadataLabelMap
}

/**
 * @returns All the fields in the event configuration input.
 */
export const findInputPageFields = (
  config: EventConfigInput
): { id: string; label: TranslationConfig }[] => {
  return flattenDeep(
    config.actions.map(({ forms }) =>
      forms.map(({ pages }) =>
        pages.map(({ fields }) =>
          fields.map(({ id, label }) => ({ id, label }))
        )
      )
    )
  )
}

/**
 * @returns All the fields in the event configuration.
 */
export const findPageFields = (config: EventConfig): FieldConfig[] => {
  return flattenDeep(
    config.actions.map((action) => {
      if (action.type === ActionType.REQUEST_CORRECTION) {
        return [
          ...action.forms.map(({ pages }) => pages.map(({ fields }) => fields)),
          ...action.onboardingForm.flatMap(({ fields }) => fields),
          ...action.additionalDetailsForm.flatMap(({ fields }) => fields)
        ]
      }

      return action.forms.map(({ pages }) => pages.map(({ fields }) => fields))
    })
  )
}

/**
 *
 * @param pageFields - All the fields in the event configuration
 * @param refFields - The fields referencing values within the event configuration (e.g. summary fields) or within system provided metadata fields (e.g. createdAt, updatedBy)
 * @returns referenced fields with populated labels
 */
export const resolveLabelsFromKnownFields = ({
  pageFields,
  refFields
}: {
  pageFields: { id: string; label: TranslationConfig }[]
  refFields: {
    // @TODO: To enforce type safety we might need to create types without using zod
    id: EventMetadataKeys | string
    label?: TranslationConfig
  }[]
}) => {
  return refFields.map((field) => {
    if (field.label) {
      return field
    }

    if (isMetadataField(field.id)) {
      return {
        ...field,
        label: eventMetadataLabelMap[field.id]
      }
    }

    const pageLabel = pageFields.find((pageField) => pageField.id === field.id)

    if (!pageLabel) {
      throw new Error(`Referenced field ${field.id} does not have a label`)
    }

    return {
      ...field,
      label: pageLabel.label
    }
  })
}

export function getAllFields(configuration: EventConfig) {
  return configuration.actions
    .flatMap((action) => action.forms.filter((form) => form.active))
    .flatMap((form) => [
      ...form.review.fields,
      ...form.pages.flatMap((page) => page.fields)
    ])
}

export function getAllPages(configuration: EventConfig) {
  return configuration.actions
    .flatMap((action) => action.forms.filter((form) => form.active))
    .flatMap((form) => form.pages)
}

export function validateWorkqueueConfig(workqueueConfigs: WorkqueueConfig[]) {
  workqueueConfigs.map((workqueue) => {
    const rootWorkqueue = Object.values(workqueues).find(
      (wq) => wq.id === workqueue.id
    )
    if (!rootWorkqueue) {
      throw new Error(
        `Invalid workqueue configuration: workqueue not found with id:  ${workqueue.id}`
      )
    }
  })
}

export const findActiveActionForm = (
  configuration: EventConfig,
  action: ActionType
) => {
  const actionConfig = configuration.actions.find((a) => a.type === action)
  const form = actionConfig?.forms.find((f) => f.active)

  /** Let caller decide whether to throw an error when fields are missing, or default to empty array */
  return form
}

export const findActiveActionFormPages = (
  configuration: EventConfig,
  action: ActionType
) => {
  return findActiveActionForm(configuration, action)?.pages
}

export const getFormFields = (formConfig: FormConfig) => {
  return formConfig.pages.flatMap((p) => p.fields)
}

/**
 * Returns only form fields for the action type, if any, excluding review fields.
 */
export const findActiveActionFormFields = (
  configuration: EventConfig,
  action: ActionType
): FieldConfig[] | undefined => {
  const form = findActiveActionForm(configuration, action)

  /** Let caller decide whether to throw an error when fields are missing, or default to empty array */
  return form ? getFormFields(form) : undefined
}

/**
 * Returns all fields for the action type, including review fields, if any.
 */
export const findActiveActionFields = (
  configuration: EventConfig,
  action: ActionType
): FieldConfig[] | undefined => {
  const form = findActiveActionForm(configuration, action)
  const reviewFields = form?.review.fields

  const formFields = form ? getFormFields(form) : undefined
  const allFields = formFields
    ? formFields.concat(reviewFields ?? [])
    : reviewFields

  /** Let caller decide whether to throw an error when fields are missing, or default to empty array */
  return allFields
}

export function getEventConfiguration(
  eventConfigurations: EventConfig[],
  type: string
): EventConfig {
  const config = eventConfigurations.find((config) => config.id === type)
  if (!config) {
    throw new Error(`Event configuration not found for type: ${type}`)
  }
  return config
}

export function isOptionalUncheckedCheckbox(
  field: FieldConfig,
  form: ActionFormData
) {
  if (field.type !== FieldType.CHECKBOX) {
    return false
  }

  // For required checkbox fields, we want to display the field even if it is not checked
  if (field.required) {
    return false
  }

  return !form[field.id]
}

export function stripHiddenFields(fields: FieldConfig[], data: ActionFormData) {
  return omitBy(data, (_, fieldId) => {
    const field = fields.find((f) => f.id === fieldId)

    if (!field) {
      return true
    }

    if (isOptionalUncheckedCheckbox(field, data)) {
      return true
    }

    return !isFieldVisible(field, data)
  })
}
