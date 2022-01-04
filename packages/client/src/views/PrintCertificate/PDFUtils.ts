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
import { createPDF, createSVG, printPDF } from '@client/pdfRenderer'
import { IApplication } from '@client/applications'
import { IUserDetails } from '@opencrvs/client/src/utils/userUtils'
import { Event } from '@client/forms'
import { IOfflineData } from '@client/offline/reducer'
import { OptionalData } from '@client/pdfRenderer/transformer/types'

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
  optionalData?: OptionalData
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }

  const svgCode = await createSVG(
    application.event === Event.BIRTH
      ? offlineResource.templates.certificates.birth
      : offlineResource.templates.certificates.death,
    application,
    userDetails,
    offlineResource,
    intl,
    optionalData
  )
  const blob = new Blob([svgCode], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  callBack(url)
}

export function printCertificate(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData,
  optionalData?: OptionalData
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  // printPDF(
  //   application.event === Event.BIRTH
  //     ? offlineResource.templates.certificates.birth
  //     : offlineResource.templates.certificates.death,
  //   application,
  //   userDetails,
  //   offlineResource,
  //   intl,
  //   optionalData
  // )
}
