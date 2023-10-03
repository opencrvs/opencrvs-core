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

import { IFormData, ICertificate, TransformedData } from '@client/forms'
import { transformCertificateData } from '@client/forms/register/mappings/mutation/utils'

export function setDeathRegistrationSectionTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string
) {
  if (draftData.registration) {
    if (!transformedData.registration) {
      transformedData.registration = {}
    }
    if (draftData.registration._fhirID) {
      transformedData.registration._fhirID = draftData.registration._fhirID
    }
    if (draftData.registration.trackingId) {
      transformedData.registration.trackingId =
        draftData.registration.trackingId
    }
    if (draftData.registration.registrationNumber) {
      transformedData.registration.registrationNumber =
        draftData.registration.registrationNumber
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

    if (draftData.registration.certificates) {
      transformCertificateData(
        transformedData,
        (draftData.registration.certificates as ICertificate[])[0],
        'registration'
      )
    }
  }

  if (draftData[sectionId].informantsSignatureURI) {
    transformedData[sectionId].informantsSignature =
      draftData[sectionId].informantsSignatureURI
  } else if (draftData[sectionId].informantsSignature) {
    transformedData[sectionId].informantsSignature =
      draftData[sectionId].informantsSignature
  }

  return transformedData
}
