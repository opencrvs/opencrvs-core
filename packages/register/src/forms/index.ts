import { Validation, ValidationInitializer } from '../utils/validate'
import { FormattedMessage } from 'react-intl'
import {
  ISelectOption as SelectComponentOption,
  IRadioOption as RadioComponentOption,
  ICheckboxOption as CheckboxComponentOption
} from '@opencrvs/components/lib/forms'

export const TEXT = 'TEXT'
export const TEL = 'TEL'
export const NUMBER = 'NUMBER'
export const RADIO_GROUP = 'RADIO_GROUP'
export const INFORMATIVE_RADIO_GROUP = 'INFORMATIVE_RADIO_GROUP'
export const CHECKBOX_GROUP = 'CHECKBOX_GROUP'
export const DATE = 'DATE'
export const TEXTAREA = 'TEXTAREA'
export const SUBSECTION = 'SUBSECTION'
export const LIST = 'LIST'
export const PARAGRAPH = 'PARAGRAPH'
export const DOCUMENTS = 'DOCUMENTS'
export const SELECT_WITH_OPTIONS = 'SELECT_WITH_OPTIONS'
export const SELECT_WITH_DYNAMIC_OPTIONS = 'SELECT_WITH_DYNAMIC_OPTIONS'
export const TEXT_WITH_DYNAMIC_DEFINITIONS = 'TEXT_WITH_DYNAMIC_DEFINITIONS'
export const IMAGE_UPLOADER_WITH_OPTIONS = 'IMAGE_UPLOADER_WITH_OPTIONS'
export const WARNING = 'WARNING'

export interface ISelectOption {
  value: SelectComponentOption['value']
  label: FormattedMessage.MessageDescriptor
}
export interface IRadioOption {
  value: RadioComponentOption['value']
  label: FormattedMessage.MessageDescriptor
}
export interface ICheckboxOption {
  value: CheckboxComponentOption['value']
  label: FormattedMessage.MessageDescriptor
}

export interface IDynamicOptions {
  dependency: string
  resource?: string
  options?: { [key: string]: ISelectOption[] }
}

export interface IDynamicTextFieldValidators {
  validator: ValidationInitializer
  dependencies: string[]
}

export type IDynamicTextFieldLabelMapper = (
  key: string
) => FormattedMessage.MessageDescriptor

export interface IDynamicTextFieldDefinitions {
  label?: {
    dependency: string
    labelMapper: IDynamicTextFieldLabelMapper
  }
  validate?: IDynamicTextFieldValidators[]
}

export type IFormFieldValue = string | string[] | boolean | IFileValue[]

export type IFileValue = {
  optionValues: IFormFieldValue[]
  type: string
  data: string
}

export interface IFormFieldBase {
  name: string
  type: IFormField['type']
  label: FormattedMessage.MessageDescriptor
  validate: Validation[]
  required?: boolean
  prefix?: string
  postfix?: string
  disabled?: boolean
  initialValue?: IFormFieldValue
  conditionals?: IConditional[]
  description?: FormattedMessage.MessageDescriptor
}

export interface ISelectFormFieldWithOptions extends IFormFieldBase {
  type: typeof SELECT_WITH_OPTIONS
  options: ISelectOption[]
}
export interface ISelectFormFieldWithDynamicOptions extends IFormFieldBase {
  type: typeof SELECT_WITH_DYNAMIC_OPTIONS
  dynamicOptions: IDynamicOptions
}

export interface ITextFormFieldWithDynamicDefinitions extends IFormFieldBase {
  type: typeof TEXT_WITH_DYNAMIC_DEFINITIONS
  dynamicDefinitions: IDynamicTextFieldDefinitions
}

export interface IRadioGroupFormField extends IFormFieldBase {
  type: typeof RADIO_GROUP
  options: IRadioOption[]
}

export interface IInformativeRadioGroupFormField extends IFormFieldBase {
  type: typeof INFORMATIVE_RADIO_GROUP
  information: IFormSectionData
  options: IRadioOption[]
}

export interface ITextFormField extends IFormFieldBase {
  type: typeof TEXT
}

export interface ITelFormField extends IFormFieldBase {
  type: typeof TEL
}
export interface INumberFormField extends IFormFieldBase {
  type: typeof NUMBER
  step?: number
}
export interface ICheckboxGroupFormField extends IFormFieldBase {
  type: typeof CHECKBOX_GROUP
  options: ICheckboxOption[]
}
export interface IDateFormField extends IFormFieldBase {
  type: typeof DATE
}
export interface ITextareaFormField extends IFormFieldBase {
  type: typeof TEXTAREA
}
export interface ISubsectionFormField extends IFormFieldBase {
  type: typeof SUBSECTION
}
export interface IDocumentsFormField extends IFormFieldBase {
  type: typeof DOCUMENTS
}
export interface IListFormField extends IFormFieldBase {
  type: typeof LIST
  items: FormattedMessage.MessageDescriptor[]
}
export interface IParagraphFormField extends IFormFieldBase {
  type: typeof PARAGRAPH
  fontSize?: string
}
export interface IImageUploaderWithOptionsFormField extends IFormFieldBase {
  type: typeof IMAGE_UPLOADER_WITH_OPTIONS
  optionSection: IFormSection
}

export interface IWarningField extends IFormFieldBase {
  type: typeof WARNING
}

