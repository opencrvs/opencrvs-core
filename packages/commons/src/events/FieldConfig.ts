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
/*  eslint-disable max-lines */
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
  SelectDateRangeValue,
  TimeValue,
  ButtonFieldValue,
  VerificationStatusValue
} from './FieldValue'
import {
  AddressFieldValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  HttpFieldValue
} from './CompositeFieldValue'
import { extendZodWithOpenApi } from 'zod-openapi'
import { UUID } from '../uuid'
import { SerializedUserField } from './serializers/user/serializer'
extendZodWithOpenApi(z)

const FieldId = z
  .string()
  .refine(
    /*
     * Disallow underscores '_' in field ids.
     * Why? Theres two reasons:
     *   1. We transform dots to underscores as separator in Formik field ids, so this avoids any issues with the Formik transformations.
     *   2. On Kysely-SQL queries, we use the CamelCasePlugin. This plugin transforms snake_case to camelCase also on nested (jsonb) object keys.
     *      This could be disabled via 'maintainNestedObjectKeys: true', but this would also affect SQL queries which use e.g. json_agg() or to_jsonb() to aggregate results.
     */
    (val) => !val.includes('_'),
    (val) => ({
      message: `id: '${val}' must not contain underscores '_'`
    })
  )
  .describe('Unique identifier for the field')

export const FieldReference = z
  .object({
    $$field: FieldId,
    $$subfield: z
      .array(z.string())
      .optional()
      .describe(
        'If the FieldValue is an object, subfield can be used to refer to e.g. `["foo", "bar"]` in `{ foo: { bar: 3 } }`'
      )
  })
  .describe('Reference to a field by its ID')

export type FieldReference = z.infer<typeof FieldReference>

export const ValidationConfig = z.object({
  validator: Conditional,
  message: TranslationConfig
})

export type ValidationConfig = z.infer<typeof ValidationConfig>
const requiredSchema = z
  .union([
    z.boolean(),
    z.object({
      message: TranslationConfig.describe('Custom required validation message')
    })
  ])
  .default(false)
  .optional()

const BaseField = z.object({
  id: FieldId,
  label: TranslationConfig,
  parent: FieldReference.or(z.array(FieldReference))
    .optional()
    .describe(
      'Reference to a parent field. If a field has parent(s), it will be reset when any parent field is changed.'
    ),
  required: requiredSchema,
  disabled: z.boolean().default(false).optional(),
  conditionals: z.array(FieldConditional).default([]).optional(),
  secured: z.boolean().default(false).optional(),
  placeholder: TranslationConfig.optional(),
  validation: z.array(ValidationConfig).default([]).optional(),
  helperText: TranslationConfig.optional(),
  hideLabel: z.boolean().default(false).optional(),
  uncorrectable: z
    .boolean()
    .default(false)
    .optional()
    .describe(
      'Indicates if the field can be changed during a record correction.'
    ),
  value: FieldReference.or(z.array(FieldReference))
    .optional()
    .describe(
      'Reference to a parent field. If field has a value, the value will be copied when the parent field is changed. If a list is provided, the first truthy value will be used'
    ),
  analytics: z
    .boolean()
    .default(false)
    .optional()
    .describe(
      'Meta field for analytics to allow filtering non-analytics fields away'
    )
})

export type BaseField = z.infer<typeof BaseField>

const Divider = BaseField.extend({
  type: z.literal(FieldType.DIVIDER)
})
export type Divider = z.infer<typeof Divider>

