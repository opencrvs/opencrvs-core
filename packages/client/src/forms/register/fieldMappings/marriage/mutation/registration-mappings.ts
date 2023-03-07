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
import { ICertificate, IFormData, TransformedData } from '@client/forms'
import { transformCertificateData } from '@client/forms/mappings/mutation'

export function setMarriageRegistrationSectionTransformer(
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

    if (draftData[sectionId].groomSignature) {
      transformedData[sectionId].groomSignature =
        draftData[sectionId].groomSignature
    }
    if (draftData[sectionId].brideSignature) {
      transformedData[sectionId].brideSignature =
        draftData[sectionId].brideSignature
    }
    if (draftData[sectionId].witnessOneSignature) {
      transformedData[sectionId].witnessOneSignature =
        draftData[sectionId].witnessOneSignature
    }
    if (draftData[sectionId].witnessTwoSignature) {
      transformedData[sectionId].witnessTwoSignature =
        draftData[sectionId].witnessTwoSignature
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

    if (draftData[sectionId].certificates) {
      transformCertificateData(
        transformedData,
        (draftData[sectionId].certificates as ICertificate[])[0],
        sectionId
      )
    }
  }
}
