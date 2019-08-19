import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake'
import { commonVFS } from '@register/pdfRenderer/common_vfs'
import { transformers } from '@register/pdfRenderer/transformer'
import {
  IPDFTemplate,
  TransformerData
} from '@register/pdfRenderer/transformer/types'
import { InjectedIntl } from 'react-intl'
import { IApplication } from '@register/applications'
import { IUserDetails } from '@register/utils/userUtils'
import { isUserDetailsDataBase } from '@register/pdfRenderer/transformer/utils'

/*
  Converts template definition into actual PDF using defined transformers, applicationData and userDetails
*/
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
        const transformFunction = transformers[transformerDef.transformer]
        if (!transformFunction) {
          throw new Error(
            `No transform function found for given name: ${transformerDef.transformer}`
          )
        }
        const transformerData = (isUserDetailsDataBase(transformerDef)
          ? userDetails
          : application) as TransformerData
        definitionString = definitionString.replace(
          new RegExp(`{${field}}`, 'gi'),
          transformFunction(transformerData, intl, transformerDef.payload) || ''
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
