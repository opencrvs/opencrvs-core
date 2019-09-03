import { IApplication } from '@register/applications'
import { IUserDetails } from '@register/utils/userUtils'
import { IntlShape, MessageDescriptor } from 'react-intl'
import {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes
} from 'pdfmake/build/pdfmake'
import { IOfflineData } from '@register/offline/reducer'

export interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs: TFontFamily
  transformers?: IFieldTransformer[]
}

export type TransformerPayload =
  | IIntLabelPayload
  | IConditionExecutorPayload
  | IApplicantNamePayload
  | IFeildValuePayload
  | IDateFeildValuePayload
  | IFormattedFeildValuePayload
  | INumberFeildConversionPayload

export interface IFieldTransformer {
  field: string
  operation: string
  baseData?: string // deafult is application data
  parameters?: TransformerPayload
}

export type TransformableData = IApplication | IUserDetails | IOfflineData
export interface IFunctionTransformer {
  [transformerFunction: string]: (
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => string | null
}
export interface IIntLabelPayload {
  messageDescriptor: MessageDescriptor
  messageValues?: { [valueKey: string]: string }
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
  momentLocale?: {
    [language: string]: string // bn: 'locale/bn'
  }
}

export interface IFormattedFeildValuePayload {
  formattedKeys: string // ex: {child.firstName}, {child.lastName}
}

export interface INumberFeildConversionPayload {
  valueKey: string // ex: child.dob
  conversionMap: { [key: string]: string } // { 0: '০', 1: '১'}
}

// Based on the need, add more here
export type ExecutorKey = 'CURRENT_DATE'

export interface IEventWiseKey {
  [event: string]: string // {birth: child.dob}
}
// Based on the need, add more here
export type ConditionType = 'COMPARE_DATE_IN_DAYS'

export interface IConditionExecutorPayload {
  fromKey: IEventWiseKey | ExecutorKey
  toKey: IEventWiseKey | ExecutorKey
  conditions: {
    type: ConditionType
    minDiff: number
    maxDiff: number
    output: IIntLabelPayload // based on the we can add more type here
  }[]
}
