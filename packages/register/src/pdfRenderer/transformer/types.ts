import { IApplication } from '@register/applications'
import { IUserDetails } from '@register/utils/userUtils'
import { InjectedIntl } from 'react-intl'
import {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes
} from 'pdfmake/build/pdfmake'

export interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs: TFontFamily
  transformers?: { [field: string]: IFieldTransformer }
}

export type TransformerPayload =
  | IIntLabelPayload
  | IConditionalIntLabelPayload
  | IApplicantNamePayload
  | IFeildValuePayload
  | IDateFeildValuePayload
  | IFormattedFeildValuePayload

export interface IFieldTransformer {
  transformer: string
  baseData?: string // deafult is application data
  payload?: TransformerPayload
}

export type TransformerData = IApplication & IUserDetails
export interface IFunctionTransformer {
  [transformerFunction: string]: (
    data: TransformerData,
    intl: InjectedIntl,
    payload?: TransformerPayload
  ) => string | null
}
export interface IIntLabelPayload {
  messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor
  messageValues?: { [valueKey: string]: string }
}

export interface IConditionalIntLabelPayload {
  [option: string]: ReactIntl.FormattedMessage.MessageDescriptor
}
export interface IApplicantNamePayload {
  key: {
    [event: string]: string // data key: data.child || data.deceased
  }
  format: {
    [language: string]: string[] // corresponding field names
  }
  language?: string
}

export interface IFeildValuePayload {
  valueKey: string // ex: child.dob
}

export interface IDateFeildValuePayload {
  key?: {
    [event: string]: string // data key: child.dob || deceased.dod
  }
  format: string
  language?: string
}

export interface IFormattedFeildValuePayload {
  formattedKeys: string // ex: {child.firstName}, {child.lastName}
}
