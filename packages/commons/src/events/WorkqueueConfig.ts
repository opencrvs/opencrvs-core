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
import { event } from './event'
import {
  defineWorkqueuesColumns,
  WorkqueueColumn
} from './WorkqueueColumnConfig'
import {
  CountryConfigQueryInputType,
  CountryConfigQueryType
} from './CountryConfigQueryInput'
import { AvailableIcons } from '../icons'
import { QueryType } from './EventIndex'

export const defaultThirdColumn = defineWorkqueuesColumns([
  {
    label: {
      id: 'workqueues.dateOfEvent',
      defaultMessage: 'Date of Event',
      description: 'Label for workqueue column: dateOfEvent'
    },
    value: event.field('dateOfEvent')
  }
])

/**
 * Configuration for workqueue. Workqueues are used to display a list of events.
 */
export const WorkqueueConfig = z
  .object({
    slug: z.string().describe('Determines the url of the workqueue.'),
    name: TranslationConfig.describe(
      'Title of the workflow (both in navigation and on the page)'
    ),
    query: CountryConfigQueryType,
    actions: z.array(
      z.object({
        type: z.string(),
        conditionals: z.array(Conditional).optional()
      })
    ),
    columns: z.array(WorkqueueColumn).default(defaultThirdColumn),
    icon: AvailableIcons
  })
  .describe('Configuration for workqueue.')

export const WorkqueueConfigInput = z.object({
  slug: z.string().describe('Determines the url of the workqueue.'),
  name: TranslationConfig.describe(
    'Title of the workflow (both in navigation and on the page)'
  ),
  query: CountryConfigQueryInputType,
  actions: z.array(
    z.object({
      type: z.string(),
      conditionals: z.array(Conditional).optional()
    })
  ),
  columns: z.array(WorkqueueColumn).default(defaultThirdColumn),
  icon: AvailableIcons
})

export type WorkqueueConfig = z.infer<typeof WorkqueueConfig>
export type WorkqueueConfigInput = z.input<typeof WorkqueueConfigInput>

export function defineWorkqueue(workqueueInput: WorkqueueConfigInput) {
  const queryInput = workqueueInput.query
  const query: CountryConfigQueryType =
    'type' in queryInput ? queryInput : { type: 'and', clauses: [queryInput] }
  return WorkqueueConfig.parse({ ...workqueueInput, query })
}

export function defineWorkqueues(workqueues: WorkqueueConfigInput[]) {
  return workqueues.map((workqueue) => defineWorkqueue(workqueue))
}

export const WorkqueueCountInput = z.array(
  z.object({ slug: z.string(), query: QueryType })
)
export type WorkqueueCountInput = z.infer<typeof WorkqueueCountInput>

export const WorkqueueCountOutput = z.record(z.string(), z.number())
export type WorkqueueCountOutput = z.infer<typeof WorkqueueCountOutput>
