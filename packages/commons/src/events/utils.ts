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

import { EventMetadataKeys, eventMetadataLabelMap } from './EventMetadata'
import { flattenDeep } from 'lodash'
import { EventConfig } from './EventConfig'
import { EventConfigInput } from './EventConfigInput'
import { WorkqueueConfigInput } from './WorkqueueConfig'
import { FieldConfig } from './FieldConfig'
import { ActionType } from './ActionConfig'

const isMetadataField = <T extends string>(
  field: T | EventMetadataKeys
): field is EventMetadataKeys => field in eventMetadataLabelMap

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
          ...(action.onboardingForm || []).flatMap(({ fields }) => fields),
          ...(action.additionalDetailsForm || []).flatMap(
            ({ fields }) => fields
          )
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

export const resolveFieldLabels = ({
  config,
  pageFields
}: {
  config: WorkqueueConfigInput
  pageFields: { id: string; label: TranslationConfig }[]
}) => {
  return {
    ...config,
    fields: resolveLabelsFromKnownFields({
      pageFields,
      refFields: config.fields
    })
  }
}

export function getAllFields(configuration: EventConfig) {
  return configuration.actions
    .flatMap((action) => action.forms.filter((form) => form.active))
    .flatMap((form) => form.pages.flatMap((page) => page.fields))
}

export function getAllPages(configuration: EventConfig) {
  return configuration.actions
    .flatMap((action) => action.forms.filter((form) => form.active))
    .flatMap((form) => form.pages)
}
