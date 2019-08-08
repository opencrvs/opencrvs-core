import pdfMake, {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes,
  TCreatedPdf
} from 'pdfmake/build/pdfmake'
import { commonVFS } from '@register/pdfRenderer/common_vfs'
import { fieldTransformers } from '@register/pdfRenderer/transformer'
import { InjectedIntl } from 'react-intl'
import { IApplication } from '@register/applications'

export interface IFieldTransformer {
  transformer: string
  payload: any
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
  intl: InjectedIntl
): TCreatedPdf {
  pdfMake.vfs = { ...commonVFS, ...template.vfs }
  let definitionString = JSON.stringify(template.definition)
  if (template.transformers) {
    Object.keys(template.transformers).forEach(field => {
      if (template.transformers && template.transformers[field]) {
        definitionString = definitionString.replace(
          `{${field}}`,
          // @ts-ignore
          fieldTransformers[template.transformers[field].transformer](
            template,
            application,
            intl,
            template.transformers[field].payload
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
  intl: InjectedIntl
) {
  createPDF(template, application, intl).print()
}
