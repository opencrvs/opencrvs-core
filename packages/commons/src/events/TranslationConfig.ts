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

export const TranslationConfig = z.object({
  id: z
    .string()
    .describe(
      'The identifier of the translation referred in translation CSV files'
    ),
  defaultMessage: z.string().describe('Default translation message'),
  description: z
    .string()
    .describe(
      'Describe the translation for a translator to be able to identify it.'
    )
})
export type TranslationConfig = z.infer<typeof TranslationConfig>
