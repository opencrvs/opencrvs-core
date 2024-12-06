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
  actions: z.array(ActionConfig)
})

export type EventConfig = z.infer<typeof EventConfig>

/**
 * Builds a validated configuration for an event
 * @param config - Event specific configuration
 */
export const defineConfig = (
  config:
    | EventConfig
    | (Omit<EventConfig, 'summary'> & { summary: SummaryConfigInput })
) => {
  const parsed = EventConfig.extend({
    summary: SummaryConfigInput
  }).parse(config)

  const summaryFieldsWithoutLabel = parsed.summary.fields.filter(
    (field) => !field.label
  )

  if (summaryFieldsWithoutLabel.length === 0) {
    return parsed
  }
  /** Allow passing field without label in the summary configuration. In that case, replace it with the corresponding one in form fields*/
  const matchingPageFields = flattenDeep(
    parsed.actions.map(({ forms }) =>
      forms.map(({ pages }) =>
        pages.map(({ fields }) =>
          fields
            .filter((field) =>
              summaryFieldsWithoutLabel.some(
                (summaryField) => summaryField.id === field.id
              )
            )
            .map((field) => ({ id: field.id, label: field.label }))
        )
      )
    )
  )

  return {
    ...parsed,
    summary: {
      ...parsed.summary,
      fields: parsed.summary.fields.map((field) => {
        const matchingField = matchingPageFields.find(
          (matchingField) => matchingField.id === field.id
        )

        return matchingField ?? field
      })
    }
  }
}
