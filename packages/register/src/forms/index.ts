import { Validation } from '../utils/validate'
import { FormattedMessage } from 'react-intl'

export interface ISelectOption {
  value: string
  label: FormattedMessage.MessageDescriptor
}

export interface IFormField {
  name: string
  type: string
  label: FormattedMessage.MessageDescriptor
  validate: Validation[]
  required?: boolean
  options?: ISelectOption[]
  dynamicOptions?: string
  prefix?: React.ComponentClass<any> | string
  postfix?: React.ComponentClass<any> | string
  disabled?: boolean
  initialValue?: string | string[]
  conditionals?: IConditional[]
  description?: FormattedMessage.MessageDescriptor
}

export interface IConditional {
  action: string
  expression: string
}

export interface IConditionals {
  fathersDetailsExist: IConditional
  permanentAddressSameAsMother: IConditional
  addressSameAsMother: IConditional
  countryPermanent: IConditional
  statePermanent: IConditional
  districtPermanent: IConditional
  addressLine4Permanent: IConditional
  addressLine3Options1Permanent: IConditional
  country: IConditional
  state: IConditional
  district: IConditional
  addressLine4: IConditional
  addressLine3Options1: IConditional
}

export type ViewType = 'form' | 'preview'

export interface IFormSection {
  id: string
  viewType: ViewType
  name: FormattedMessage.MessageDescriptor
  title: FormattedMessage.MessageDescriptor
  fields: IFormField[]
}

export interface IForm {
  sections: IFormSection[]
}

export interface Ii18nSelectOption {
  value: string
  label: string
}
export interface Ii18nFormField {
  name: string
  type: string
  label: string
  validate: Validation[]
  required?: boolean
  options?: ISelectOption[]
  dynamicOptions?: string
  prefix?: React.ComponentClass<any> | string
  postfix?: React.ComponentClass<any> | string
  disabled?: boolean
  conditionals?: IConditional[]
}

export interface IFormSectionData {
  [key: string]: string
}

export interface IFormData {
  [key: string]: IFormSectionData
}
