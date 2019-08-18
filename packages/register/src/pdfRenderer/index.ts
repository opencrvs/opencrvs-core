import pdfMake, {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes,
  TCreatedPdf
} from 'pdfmake/build/pdfmake'
import { commonVFS } from '@register/pdfRenderer/common_vfs'
import { fieldTransformers } from '@register/pdfRenderer/transformer'
import {
  IIntLabelPayload,
  IApplicantNamePayload,
  IFeildValuePayload,
  IDateFeildValuePayload,
  IConditionalIntLabelPayload
} from '@register/pdfRenderer/transformer/types'
import { InjectedIntl } from 'react-intl'
import { IApplication } from '@register/applications'
import { IUserDetails } from '@register/utils/userUtils'
import { isUserDetailsDataBase } from '@register/pdfRenderer/transformer/utils'

export interface IFieldTransformer {
  transformer: string
  baseData?: string // deafult is application data
  payload?:
    | IIntLabelPayload
    | IConditionalIntLabelPayload
    | IApplicantNamePayload
    | IFeildValuePayload
    | IDateFeildValuePayload
}

export interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs: TFontFamily
  transformers?: { [field: string]: IFieldTransformer }
}

export function createPDF(
  template: IPDFTemplate,
  application: IApplication,
  userDetails: IUserDetails,
  intl: InjectedIntl
): TCreatedPdf {
  pdfMake.vfs = { ...commonVFS, ...template.vfs }
  let definitionString = JSON.stringify(template.definition)
  if (template.transformers) {
    Object.keys(template.transformers).forEach(field => {
      if (template.transformers && template.transformers[field]) {
        const transformerDef = template.transformers[field]
        // @ts-ignore
        const transformFunction = fieldTransformers[transformerDef.transformer]
        if (!transformFunction) {
          throw new Error(
            `No transform function found for given name: ${transformerDef.transformer}`
          )
        }
        definitionString = definitionString.replace(
          new RegExp(`{${field}}`, 'gi'),
          transformerDef.payload
            ? transformFunction(
                isUserDetailsDataBase(transformerDef)
                  ? userDetails
                  : application,
                intl,
                transformerDef.payload
              )
            : transformFunction(
                isUserDetailsDataBase(transformerDef)
                  ? userDetails
                  : application,
                intl
              )
        )
      }
    })
  }
  return pdfMake.createPdf(
    JSON.parse(definitionString),
    null,
    template.fonts[intl.locale]
  )
}

export function printPDF(
  template: IPDFTemplate,
  application: IApplication,
  userDetails: IUserDetails,
  intl: InjectedIntl
) {
  createPDF(template, application, userDetails, intl).print()
}
