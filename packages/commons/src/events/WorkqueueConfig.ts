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
import { workqueueActions } from './ActionType'

export const mandatoryColumns = defineWorkqueuesColumns([
  {
    label: {
      id: 'workqueues.dateOfEvent',
      defaultMessage: 'Date of Event',
      description: 'Label for workqueue column: dateOfEvent'
    },
    value: event.field('dateOfEvent')
  },
  {
    label: {
      defaultMessage: 'Last updated',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.default.column.modifiedAt'
    },
    value: event.field('updatedAt')
  }
])

export const WorkqueueActionsWithDefault = z.enum([
  ...workqueueActions.options,
  'DEFAULT'
] as const)

export type WorkqueueActionsWithDefault = z.infer<
  typeof WorkqueueActionsWithDefault
>

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
        type: WorkqueueActionsWithDefault,
        conditionals: z.array(Conditional).optional()
      })
    ),
    columns: z.array(WorkqueueColumn).default(mandatoryColumns),
    icon: AvailableIcons,
    emptyMessage: TranslationConfig.optional()
  })
  .describe('Configuration for workqueue.')

export const WorkqueueConfigWithoutQuery = WorkqueueConfig.omit({
  query: true,
  columns: true
})

export const WorkqueueConfigInput = z.object({
  slug: z.string().describe('Determines the url of the workqueue.'),
  name: TranslationConfig.describe(
    'Title of the workflow (both in navigation and on the page)'
  ),
  query: CountryConfigQueryInputType,
  actions: z.array(
    z.object({
      type: WorkqueueActionsWithDefault,
      conditionals: z.array(Conditional).optional()
    })
  ),
  columns: z.array(WorkqueueColumn).default(mandatoryColumns),
  icon: AvailableIcons,
  emptyMessage: TranslationConfig.optional()
})

export type WorkqueueConfig = z.infer<typeof WorkqueueConfig>
export type WorkqueueConfigWithoutQuery = z.infer<
  typeof WorkqueueConfigWithoutQuery
>
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
