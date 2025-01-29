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
import { Conditional } from '../conditionals/conditionals'
import {
  BulletListFieldValue,
  CheckboxFieldValue,
  CountryFieldValue,
  DateFieldValue,
  FileFieldValue,
  LocationFieldValue,
  ParagraphFieldValue,
  RadioGroupFieldValue,
  SelectFieldValue,
  TextFieldValue
} from './FieldValue'

export const ConditionalTypes = {
  SHOW: 'SHOW',
  HIDE: 'HIDE',
  ENABLE: 'ENABLE'
} as const

export type ConditionalTypes =
  (typeof ConditionalTypes)[keyof typeof ConditionalTypes]

const FieldId = z.string()

const ShowConditional = z.object({
  type: z.literal(ConditionalTypes.SHOW),
  conditional: Conditional()
})

const HideConditional = z.object({
  type: z.literal(ConditionalTypes.HIDE),
  conditional: Conditional()
})

const EnableConditional = z.object({
  type: z.literal(ConditionalTypes.ENABLE),
  conditional: Conditional()
})

const FieldConditional = z.discriminatedUnion('type', [
  ShowConditional,
  HideConditional,
  EnableConditional
])

const BaseField = z.object({
  id: FieldId,
  conditionals: z.array(FieldConditional).default([]).optional(),
  initialValue: z
    .union([
      z.string(),
      z.object({
        dependsOn: z.array(FieldId).default([]),
        expression: z.string()
      })
    ])
    .optional(),
  required: z.boolean().default(false).optional(),
  disabled: z.boolean().default(false).optional(),
  hidden: z.boolean().default(false).optional(),
  placeholder: TranslationConfig.optional(),
  validation: z
    .array(
      z.object({
        validator: Conditional(),
        message: TranslationConfig
      })
    )
    .default([])
    .optional(),
  dependsOn: z.array(FieldId).default([]).optional(),
  label: TranslationConfig
})

export type BaseField = z.infer<typeof BaseField>

export const FieldType = {
  TEXT: 'TEXT',
  DATE: 'DATE',
  PARAGRAPH: 'PARAGRAPH',
  RADIO_GROUP: 'RADIO_GROUP',
  FILE: 'FILE',
  HIDDEN: 'HIDDEN',
  BULLET_LIST: 'BULLET_LIST',
  CHECKBOX: 'CHECKBOX',
  SELECT: 'SELECT',
  COUNTRY: 'COUNTRY',
  LOCATION: 'LOCATION',
  LOCATION_SEARCH_INPUT: 'LOCATION_SEARCH_INPUT'
} as const

export const fieldTypes = Object.values(FieldType)
export type FieldType = (typeof fieldTypes)[number]

export interface FieldValueByType {
  [FieldType.TEXT]: TextFieldValue
  [FieldType.DATE]: DateFieldValue
  [FieldType.PARAGRAPH]: ParagraphFieldValue
  [FieldType.RADIO_GROUP]: RadioGroupFieldValue
  [FieldType.BULLET_LIST]: BulletListFieldValue
  [FieldType.CHECKBOX]: CheckboxFieldValue
  [FieldType.COUNTRY]: CountryFieldValue
  [FieldType.LOCATION]: LocationFieldValue
  [FieldType.FILE]: FileFieldValue
  [FieldType.SELECT]: SelectFieldValue
}

const TextField = BaseField.extend({
  type: z.literal(FieldType.TEXT),
  options: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text'),
      type: z.enum(['text', 'email', 'password', 'number']).optional()
    })
    .default({ type: 'text' })
    .optional()
}).describe('Text input')

const DateField = BaseField.extend({
  type: z.literal(FieldType.DATE),
  options: z
    .object({
      notice: TranslationConfig.describe(
        'Text to display above the date input'
      ).optional()
    })
    .optional()
}).describe('A single date input (dd-mm-YYYY)')

const HTMLFontVariant = z.enum([
  'reg12',
  'reg14',
  'reg16',
  'reg18',
  'h4',
  'h3',
  'h2',
  'h1'
])

const Paragraph = BaseField.extend({
  type: z.literal(FieldType.PARAGRAPH),
  options: z
    .object({
      fontVariant: HTMLFontVariant.optional()
    })
    .default({})
}).describe('A read-only HTML <p> paragraph')

const File = BaseField.extend({
  type: z.literal(FieldType.FILE)
}).describe('File upload')

const SelectOption = z.object({
  value: z.string().describe('The value of the option'),
  label: TranslationConfig.describe('The label of the option')
})

const RadioGroup = BaseField.extend({
  type: z.literal(FieldType.RADIO_GROUP),
  options: z.array(SelectOption),
  flexDirection: z
    .enum(['row', 'row-reverse', 'column', 'column-reverse'])
    .optional()
    .describe('Direction to stack the options')
}).describe('Grouped radio options')

const BulletList = BaseField.extend({
  type: z.literal(FieldType.BULLET_LIST),
  items: z.array(TranslationConfig).describe('A list of items'),
  font: HTMLFontVariant
}).describe('A list of bullet points')

const Select = BaseField.extend({
  type: z.literal(FieldType.SELECT),
  options: z.array(SelectOption).describe('A list of options')
}).describe('Select input')

const Checkbox = BaseField.extend({
  type: z.literal(FieldType.CHECKBOX)
}).describe('Check Box')

const Country = BaseField.extend({
  type: z.literal(FieldType.COUNTRY)
}).describe('Country select field')

const LocationOptions = z.object({
  partOf: z
    .object({
      $data: z.string()
    })
    .optional()
    .describe('Parent location'),
  type: z.enum(['ADMIN_STRUCTURE', 'HEALTH_FACILITY', 'CRVS_OFFICE'])
})

const Location = BaseField.extend({
  type: z.literal(FieldType.LOCATION),
  options: LocationOptions
}).describe('Location input field')

const LocationSearchInput = BaseField.extend({
  type: z.literal(FieldType.LOCATION_SEARCH_INPUT),
  searchableResource: z.array(z.enum(['facilities', 'locations', 'offices']))
})

export const FieldConfig = z.discriminatedUnion('type', [
  TextField,
  DateField,
  Paragraph,
  RadioGroup,
  BulletList,
  Select,
  Checkbox,
  File,
  Country,
  Location,
  LocationSearchInput
])

export type SelectField = z.infer<typeof Select>
export type LocationField = z.infer<typeof Location>
export type FieldConfig = z.infer<typeof FieldConfig>

export type FieldProps<T extends FieldType> = Extract<FieldConfig, { type: T }>
export type SelectOption = z.infer<typeof SelectOption>
export type LocationOptions = z.infer<typeof LocationOptions>
export type FieldConditional = z.infer<typeof FieldConditional>
