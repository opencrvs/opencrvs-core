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

  if (draftData[sectionId].mosipAid) {
    transformedData[sectionId].mosipAid = draftData[sectionId].mosipAid
  }

  if (!transformedData[sectionId].status) {
    transformedData[sectionId].status = [
      {
        timestamp: new Date()
      }
    ]
  }

  if (draftData[sectionId].informantsSignatureURI) {
    transformedData[sectionId].informantsSignature =
      draftData[sectionId].informantsSignatureURI
  } else if (draftData[sectionId].informantsSignature) {
    transformedData[sectionId].informantsSignature =
      draftData[sectionId].informantsSignature
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

  if (draftData[sectionId].certificates) {
    transformCertificateData(
      transformedData,
      (draftData[sectionId].certificates as ICertificate[])[0],
      sectionId
    )
  }
}
