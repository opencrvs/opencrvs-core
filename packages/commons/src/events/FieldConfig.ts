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

const TextField = z
  .object({
    type: z.literal('TEXT'),
    id: z.string(),
    required: z.boolean(),
    label: TranslationConfig,
    options: z
      .object({
        maxLength: z.number().describe('Maximum length of the text')
      })
      .optional()
  })
  .describe('Text input')

const DateField = z
  .object({
    type: z.literal('DATE'),
    id: z.string(),
    required: z.boolean(),
    label: TranslationConfig,
    options: z
      .object({
        notice: TranslationConfig.describe(
          'Text to display above the date input'
        )
      })
      .optional()
  })
  .describe('A single date input (dd-mm-YYYY)')

const Paragraph = z
  .object({ type: z.literal('PARAGRAPH'), label: TranslationConfig })
  .describe('A read-only HTML <p> paragraph')

const RadioGroup = z
  .object({
    type: z.literal('RADIO_GROUP'),
    name: z.string(),
    required: z.boolean(),
    label: TranslationConfig,
    options: z.array(
      z.object({
        value: z.string().describe('The value of the option'),
        label: z.string().describe('The label of the option')
      })
    )
  })
  .describe('Grouped radio options')

export const FieldConfig = z.discriminatedUnion('type', [
  TextField,
  DateField,
  Paragraph,
  RadioGroup
])

export type FieldConfig = z.infer<typeof FieldConfig>
export type FieldType = FieldConfig['type']
export type FieldProps<T extends FieldType> = Extract<FieldConfig, { type: T }>
