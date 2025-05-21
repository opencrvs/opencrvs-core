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

import { TranslationConfig } from '../events/TranslationConfig'
import { z } from 'zod'
import { DefaultColumnKeys, WorkQueueColumnConfig } from './defaultColumns'

/** @knipignore */
const rootWorkqueueConfig = z.object({
  id: z.string(),
  title: TranslationConfig,
  columns: z.array(WorkQueueColumnConfig),
  defaultColumns: z.array(DefaultColumnKeys)
})

export type RootWorkqueueConfig = z.infer<typeof rootWorkqueueConfig>

export const defineWorkqueue = (config: RootWorkqueueConfig) =>
  rootWorkqueueConfig.parse(config)
