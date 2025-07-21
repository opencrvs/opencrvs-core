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
import { TranslationConfig } from '../TranslationConfig'

const FontFamily = z.object({
  normal: z.string(),
  bold: z.string(),
  italics: z.string(),
  bolditalics: z.string()
})
/**
 * Represents API response from country-config
 */
export const CertificateConfig = z.object({
  id: z.string(),
  event: z.string(),
  label: TranslationConfig,
  isDefault: z.boolean(),
  fee: z.object({
    onTime: z.number(),
    late: z.number(),
    delayed: z.number()
  }),
  svgUrl: z.string(),
  fonts: z.record(FontFamily).optional()
})

/**
 * Represents the way client uses it
 */
export const CertificateTemplateConfig = CertificateConfig.extend({
  hash: z.string().optional(),
  svg: z.string()
})

export type CertificateTemplateConfig = z.infer<
  typeof CertificateTemplateConfig
>
