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

/**
 * Configuration for workqueue. Workqueues are used to display a list of events.
 */
export const WorkqueueConfig = z
  .object({
    slug: z.string().describe('Determines the url of the workqueue.'),
    name: TranslationConfig.describe(
      'Title of the workflow (both in navigation and on the page)'
    ),
    /**
     * Placeholder untill the following gets merged to develop
     * https://github.com/opencrvs/opencrvs-core/blob/5fbe9854a88504a7a13fcc856b3e82594b70c38c/packages/commons/src/events/EventIndex.ts#L92-L93
     */
    query: z.string(),
    actions: z.array(
      z.object({
        type: z.string(),
        conditionals: z.array(Conditional).optional()
      })
    )
  })
  .describe('Configuration for workqueue.')

export type WorkqueueConfig = z.infer<typeof WorkqueueConfig>
export type WorkqueueConfigInput = z.input<typeof WorkqueueConfig>

export function defineWorkqueue(workqueues: WorkqueueConfigInput[]) {
  return workqueues.map((workqueue) => WorkqueueConfig.parse(workqueue))
}
