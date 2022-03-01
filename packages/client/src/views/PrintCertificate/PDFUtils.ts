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
import { IntlShape } from 'react-intl'
import { createPDF, printPDF } from '@client/pdfRenderer'
import { IApplication } from '@client/applications'
import { IUserDetails } from '@opencrvs/client/src/utils/userUtils'
import { Event } from '@client/forms'
import { IOfflineData } from '@client/offline/reducer'
import {
  OptionalData,
  IPDFTemplate
} from '@client/pdfRenderer/transformer/types'
import { Content, PageSize } from 'pdfmake/interfaces'

export function printMoneyReceipt(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  if (!offlineResource.templates || !offlineResource.templates.receipt) {
    throw new Error('Money reciept template is misssing in offline data')
  }
  printPDF(
    offlineResource.templates.receipt,
    application,
    userDetails,
    offlineResource,
    intl
  )
}

export async function previewCertificate(
  intl: IntlShape,
  application: IApplication,
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
    getPDFTemplateWithSVG(offlineResource, application.event, pageSize),
    application,
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
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData,
  optionalData?: OptionalData,
  pageSize: PageSize = 'A4'
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(
    getPDFTemplateWithSVG(offlineResource, application.event, pageSize),
    application,
    userDetails,
    offlineResource,
    intl,
    optionalData
  )
}

function getPDFTemplateWithSVG(
  offlineResource: IOfflineData,
  event: Event,
  pageSize: PageSize
): IPDFTemplate {
  let template: IPDFTemplate
  let svg: string

  if (event === Event.BIRTH) {
    template = offlineResource.templates.certificates.birth
    svg = offlineResource.certificateSvg.birth
  } else {
    template = offlineResource.templates.certificates.death
    svg = offlineResource.certificateSvg.death
  }

  template.definition.pageSize = pageSize
  updatePDFTemplateWithSVGContent(template, svg, pageSize)
  return template
}

function updatePDFTemplateWithSVGContent(
  template: IPDFTemplate,
  svg: string,
  pageSize: PageSize
) {
  if (hasTemplateEmptyArrayContent(template)) {
    ;(template.definition.content as Array<Content>).push({
      svg,
      fit: getPageDimensions(pageSize)
    })
  }
}

function hasTemplateEmptyArrayContent(template: IPDFTemplate): boolean {
  return Boolean(
    template?.definition?.content &&
      Array.isArray(template.definition.content) &&
      template.definition.content.length === 0
  )
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
