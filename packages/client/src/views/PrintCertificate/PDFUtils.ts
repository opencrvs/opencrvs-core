/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { IntlShape, MessageDescriptor } from 'react-intl'
import { createPDF, printPDF } from '@client/pdfRenderer'
import { IDeclaration } from '@client/declarations'
import { IOfflineData } from '@client/offline/reducer'
import {
  OptionalData,
  IPDFTemplate
} from '@client/pdfRenderer/transformer/types'
import { PageSize } from 'pdfmake/interfaces'
import { certificateBaseTemplate } from '@client/templates/register'
import * as Handlebars from 'handlebars'
import { UserDetails } from '@client/utils/userUtils'
import { EMPTY_STRING } from '@client/utils/constants'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'

function isMessageDescriptor(
  obj: Record<string, unknown>
): obj is MessageDescriptor & Record<string, string> {
  return (
    obj.hasOwnProperty('id') &&
    obj.hasOwnProperty('defaultMessage') &&
    typeof (obj as MessageDescriptor).id === 'string' &&
    typeof (obj as MessageDescriptor).defaultMessage === 'string'
  )
}

export function formatAllNonStringValues(
  templateData: Record<string, string | MessageDescriptor | Array<string>>
): Record<string, string> {
  for (const key of Object.keys(templateData)) {
    if (
      typeof templateData[key] === 'object' &&
      isMessageDescriptor(templateData[key] as Record<string, unknown>)
    ) {
      templateData[key] = (templateData[key] as MessageDescriptor)
        .defaultMessage as string
    } else if (Array.isArray(templateData[key])) {
      // For address field, country label is a MessageDescriptor
      // but state, province is string
      templateData[key] = (
        templateData[key] as Array<string | MessageDescriptor>
      )
        .filter(Boolean)
        .map((item) =>
          isMessageDescriptor(item as Record<string, unknown>)
            ? (item as MessageDescriptor).defaultMessage
            : item
        )
        .join(', ')
    }
  }
  return templateData as Record<string, string>
}
export function executeHandlebarsTemplate(
  templateString: string,
  data: Record<string, any> = {}
): string {
  const template = Handlebars.compile(templateString)
  const formattedTemplateData = formatAllNonStringValues(data)
  const output = template(formattedTemplateData)
  return output
}

export async function previewCertificate(
  intl: IntlShape,
  declaration: IDeclaration,
  userDetails: UserDetails | null,
  offlineResource: IOfflineData,
  callBack: (pdf: string) => void,
  optionalData?: OptionalData,
  pageSize: PageSize = 'A4'
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }

  createPDF(
    await getPDFTemplateWithSVG(offlineResource, declaration, pageSize),
    declaration,
    userDetails,
    offlineResource,
    intl,
    optionalData
  ).getDataUrl((pdf: string) => {
    callBack(pdf)
  })
}

export async function printCertificate(
  intl: IntlShape,
  declaration: IDeclaration,
  userDetails: UserDetails | null,
  offlineResource: IOfflineData,
  optionalData?: OptionalData,
  pageSize: PageSize = 'A4'
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(
    await getPDFTemplateWithSVG(offlineResource, declaration, pageSize),
    declaration,
    userDetails,
    offlineResource,
    intl,
    optionalData
  )
}

async function getPDFTemplateWithSVG(
  offlineResource: IOfflineData,
  declaration: IDeclaration,
  pageSize: PageSize
): Promise<IPDFTemplate> {
  const svgTemplate =
    offlineResource.templates.certificates![declaration.event]?.definition ||
    EMPTY_STRING

  const resolvedSignatures = await Promise.all(
    [
      'groomSignature',
      'brideSignature',
      'witnessOneSignature',
      'witnessTwoSignature'
    ]
      .map((k) => ({ signatureKey: k, url: declaration.data.template[k] }))
      .filter(({ url }) => Boolean(url))
      .map(({ signatureKey, url }) =>
        fetchImageAsBase64(url as string).then((value) => ({
          [signatureKey]: value
        }))
      )
  ).then((res) => res.reduce((acc, cur) => ({ ...acc, ...cur }), {}))

  const declarationTemplate = {
    ...declaration.data.template,
    ...resolvedSignatures
  }
  const svgCode = executeHandlebarsTemplate(svgTemplate, declarationTemplate)

  const pdfTemplate: IPDFTemplate = certificateBaseTemplate
  pdfTemplate.definition.pageSize = pageSize
  updatePDFTemplateWithSVGContent(pdfTemplate, svgCode, pageSize)
  return pdfTemplate
}

export function downloadFile(
  contentType: string,
  data: string,
  fileName: string
) {
  const linkSource = `data:${contentType};base64,${window.btoa(data)}`
  const downloadLink = document.createElement('a')
  downloadLink.setAttribute('href', linkSource)
  downloadLink.setAttribute('download', fileName)
  downloadLink.click()
}

function updatePDFTemplateWithSVGContent(
  template: IPDFTemplate,
  svg: string,
  pageSize: PageSize
) {
  template.definition['content'] = {
    svg,
    fit: getPageDimensions(pageSize)
  }
}

const standardPageSizes: Record<string, [number, number]> = {
  A2: [1190.55, 1683.78],
  A3: [841.89, 1190.55],
  A4: [595.28, 841.89],
  A5: [419.53, 595.28]
}

function getPageDimensions(pageSize: PageSize) {
  if (
    typeof pageSize === 'string' &&
    standardPageSizes.hasOwnProperty(pageSize)
  ) {
    return standardPageSizes[pageSize]
  } else {
    throw new Error(
      `Pagesize ${pageSize} is not found in standardPageSizes map`
    )
  }
}
