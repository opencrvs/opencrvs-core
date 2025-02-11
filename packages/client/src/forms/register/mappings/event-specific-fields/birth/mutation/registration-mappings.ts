/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { ICertificate, IFormData, TransformedData } from '@client/forms'
import { transformCertificateData } from '@client/forms/register/mappings/mutation/utils'

export function setBirthRegistrationSectionTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string
) {
  if (draftData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = draftData[sectionId].trackingId
  }

  if (draftData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      draftData[sectionId].registrationNumber
  }

  if (!transformedData[sectionId].status) {
    transformedData[sectionId].status = [
      {
        timestamp: new Date()
      }
    ]
  }

  if (draftData[sectionId].commentsOrNotes) {
    if (!transformedData[sectionId].status[0].comments) {
      transformedData[sectionId].status[0].comments = []
    }
    transformedData[sectionId].status[0].comments.push({
      comment: draftData[sectionId].commentsOrNotes,
      createdAt: new Date()
    })
  }

  const certificates: ICertificate[] = draftData[sectionId]
    .certificates as ICertificate[]
  if (
    Array.isArray(certificates) &&
    certificates.length &&
    !draftData[sectionId].correction
  ) {
    const updatedCertificates = transformCertificateData(certificates.slice(-1))
    transformedData[sectionId].certificates =
      updatedCertificates.length > 0 &&
      Object.keys(updatedCertificates[0]).length > 0 &&
      updatedCertificates[0].collector // making sure we are not sending empty object as certificate
        ? updatedCertificates
        : []
  }
  return transformedData
}
