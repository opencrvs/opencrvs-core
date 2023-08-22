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
import {
  IFormField,
  IFormData,
  ICertificate,
  TransformedData,
  IFormFieldMutationMapFunction
} from '@client/forms'
import { cloneDeep } from 'lodash'
import { transformCertificateData } from '@client/forms/register/mappings/fields/birth/mutation/registration-mappings'

export const fieldToDeceasedDateTransformation =
  (
    alternativeSectionId?: string,
    nestedTransformer?: IFormFieldMutationMapFunction
  ) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (!draftData[sectionId] || !draftData[sectionId][field.name]) {
      return transformedData
    }

    let fieldValue = draftData[sectionId][field.name]

    if (nestedTransformer) {
      const clonedTransformedData = cloneDeep(transformedData)
      nestedTransformer(clonedTransformedData, draftData, sectionId, field)
      fieldValue = clonedTransformedData[sectionId][field.name]
    }

    transformedData[
      alternativeSectionId ? alternativeSectionId : sectionId
    ].deceased = {
      deceased: true,
      deathDate: fieldValue
    }
    return transformedData
  }

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
