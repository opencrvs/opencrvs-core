import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake'
import { commonVFS } from '@register/pdfRenderer/common_vfs'
import { transformers } from '@register/pdfRenderer/transformer'
import {
  IPDFTemplate,
  TransformableData
} from '@register/pdfRenderer/transformer/types'
import { IntlShape } from 'react-intl'
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
  intl: IntlShape
): TCreatedPdf {
  pdfMake.vfs = { ...commonVFS, ...template.vfs }
  let definitionString = JSON.stringify(template.definition)
  if (template.transformers && template.transformers.length > 0) {
    template.transformers.forEach(transformerDef => {
      const transformFunction = transformers[transformerDef.operation]
      if (!transformFunction) {
        throw new Error(
          `No transform function found for given name: ${transformerDef.operation}`
        )
      }
      const transformerData = (isUserDetailsDataBase(transformerDef)
        ? userDetails
        : application) as TransformableData
      definitionString = definitionString.replace(
        new RegExp(`{${transformerDef.field}}`, 'gi'),
        transformFunction(transformerData, intl, transformerDef.parameters) ||
          ''
      )
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
  intl: IntlShape
) {
  createPDF(template, application, userDetails, intl).print()
}