export const TextField = BaseField.extend({
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

export const DocumentMimeType = z.enum([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text'
])

export const MimeType = z.enum([
  ...ImageMimeType.options,
  ...DocumentMimeType.options
])
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

const TimeField = BaseField.extend({
  type: z.literal(FieldType.TIME),
  defaultValue: TimeValue.optional(),
  configuration: z
    .object({
      notice: TranslationConfig.describe(
        'Text to display above the time input'
      ).optional()
    })
    .optional()
}).describe('A single date input (HH-mm)')

export type TimeField = z.infer<typeof TimeField>

const DateRangeField = BaseField.extend({
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

const ParagraphConfiguration = z
  .object({
    styles: z
      .object({
        fontVariant: HtmlFontVariant.optional().describe(
          'Font variant to use for the paragraph text'
        ),
        hint: z
          .boolean()
          .optional()
          .describe('When true, paragraph is styled as a hint with grey color')
      })
      .optional()
  })
  .default({})

export type ParagraphConfiguration = z.infer<typeof ParagraphConfiguration>

const Paragraph = BaseField.extend({
  type: z.literal(FieldType.PARAGRAPH),
  defaultValue: NonEmptyTextValue.optional(),
  configuration: ParagraphConfiguration
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
  label: z
    .union([z.string(), TranslationConfig])
    .describe('The label of the option')
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
  options: z.array(SelectOption).describe('A list of options'),
  noOptionsMessage: TranslationConfig.optional().describe(
    `
    A translation configuration object used to display a message when no options are available.
    It must follow the shape: { id: string; defaultMessage: string; description?: string }.
    The message is rendered via intl.formatMessage(noOptionsMessage, { input }),
    where 'input' represents the text entered in the Select field.
    You can reference this variable in your message, for example:
    { ..., defaultMessage: "'{input}' is not listed among the health facilities." }
  `
  )
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

export const NameConfig = z.object({
  firstname: z
    .object({ required: requiredSchema, label: TranslationConfig.optional() })
    .optional(),
  middlename: z
    .object({ required: requiredSchema, label: TranslationConfig.optional() })
    .optional(),
  surname: z
    .object({ required: requiredSchema, label: TranslationConfig.optional() })
    .optional()
})

export type NameConfig = z.infer<typeof NameConfig>

const NameField = BaseField.extend({
  type: z.literal(FieldType.NAME),
  defaultValue: z
    .object({
      firstname: NonEmptyTextValue.optional(),
      middlename: NonEmptyTextValue.optional(),
      surname: NonEmptyTextValue.optional()
    })
    .optional(),
  configuration: z
    .object({
      name: NameConfig.default({
        firstname: { required: true },
        surname: { required: true }
      }).optional(),
      order: z.array(z.enum(['firstname', 'middlename', 'surname'])).optional(),
      maxLength: z.number().optional().describe('Maximum length of the text'),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional()
    })
    .default({
      name: {
        firstname: { required: true },
        surname: { required: true }
      }
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
  defaultValue: CheckboxFieldValue.default(false)
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

const LocationInput = BaseField.extend({
  type: z.literal(FieldType.LOCATION),
  defaultValue: NonEmptyTextValue.optional(),
  configuration: z.object({
    searchableResource: z.array(z.enum(['locations', 'facilities', 'offices']))
  })
}).describe('Input field for a location')

export type LocationInput = z.infer<typeof LocationInput>

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

export const DefaultAddressFieldValue = AddressFieldValue.extend({
  administrativeArea: z.union([UUID, SerializedUserField]).optional()
})

export type DefaultAddressFieldValue = z.infer<typeof DefaultAddressFieldValue>

const Address = BaseField.extend({
  type: z.literal(FieldType.ADDRESS),
  configuration: z
    .object({
      lineSeparator: z.string().optional(),
      fields: z.array(z.enum(['country', 'administrativeArea'])).optional(),
      administrativeLevels: z.array(z.string()).optional(),
      streetAddressForm: z
        .array(
          z.object({
            id: z.string(),
            required: requiredSchema,
            label: TranslationConfig,
            type: z.literal(FieldType.TEXT),
            conditionals: z.array(FieldConditional).default([]).optional(),
            parent: FieldReference.optional()
          })
        )
        .optional()
    })
    .optional(),
  defaultValue: DefaultAddressFieldValue.optional()
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

const ButtonField = BaseField.extend({
  type: z.literal(FieldType.BUTTON),
  defaultValue: ButtonFieldValue.optional(),
  configuration: z.object({
    icon: z
      .string()
      .optional()
      .describe(
        'Icon for the button. You can find icons from OpenCRVS UI-Kit.'
      ),
    loading: z
      .boolean()
      .optional()
      .describe('Whether the button is in a loading state and shows a spinner'),
    text: TranslationConfig.describe('Text to display on the button')
  })
}).describe('Generic button without any built-in functionality')

export type ButtonField = z.infer<typeof ButtonField>

// This is an alpha version of the print button and it is not recommended for use and will change in the future
const AlphaPrintButton = BaseField.extend({
  type: z.literal(FieldType.ALPHA_PRINT_BUTTON),
  configuration: z.object({
    template: z
      .string()
      .describe('Template ID from countryconfig templates to use for printing'),
    buttonLabel: TranslationConfig.optional().describe(
      'Label for the print button'
    )
  })
}).describe('Print button field for printing certificates')

export type AlphaPrintButton = z.infer<typeof AlphaPrintButton>

const HttpField = BaseField.extend({
  type: z.literal(FieldType.HTTP),
  defaultValue: HttpFieldValue.optional(),
  configuration: z.object({
    trigger: FieldReference,
    url: z.string().describe('URL to send the HTTP request to'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    headers: z.record(z.string()).optional(),
    body: z.record(z.string()).optional(),
    params: z
      .record(z.string(), z.union([z.string(), FieldReference]))
      .optional(),
    timeout: z
      .number()
      .default(15000)
      .describe('Request timeout in milliseconds')
  })
}).describe('HTTP request function triggered by a button click or other event')

export type HttpField = z.infer<typeof HttpField>

const LinkButtonField = BaseField.extend({
  type: z.literal(FieldType.LINK_BUTTON),
  configuration: z.object({
    url: z.string().describe('URL to open'),
    text: TranslationConfig.describe('Text to display on the button')
  })
}).describe('Button that opens a link')

export type LinkButtonField = z.infer<typeof LinkButtonField>

const VerificationStatus = BaseField.extend({
  type: z.literal(FieldType.VERIFICATION_STATUS),
  defaultValue: VerificationStatusValue.optional(),
  configuration: z.object({
    status: TranslationConfig.describe('Text to display on the status pill.'),
    description: TranslationConfig.describe(
      'Explaining text on the banner in form.'
    )
  })
})

export type VerificationStatus = z.infer<typeof VerificationStatus>

const QueryParamReaderField = BaseField.extend({
  type: z.literal(FieldType.QUERY_PARAM_READER),
  configuration: z.object({
    formProjection: z
      .record(z.string())
      .optional()
      .describe('Projection of the field value after parsing the query string')
  })
}).describe(
  'A field that maps URL query params into form values and clears them afterward'
)

export type QueryParamReaderField = z.infer<typeof QueryParamReaderField>

/** @knipignore */
export type FieldConfig =
  | z.infer<typeof Address>
  | z.infer<typeof TextField>
  | z.infer<typeof NumberField>
  | z.infer<typeof TextAreaField>
  | z.infer<typeof DateField>
  | z.infer<typeof TimeField>
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
  | z.infer<typeof LocationInput>
  | z.infer<typeof Facility>
  | z.infer<typeof Office>
  | z.infer<typeof SignatureField>
  | z.infer<typeof EmailField>
  | z.infer<typeof DataField>
  | z.infer<typeof ButtonField>
  | z.infer<typeof AlphaPrintButton>
  | z.infer<typeof HttpField>
  | z.infer<typeof LinkButtonField>
  | z.infer<typeof VerificationStatus>
  | z.infer<typeof QueryParamReaderField>

/** @knipignore */
/**
 * This is the type that should be used for the input of the FieldConfig. Useful when config uses zod defaults.
 */
export type FieldConfigInput =
  | z.input<typeof Address>
  | z.input<typeof TextField>
  | z.input<typeof TimeField>
  | z.input<typeof SelectDateRangeField>
  | z.input<typeof ButtonField>
  | z.input<typeof AlphaPrintButton>
  | z.input<typeof NumberField>
  | z.input<typeof TextAreaField>
  | z.input<typeof DateField>
  | z.input<typeof DateRangeField>
  | z.input<typeof Paragraph>
  | z.input<typeof RadioGroup>
  | z.input<typeof BulletList>
  | z.input<typeof PageHeader>
  | z.input<typeof Select>
  | z.input<typeof NameField>
  | z.input<typeof PhoneField>
  | z.input<typeof IdField>
  | z.input<typeof Checkbox>
  | z.input<typeof File>
  | z.input<typeof FileUploadWithOptions>
  | z.input<typeof Country>
  | z.input<typeof AdministrativeArea>
  | z.input<typeof Divider>
  | z.input<typeof LocationInput>
  | z.input<typeof Facility>
  | z.input<typeof Office>
  | z.input<typeof SignatureField>
  | z.input<typeof EmailField>
  | z.input<typeof DataField>
  | z.input<typeof HttpField>
  | z.input<typeof LinkButtonField>
  | z.input<typeof VerificationStatus>
  | z.input<typeof QueryParamReaderField>
/*
 *  Using explicit type for the FieldConfig schema intentionally as it's
 *  referenced quite extensively througout various other schemas. Leaving the
 *  type to be inferred causes typescript compiler to fail with "inferred type
 *  exeeds max lenght"
 */
export const FieldConfig: z.ZodType<
  FieldConfig,
  z.ZodTypeDef,
  FieldConfigInput
> = z
  .discriminatedUnion('type', [
    Address,
    TextField,
    NumberField,
    TextAreaField,
    DateField,
    TimeField,
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
    LocationInput,
    Facility,
    Office,
    SignatureField,
    EmailField,
    FileUploadWithOptions,
    DataField,
    ButtonField,
    AlphaPrintButton,
    HttpField,
    LinkButtonField,
    VerificationStatus,
    QueryParamReaderField
  ])
  .openapi({
    description: 'Form field configuration',
    ref: 'FieldConfig'
  })

export type SelectField = z.infer<typeof Select>
export type NameField = z.infer<typeof NameField>
export type PhoneField = z.infer<typeof PhoneField>
export type IdField = z.infer<typeof IdField>
export type LocationField = z.infer<typeof LocationInput>
export type RadioField = z.infer<typeof RadioGroup>
export type AddressField = z.infer<typeof Address>
export type NumberField = z.infer<typeof NumberField>
export type FieldProps<T extends FieldType> = Extract<FieldConfig, { type: T }>
export type FieldPropsWithoutReferenceValue<T extends FieldType> = Omit<
  Extract<FieldConfig, { type: T }>,
  'value'
>
export type SelectOption = z.infer<typeof SelectOption>

export type AdministrativeAreaConfiguration = z.infer<
  typeof AdministrativeAreaConfiguration
>

/**
 * Union of file-related fields. Using common type should help with compiler to know where to add new cases.
 */
export const AnyFileField = z.discriminatedUnion('type', [
  SignatureField,
  File,
  FileUploadWithOptions
])

export type AnyFileField = z.infer<typeof AnyFileField>

export type FieldTypeToFieldConfig<T extends FieldType> = Extract<
  FieldConfigInput,
  { type: T }
>
