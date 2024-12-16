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
import { z } from 'zod'
import { ActionConfig } from './ActionConfig'
import { TranslationConfig } from './TranslationConfig'
import { SummaryConfig, SummaryConfigInput } from './SummaryConfig'
import { flattenDeep } from 'lodash'
import { WorkqueueConfig } from './WorkqueueConfig'
import { eventMetadataLabelMap } from './EventMetadata'
import { FormConfig, FormConfigInput } from './FormConfig'

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 *
 * `Event.parse(config)` will throw an error if the configuration is invalid.
 */
export const EventConfig = z.object({
  id: z
    .string()
    .describe(
      'A machine-readable identifier for the event, e.g. "birth" or "death"'
    ),
  summary: SummaryConfig,
  label: TranslationConfig,
  actions: z.array(ActionConfig),
  workqueues: z.array(WorkqueueConfig)
})

export type EventConfig = z.infer<typeof EventConfig>
export type EventConfigInput = z.input<typeof EventConfig>

const findPageFields = (
  config: Omit<EventConfig, 'summary'> & { summary: SummaryConfigInput }
) => {
  return flattenDeep(
    config.actions.map(({ forms }) =>
      forms.map(({ pages }) =>
        pages.map(({ fields }) =>
          fields.map((field) => ({ id: field.id, label: field.label }))
        )
      )
    )
  )
}

const fillFieldLabels = ({
  pageFields,
  refFields
}: {
  pageFields: { id: string; label: TranslationConfig }[]
  refFields: {
    id: keyof typeof eventMetadataLabelMap | string
    label?: TranslationConfig
  }[]
}) => {
  return refFields.map((field) => {
    if (field.label) {
      return field
    }

    // @ts-ignore
    const metadataLabel = eventMetadataLabelMap[field.id]
    if (metadataLabel) {
      return {
        ...field,
        label: metadataLabel
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

/**
 * Builds a validated configuration for an event
 * @param config - Event specific configuration
 */
export const defineConfig = (config: EventConfigInput) => {
  const parsed = EventConfig.parse(config)

  const pageFields = findPageFields(parsed)

  return EventConfig.parse({
    ...parsed,
    summary: {
      ...parsed.summary,
      fields: fillFieldLabels({
        pageFields,
        refFields: parsed.summary.fields
      })
    },
    workqueues: parsed.workqueues.map((workqueue) => ({
      ...workqueue,
      fields: fillFieldLabels({
        pageFields,
        refFields: workqueue.fields
      })
    }))
  })
}

export const defineForm = (form: FormConfigInput): FormConfig =>
  FormConfig.parse(form)
