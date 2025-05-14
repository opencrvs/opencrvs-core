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
import { Conditional } from './Conditional'
import { QueryType } from './EventIndex'
import { EventMetadataParameter } from './EventMetadata'
import { event } from './event'

/**
 * Configuration for workqueue. Workqueues are used to display a list of events.
 */
export const WorkqueueConfig = z
  .object({
    slug: z.string().describe('Determines the url of the workqueue.'),
    name: TranslationConfig.describe(
      'Title of the workflow (both in navigation and on the page)'
    ),
    query: QueryType,
    actions: z.array(
      z.object({
        type: z.string(),
        conditionals: z.array(Conditional).optional()
      })
    ),
    columns: z
      .array(
        z.object({ label: TranslationConfig, value: EventMetadataParameter })
      )
      .default([
        {
          label: {
            id: 'workqueues.dateOfEvent',
            defaultMessage: 'Date of Event',
            description: 'Label for workqueue column: dateOfEvent'
          },
          value: event.field('dateOfEvent')
        }
      ])
  })
  .describe('Configuration for workqueue.')

export type WorkqueueConfig = z.infer<typeof WorkqueueConfig>
export type WorkqueueConfigInput = z.input<typeof WorkqueueConfig>

export function defineWorkqueue(workqueues: WorkqueueConfigInput[]) {
  return workqueues.map((workqueue) => WorkqueueConfig.parse(workqueue))
}
