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
import { Conditional, FieldConditional } from './Conditional'
import { TranslationConfig } from './TranslationConfig'
import { FieldType } from './FieldType'
import {
  CheckboxFieldValue,
  DateValue,
  NumberFieldValue,
  NonEmptyTextValue,
  TextValue,
  DateRangeFieldValue,
  SignatureFieldValue,
  SelectDateRangeValue
} from './FieldValue'
import {
  AddressFieldValue,
  FileFieldValue,
  FileFieldWithOptionValue
} from './CompositeFieldValue'
import { extendZodWithOpenApi } from 'zod-openapi'
extendZodWithOpenApi(z)

const FieldId = z.string().describe('Unique identifier for the field')

export const FieldReference = z
  .object({
    $$field: FieldId
  })
  .describe('Reference to a field by its ID')

const ParentReference = FieldReference.optional()

export const ValidationConfig = z.object({
  validator: Conditional,
  message: TranslationConfig
})

export type ValidationConfig = z.infer<typeof ValidationConfig>

const BaseField = z.object({
  id: FieldId,
  parent: ParentReference,
  conditionals: z.array(FieldConditional).default([]).optional(),
  required: z.boolean().default(false).optional(),
  secured: z.boolean().default(false).optional(),
  placeholder: TranslationConfig.optional(),
  validation: z.array(ValidationConfig).default([]).optional(),
  label: TranslationConfig,
  helperText: TranslationConfig.optional(),
  hideLabel: z.boolean().default(false).optional()
})

export type BaseField = z.infer<typeof BaseField>

const Divider = BaseField.extend({
  type: z.literal(FieldType.DIVIDER)
})
export type Divider = z.infer<typeof Divider>

const TextField = BaseField.extend({
  type: z.literal(FieldType.TEXT),
  defaultValue: NonEmptyTextValue.optional(),
  configuration: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text'),
      type: z.enum(['text', 'password']).optional(),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional()
    })
    .default({ type: 'text' })
    .optional()
}).describe('Text input')

export type TextField = z.infer<typeof TextField>

const NumberField = BaseField.extend({
  type: z.literal(FieldType.NUMBER),
  defaultValue: NumberFieldValue.optional(),
  configuration: z
    .object({
      min: z.number().optional().describe('Minimum value'),
      max: z.number().optional().describe('Maximum value'),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional()
    })
    .optional()
}).describe('Number input')

const TextAreaField = BaseField.extend({
  type: z.literal(FieldType.TEXTAREA),
  defaultValue: NonEmptyTextValue.optional(),
  configuration: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text'),
      rows: z.number().optional().describe('Number of visible text lines'),
      cols: z.number().optional().describe('Number of visible columns'),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional()
    })
    .default({ rows: 4 })
    .optional()
}).describe('Multiline text input')

export type TextAreaField = z.infer<typeof TextAreaField>

export const ImageMimeType = z.enum([
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/svg+xml'
])

export const MimeType = ImageMimeType
export type MimeType = z.infer<typeof MimeType>

const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

const SignatureField = BaseField.extend({
  type: z.literal(FieldType.SIGNATURE),
  signaturePromptLabel: TranslationConfig.describe(
    'Title of the signature modal'
  ),
  defaultValue: SignatureFieldValue.optional(),
  configuration: z
    .object({
      maxFileSize: z
        .number()
        .describe('Maximum file size in bytes')
        .default(DEFAULT_MAX_FILE_SIZE_BYTES),
      acceptedFileTypes: MimeType.array()
        .optional()
        .describe('List of allowed file formats for the signature')
    })
    .default({
      maxFileSize: DEFAULT_MAX_FILE_SIZE_BYTES
    })
}).describe('Signature input field')

export type SignatureField = z.infer<typeof SignatureField>

export const EmailField = BaseField.extend({
  type: z.literal(FieldType.EMAIL),
  configuration: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text')
    })
    .default({ maxLength: 10 })
    .optional(),
  defaultValue: NonEmptyTextValue.optional()
})

