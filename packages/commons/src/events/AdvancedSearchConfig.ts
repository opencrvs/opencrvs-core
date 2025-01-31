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
import { FieldConfig } from './FieldConfig'

export const AdvancedSearchConfig = z.object({
  id: z.string().describe('Advanced search tab button id'),
  title: TranslationConfig.describe('Advanced search tab title'),
  fields: z.array(FieldConfig).describe('Advanced search fields.')
})

export type AdvancedSearchConfig = z.infer<typeof AdvancedSearchConfig>