export type IFormField =
  | ITextFormField
  | ITelFormField
  | INumberFormField
  | ISelectFormFieldWithOptions
  | ISelectFormFieldWithDynamicOptions
  | ITextFormFieldWithDynamicDefinitions
  | IRadioGroupFormField
  | IInformativeRadioGroupFormField
  | ICheckboxGroupFormField
  | IDateFormField
  | ITextareaFormField
  | ISubsectionFormField
  | IDocumentsFormField
  | IListFormField
  | IParagraphFormField
  | IImageUploaderWithOptionsFormField
  | IWarningField

export type IDynamicFormField = ISelectFormFieldWithDynamicOptions &
  ITextFormFieldWithDynamicDefinitions

export interface IConditional {
  action: string
  expression: string
}

export interface IConditionals {
  iDType: IConditional
  fathersDetailsExist: IConditional
  permanentAddressSameAsMother: IConditional
  addressSameAsMother: IConditional
  countryPermanent: IConditional
  statePermanent: IConditional
  districtPermanent: IConditional
  addressLine4Permanent: IConditional
  addressLine3Permanent: IConditional
  country: IConditional
  state: IConditional
  district: IConditional
  addressLine4: IConditional
  addressLine3: IConditional
  uploadDocForWhom: IConditional
  motherCollectsCertificate: IConditional
  fatherCollectsCertificate: IConditional
  otherPersonCollectsCertificate: IConditional
  certificateCollectorNotVerified: IConditional
  currentAddressSameAsPermanent: IConditional
}

export type ViewType = 'form' | 'preview' | 'review'

export interface IFormSection {
  id: string
  viewType: ViewType
  name: FormattedMessage.MessageDescriptor
  title: FormattedMessage.MessageDescriptor
  fields: IFormField[]
  disabled?: boolean
}

export interface IForm {
  sections: IFormSection[]
}

export interface Ii18nSelectOption {
  value: string
  label: string
}

export interface Ii18nFormFieldBase {
  name: string
  type: string
  label: string
  description?: string
  validate: Validation[]
  required?: boolean
  prefix?: string
  initialValue?: IFormFieldValue
  postfix?: string
  disabled?: boolean
  conditionals?: IConditional[]
}

export interface Ii18nSelectFormField extends Ii18nFormFieldBase {
  type: typeof SELECT_WITH_OPTIONS
  options: SelectComponentOption[]
}

export interface Ii18nRadioGroupFormField extends Ii18nFormFieldBase {
  type: typeof RADIO_GROUP
  options: RadioComponentOption[]
}

type Name = {
  firstNames: string
  familyName: string
}
type Identifier = {
  id: string
  type: string
}
type Infomation = {
  name: Name[]
  birthDate: string
  nationality: [string]
  identifier: [Identifier] | null
}

export interface Ii18nInformativeRadioGroupFormField
  extends Ii18nFormFieldBase {
  type: typeof INFORMATIVE_RADIO_GROUP
  information: Infomation
  options: RadioComponentOption[]
}

export interface Ii18nTextFormField extends Ii18nFormFieldBase {
  type: typeof TEXT
}
export interface Ii18nTelFormField extends Ii18nFormFieldBase {
  type: typeof TEL
}
export interface Ii18nNumberFormField extends Ii18nFormFieldBase {
  type: typeof NUMBER
  step?: number
}
export interface Ii18nCheckboxGroupFormField extends Ii18nFormFieldBase {
  type: typeof CHECKBOX_GROUP
  options: CheckboxComponentOption[]
}
export interface Ii18nDateFormField extends Ii18nFormFieldBase {
  type: typeof DATE
}
export interface Ii18nTextareaFormField extends Ii18nFormFieldBase {
  type: typeof TEXTAREA
}
export interface Ii18nSubsectionFormField extends Ii18nFormFieldBase {
  type: typeof SUBSECTION
}
export interface Ii18nDocumentsFormField extends Ii18nFormFieldBase {
  type: typeof DOCUMENTS
}
export interface Ii18nListFormField extends Ii18nFormFieldBase {
  type: typeof LIST
  items: FormattedMessage.MessageDescriptor[]
}
export interface Ii18nParagraphFormField extends Ii18nFormFieldBase {
  type: typeof PARAGRAPH
  fontSize?: string
}
export interface Ii18nImageUploaderWithOptionsFormField
  extends Ii18nFormFieldBase {
  type: typeof IMAGE_UPLOADER_WITH_OPTIONS
  optionSection: IFormSection
}

export interface Ii18nWarningField extends Ii18nFormFieldBase {
  type: typeof WARNING
}
export type Ii18nFormField =
  | Ii18nTextFormField
  | Ii18nTelFormField
  | Ii18nNumberFormField
  | Ii18nSelectFormField
  | Ii18nRadioGroupFormField
  | Ii18nInformativeRadioGroupFormField
  | Ii18nCheckboxGroupFormField
  | Ii18nDateFormField
  | Ii18nTextareaFormField
  | Ii18nSubsectionFormField
  | Ii18nDocumentsFormField
  | Ii18nListFormField
  | Ii18nParagraphFormField
  | Ii18nImageUploaderWithOptionsFormField
  | Ii18nWarningField

export interface IFormSectionData {
  [key: string]: IFormFieldValue
}

export interface IFormData {
  [key: string]: IFormSectionData
}