export type EmailField = z.infer<typeof EmailField>

const DateField = BaseField.extend({
  type: z.literal(FieldType.DATE),
  defaultValue: DateValue.optional(),
  configuration: z
    .object({
      notice: TranslationConfig.describe(
        'Text to display above the date input'
      ).optional()
    })
    .optional()
}).describe('A single date input (yyyy-MM-dd)')

export type DateField = z.infer<typeof DateField>

/**
 * For internal use only. Needed for search functionality.
 */
export const DateRangeField = BaseField.extend({
  type: z.literal(FieldType.DATE_RANGE),
  defaultValue: DateRangeFieldValue.optional(),
  configuration: z
    .object({
      notice: TranslationConfig.describe(
        'Text to display above the date input'
      ).optional()
    })
    .optional()
}).describe('A date range input ({ start: yyyy-MM-dd, end: yyyy-MM-dd })')

export type DateRangeField = z.infer<typeof DateRangeField>

const HtmlFontVariant = z.enum([
  'reg12',
  'reg14',
  'reg16',
  'reg18',
  'h4',
  'h3',
  'h2',
  'h1'
])

export type HtmlFontVariant = z.infer<typeof HtmlFontVariant>

const Paragraph = BaseField.extend({
  type: z.literal(FieldType.PARAGRAPH),
  defaultValue: NonEmptyTextValue.optional(),
  configuration: z
    .object({
      styles: z
        .object({
          fontVariant: HtmlFontVariant.optional()
        })
        .optional()
    })
    .default({})
}).describe('A read-only HTML <p> paragraph')

export type Paragraph = z.infer<typeof Paragraph>

const PageHeader = BaseField.extend({
  type: z.literal(FieldType.PAGE_HEADER),
  defaultValue: NonEmptyTextValue.optional()
}).describe('A read-only header component for form pages')

export type PageHeader = z.infer<typeof PageHeader>

const File = BaseField.extend({
  type: z.literal(FieldType.FILE),
  defaultValue: FileFieldValue.optional(),
  configuration: z
    .object({
      maxFileSize: z
        .number()
        .describe('Maximum file size in bytes')
        .default(DEFAULT_MAX_FILE_SIZE_BYTES),
      acceptedFileTypes: MimeType.array()
        .optional()
        .describe('List of allowed file formats for the signature'),
      style: z
        .object({
          width: z
            .enum(['full', 'auto'])
            .optional()
            .describe(
              'Whether the file upload button should take the full width of the container or not'
            )
        })
        .optional(),
      fileName: TranslationConfig.optional()
    })
    .default({
      maxFileSize: DEFAULT_MAX_FILE_SIZE_BYTES
    })
}).describe('File upload')

export type File = z.infer<typeof File>

export const SelectOption = z.object({
  value: z.string().describe('The value of the option'),
  label: TranslationConfig.describe('The label of the option')
})

const RadioGroup = BaseField.extend({
  type: z.literal(FieldType.RADIO_GROUP),
  defaultValue: TextValue.optional(),
  options: z.array(SelectOption).describe('A list of options'),
  configuration: z
    .object({
      styles: z
        .object({
          size: z.enum(['NORMAL', 'LARGE']).optional()
        })
        .optional()
    })
    .optional()
}).describe('Grouped radio options')

export type RadioGroup = z.infer<typeof RadioGroup>

const BulletList = BaseField.extend({
  type: z.literal(FieldType.BULLET_LIST),
  defaultValue: TextValue.optional(),
  items: z.array(TranslationConfig).describe('A list of items'),
  configuration: z
    .object({
      styles: z
        .object({
          fontVariant: HtmlFontVariant.optional()
        })
        .optional()
    })
    .default({})
}).describe('A list of bullet points')

export type BulletList = z.infer<typeof BulletList>

