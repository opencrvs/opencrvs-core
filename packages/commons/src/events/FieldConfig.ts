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

const BaseField = z.object({
  id: z.string(),
  required: z.boolean(),
  label: TranslationConfig
})

const TextField = BaseField.describe('Text input').merge(
  z.object({
    type: z.literal('TEXT'),
    options: z
      .object({
        maxLength: z.number().describe('Maximum length of the text')
      })
      .optional()
  })
)

const DateField = BaseField.describe('A single date input (dd-mm-YYYY)').merge(
  z.object({
    type: z.literal('DATE'),
    options: z.object({
      notice: TranslationConfig.describe('Text to display above the date input')
    })
  })
)

const Paragraph = BaseField.describe('A read-only HTML <p> paragraph').merge(
  z.object({ type: z.literal('PARAGRAPH') })
)

export const FieldConfig = z.discriminatedUnion('type', [
  TextField,
  DateField,
  Paragraph
])

export type FieldConfig = z.infer<typeof FieldConfig>
export type FieldType = FieldConfig['type']
export type FieldProps<T extends FieldType> = Extract<FieldConfig, { type: T }>
