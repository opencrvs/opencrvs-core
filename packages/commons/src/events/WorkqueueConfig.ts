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
import { TranslationConfig } from './TranslationConfig'
import { EventStatuses } from './EventMetadata'

/**
 * Configuration for workqueue. Workqueues are used to display a list of events.
 */
export const WorkqueueConfig = z
  .object({
    id: z.string().describe('Unique identifier for workqueue.'),
    fields: z.array(
      z.object({
        // @TODO: Improve typing by enforcing EventMetadataKeys and form page fields as possible values
        column: z.string(),
        label: TranslationConfig.optional()
      })
    ),
    filters: z
      .array(
        z.object({
          status: z
            .array(EventStatuses)
            .describe('Defines which statusese are included in the workqueue.')
        })
      )
      .describe('Filters to be applied to workqueue.')
  })
  .describe('Configuration for workqueue.')

export type WorkqueueConfig = z.infer<typeof WorkqueueConfig>
export type WorkqueueConfigInput = z.input<typeof WorkqueueConfig>
