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

export const handlebarTemplate = z.object({
  fieldName: z.string(),
  operation: z.string(),
  parameters: z.array(z.any()).optional()
})

export const messageDescriptor = z.object({
  defaultMessage: z.string().optional(),
  id: z.string(),
  description: z.string().optional()
})

export const conditional = z.object({
  description: z.string().optional(),
  action: z.string(),
  expression: z.string()
})

const dependencyInfo = z.object({
  dependsOn: z.array(z.string()),
  expression: z.string()
})
const initialValue = z
  .union([dependencyInfo, z.string(), z.number(), z.boolean()])
  .optional()

const base = z
  .object({
    name: z.string(),
    type: z.string(),
    initialValue,
    custom: z.boolean().optional(),
    label: messageDescriptor,
    conditionals: z.array(conditional).optional(),
    mapping: z
      .object({ template: handlebarTemplate.optional() })
      .passthrough()
      .optional()
  })
  .passthrough()

// TODO: complete below types
const TextField = base.extend({ type: z.literal('TEXT') })
const TelField = base.extend({ type: z.literal('TEL') })
const NumberField = base.extend({ type: z.literal('NUMBER') })
const BigNumberField = base.extend({ type: z.literal('BIG_NUMBER') })
const RadioGroupField = base.extend({ type: z.literal('RADIO_GROUP') })
const HiddenField = base.extend({ type: z.literal('HIDDEN') })
const RadioGroupWithNestedFieldsField = base.extend({
  type: z.literal('RADIO_GROUP_WITH_NESTED_FIELDS')
})
const InformativeRadioGroupField = base.extend({
  type: z.literal('INFORMATIVE_RADIO_GROUP')
})
const CheckboxGroupField = base.extend({ type: z.literal('CHECKBOX_GROUP') })
const CheckboxField = base.extend({ type: z.literal('CHECKBOX') })
const DateField = base.extend({ type: z.literal('DATE') })
const DateRangePickerField = base.extend({
  type: z.literal('DATE_RANGE_PICKER')
})
const TextareaField = base.extend({ type: z.literal('TEXTAREA') })
const SubsectionHeaderField = base.extend({
  type: z.literal('SUBSECTION_HEADER')
})
const FieldGroupTitleField = base.extend({
  type: z.literal('FIELD_GROUP_TITLE')
})
const BulletListField = base.extend({ type: z.literal('BULLET_LIST') })
const ParagraphField = base.extend({ type: z.literal('PARAGRAPH') })
const DocumentsField = base.extend({ type: z.literal('DOCUMENTS') })
const SelectWithOptionsField = base.extend({
  type: z.literal('SELECT_WITH_OPTIONS')
})
const SelectWithDynamicOptionsField = base.extend({
  type: z.literal('SELECT_WITH_DYNAMIC_OPTIONS')
})
const FieldWithDynamicDefinitionsField = base.extend({
  type: z.literal('FIELD_WITH_DYNAMIC_DEFINITIONS')
})
const ImageUploaderWithOptionsField = base.extend({
  type: z.literal('IMAGE_UPLOADER_WITH_OPTIONS')
})
const DocumentUploaderWithOptionField = base.extend({
  type: z.literal('DOCUMENT_UPLOADER_WITH_OPTION')
})
const SimpleDocumentUploaderField = base.extend({
  type: z.literal('SIMPLE_DOCUMENT_UPLOADER')
})
const WarningField = base.extend({ type: z.literal('WARNING') })
const LinkField = base.extend({ type: z.literal('LINK') })
const DynamicListField = base.extend({ type: z.literal('DYNAMIC_LIST') })
const FetchButtonField = base.extend({ type: z.literal('FETCH_BUTTON') })
const LocationSearchInputField = base.extend({
  type: z.literal('LOCATION_SEARCH_INPUT')
})
const TimeField = base.extend({ type: z.literal('TIME') })
const DividerField = base.extend({ type: z.literal('DIVIDER') })
const Heading3Field = base.extend({ type: z.literal('HEADING3') })
const SignatureField = base.extend({ type: z.literal('SIGNATURE') })
const LinkButtonField = base.extend({ type: z.literal('LINK_BUTTON') })
const IDReaderField = base.extend({ type: z.literal('ID_READER') })
const BannerField = base.extend({ type: z.literal('ID_VERIFICATION_BANNER') })

// completed types
const HttpField = base.extend({
  type: z.literal('HTTP'),
  options: z.object({
    url: z.string(),
    method: z.string(),
    headers: z.record(z.string(), z.any()).optional(),
    body: z.record(z.string(), z.any()).optional()
  })
})

const ButtonField = base.extend({
  type: z.literal('BUTTON'),
  options: z.object({
    trigger: z.string()
  }),
  buttonLabel: messageDescriptor,
  icon: z.string().optional()
})

export const field = z.discriminatedUnion('type', [
  TextField,
  TelField,
  NumberField,
  BigNumberField,
  RadioGroupField,
  HiddenField,
  RadioGroupWithNestedFieldsField,
  InformativeRadioGroupField,
  CheckboxGroupField,
  CheckboxField,
  DateField,
  DateRangePickerField,
  TextareaField,
  SubsectionHeaderField,
  FieldGroupTitleField,
  BulletListField,
  ParagraphField,
  DocumentsField,
  SelectWithOptionsField,
  SelectWithDynamicOptionsField,
  FieldWithDynamicDefinitionsField,
  ImageUploaderWithOptionsField,
  DocumentUploaderWithOptionField,
  SimpleDocumentUploaderField,
  WarningField,
  LinkField,
  DynamicListField,
  FetchButtonField,
  LocationSearchInputField,
  TimeField,
  DividerField,
  Heading3Field,
  SignatureField,
  HttpField,
  ButtonField,
  LinkButtonField,
  IDReaderField,
  BannerField
])

type Field = z.infer<typeof field>
type Button = z.infer<typeof ButtonField>

export function isButtonField(field: Field): field is Button {
  return field.type === 'BUTTON'
}
