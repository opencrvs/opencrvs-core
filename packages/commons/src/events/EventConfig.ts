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
import { SummaryConfig } from './SummaryConfig'
import { WorkqueueConfig } from './WorkqueueConfig'
import { FormConfig, FormConfigInput, FormPage } from './FormConfig'
import { DeduplicationConfig } from './DeduplicationConfig'

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
  workqueues: z.array(WorkqueueConfig),
  deduplication: z.array(DeduplicationConfig).optional().default([])
})

export type EventConfig = z.infer<typeof EventConfig>
export type EventConfigInput = z.input<typeof EventConfig>

export const defineForm = (form: FormConfigInput): FormConfig =>
  FormConfig.parse(form)

export const defineFormPage = (formPage: FormPage): FormPage =>
  FormPage.parse(formPage)