const Select = BaseField.extend({
  type: z.literal(FieldType.SELECT),
  defaultValue: TextValue.optional(),
  options: z.array(SelectOption).describe('A list of options')
}).describe('Select input')

export const SelectDateRangeOption = z.object({
  value: SelectDateRangeValue.describe('The value of the option'),
  label: TranslationConfig.describe('The label of the option')
})

export type SelectDateRangeOption = z.infer<typeof SelectDateRangeOption>

/**
 * For internal use only. Needed for search functionality.
 */
export const SelectDateRangeField = BaseField.extend({
  type: z.literal(FieldType.SELECT_DATE_RANGE),
  defaultValue: SelectDateRangeValue.optional(),
  options: z.array(SelectDateRangeOption).describe('A list of options')
}).describe('Select input with date range options')

export type SelectDateRangeField = z.infer<typeof SelectDateRangeField>

const NameField = BaseField.extend({
  type: z.literal(FieldType.NAME),
  defaultValue: z
    .object({
      firstname: NonEmptyTextValue,
      surname: NonEmptyTextValue
    })
    .optional(),
  configuration: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text'),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional(),
      includeMiddlename: z
        .boolean()
        .default(false)
        .optional()
        .describe('To make middle name visible in Name form field'),
      searchMode: z.boolean().optional()
    })
    .optional()
}).describe('Name input field')

const PhoneField = BaseField.extend({
  defaultValue: NonEmptyTextValue.optional(),
  type: z.literal(FieldType.PHONE)
}).describe('Phone input field')

const IdField = BaseField.extend({
  defaultValue: NonEmptyTextValue.optional(),
  type: z.literal(FieldType.ID)
}).describe('ID input field')

const Checkbox = BaseField.extend({
  type: z.literal(FieldType.CHECKBOX),
  defaultValue: CheckboxFieldValue.optional()
}).describe('Boolean checkbox field')

export type Checkbox = z.infer<typeof Checkbox>

const Country = BaseField.extend({
  type: z.literal(FieldType.COUNTRY),
  defaultValue: NonEmptyTextValue.optional()
}).describe('Country select field')

export type Country = z.infer<typeof Country>

export const AdministrativeAreas = z.enum([
  'ADMIN_STRUCTURE',
  'HEALTH_FACILITY',
  'CRVS_OFFICE'
])

const AdministrativeAreaConfiguration = z
  .object({
    partOf: z
      .object({
        $declaration: z.string()
      })
      .optional()
      .describe('Parent location'),
    type: AdministrativeAreas
  })
  .describe('Administrative area options')

const AdministrativeArea = BaseField.extend({
  type: z.literal(FieldType.ADMINISTRATIVE_AREA),
  defaultValue: NonEmptyTextValue.optional(),
  configuration: AdministrativeAreaConfiguration
}).describe('Administrative area input field e.g. facility, office')

export type AdministrativeArea = z.infer<typeof AdministrativeArea>

const Location = BaseField.extend({
  type: z.literal(FieldType.LOCATION),
  defaultValue: NonEmptyTextValue.optional(),
  configuration: z
    .object({
      searchableResource: z
        .array(z.enum(['locations', 'facilities', 'offices']))
        .optional()
    })
    .optional()
}).describe('Input field for a location')

export type Location = z.infer<typeof Location>

const FileUploadWithOptions = BaseField.extend({
  type: z.literal(FieldType.FILE_WITH_OPTIONS),
  options: z.array(SelectOption).describe('A list of options'),
  defaultValue: FileFieldWithOptionValue.optional(),
  configuration: z
    .object({
      maxFileSize: z
        .number()
        .describe('Maximum file size in bytes')
        .default(DEFAULT_MAX_FILE_SIZE_BYTES),
      acceptedFileTypes: MimeType.array()
        .optional()
        .describe('List of allowed file formats for the signature')
    })
    .default({
      maxFileSize: DEFAULT_MAX_FILE_SIZE_BYTES
    })
})

