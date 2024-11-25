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
  label: TranslationConfig,
  actions: z.array(ActionConfig)
})

export type EventConfig = z.infer<typeof EventConfig>

/**
 * Builds a validated configuration for an event
 * @param config - Event specific configuration
 */
export const defineConfig = (config: EventConfig) => EventConfig.parse(config)
