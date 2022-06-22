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
import { IUserDetails } from '@opencrvs/client/src/utils/userUtils'
import { Event } from '@client/utils/gateway'
import { IOfflineData } from '@client/offline/reducer'
import {
  OptionalData,
  IPDFTemplate
} from '@client/pdfRenderer/transformer/types'
import { Content, PageSize } from 'pdfmake/interfaces'
import { certificateBaseTemplate } from '@client/templates/register'
import * as Handlebars from 'handlebars'

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
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData,
  callBack: (pdf: string) => void,
  optionalData?: OptionalData,
  pageSize: PageSize = 'A4'
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }

  await createPDF(
    getPDFTemplateWithSVG(offlineResource, declaration, pageSize),
    declaration,
    userDetails,
    offlineResource,
    intl,
    optionalData
  ).getDataUrl((pdf: string) => {
    callBack(pdf)
  })
}

export function printCertificate(
  intl: IntlShape,
  declaration: IDeclaration,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData,
  optionalData?: OptionalData,
  pageSize: PageSize = 'A4'
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(
    getPDFTemplateWithSVG(offlineResource, declaration, pageSize),
    declaration,
    userDetails,
    offlineResource,
    intl,
    optionalData
  )
}

function getPDFTemplateWithSVG(
  offlineResource: IOfflineData,
  declaration: IDeclaration,
  pageSize: PageSize
): IPDFTemplate {
  let svgTemplate
  if (declaration.event === Event.Birth) {
    svgTemplate = offlineResource.templates.certificates!.birth.definition
  } else {
    svgTemplate = offlineResource.templates.certificates!.death.definition
  }
  const svgCode = executeHandlebarsTemplate(
    svgTemplate,
    declaration.data.template
  )
  const pdfTemplate: IPDFTemplate = certificateBaseTemplate
  pdfTemplate.definition.pageSize = pageSize
  updatePDFTemplateWithSVGContent(pdfTemplate, svgCode, pageSize)
  return pdfTemplate
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