export type FileUploadWithOptions = z.infer<typeof FileUploadWithOptions>

const Facility = BaseField.extend({
  type: z.literal(FieldType.FACILITY),
  defaultValue: NonEmptyTextValue.optional()
}).describe('Input field for a facility')

export type Facility = z.infer<typeof Facility>

const Office = BaseField.extend({
  type: z.literal(FieldType.OFFICE),
  defaultValue: NonEmptyTextValue.optional()
}).describe('Input field for an office')

export type Office = z.infer<typeof Office>

const Address = BaseField.extend({
  type: z.literal(FieldType.ADDRESS),
  defaultValue: AddressFieldValue.optional(),
  configuration: z
    .object({
      searchMode: z.boolean().optional()
    })
    .optional()
}).describe('Address input field – a combination of location and text fields')

export const DataEntry = z.union([
  z.object({
    label: TranslationConfig,
    value: TranslationConfig.or(z.string())
  }),
  z.object({
    fieldId: z.string()
  })
])
export type DataEntry = z.infer<typeof DataEntry>

const DataField = BaseField.extend({
  type: z.literal(FieldType.DATA),
  configuration: z.object({
    subtitle: TranslationConfig.optional(),
    data: z.array(DataEntry)
  })
}).describe('Data field for displaying read-only data')

export type DataField = z.infer<typeof DataField>

export type FieldConfig =
  | z.infer<typeof Address>
  | z.infer<typeof TextField>
  | z.infer<typeof NumberField>
  | z.infer<typeof TextAreaField>
  | z.infer<typeof DateField>
  | z.infer<typeof DateRangeField>
  | z.infer<typeof SelectDateRangeField>
  | z.infer<typeof Paragraph>
  | z.infer<typeof RadioGroup>
  | z.infer<typeof BulletList>
  | z.infer<typeof PageHeader>
  | z.infer<typeof Select>
  | z.infer<typeof NameField>
  | z.infer<typeof PhoneField>
  | z.infer<typeof IdField>
  | z.infer<typeof Checkbox>
  | z.infer<typeof File>
  | z.infer<typeof FileUploadWithOptions>
  | z.infer<typeof Country>
  | z.infer<typeof AdministrativeArea>
  | z.infer<typeof Divider>
  | z.infer<typeof Location>
  | z.infer<typeof Facility>
  | z.infer<typeof Office>
  | z.infer<typeof SignatureField>
  | z.infer<typeof EmailField>
  | z.infer<typeof DataField>

export const FieldConfig = z
  .discriminatedUnion('type', [
    Address,
    TextField,
    NumberField,
    TextAreaField,
    DateField,
    DateRangeField,
    SelectDateRangeField,
    Paragraph,
    RadioGroup,
    BulletList,
    PageHeader,
    Select,
    NameField,
    PhoneField,
    IdField,
    Checkbox,
    File,
    Country,
    AdministrativeArea,
    Divider,
    Location,
    Facility,
    Office,
    SignatureField,
    EmailField,
    FileUploadWithOptions,
    DataField
  ])
  .openapi({
    description: 'Form field configuration',
    ref: 'FieldConfig'
  })

export type SelectField = z.infer<typeof Select>
export type NameField = z.infer<typeof NameField>
export type PhoneField = z.infer<typeof PhoneField>
export type IdField = z.infer<typeof IdField>
export type LocationField = z.infer<typeof Location>
export type RadioField = z.infer<typeof RadioGroup>
export type AddressField = z.infer<typeof Address>
export type NumberField = z.infer<typeof NumberField>

export type FieldProps<T extends FieldType> = Extract<FieldConfig, { type: T }>
export type SelectOption = z.infer<typeof SelectOption>

export type AdministrativeAreaConfiguration = z.infer<
  typeof AdministrativeAreaConfiguration
>
