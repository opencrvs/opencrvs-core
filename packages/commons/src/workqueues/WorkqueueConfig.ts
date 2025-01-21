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

export const defaultColumns = z.enum(['dateOfEvent', 'dateOfRegister'])

export const rootWorkqueueConfig = z.object({
  id: z.string(),
  label: TranslationConfig,
  columns: z.array(z.object({ id: z.string(), label: TranslationConfig }))
})

export type RootWorkqueueConfig = z.infer<typeof rootWorkqueueConfig>

export const defineWorkQueue = (config: RootWorkqueueConfig) =>
  rootWorkqueueConfig.parse(config)
