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
import { transformCertificateData } from '@client/forms/register/fieldMappings/birth/mutation/registration-mappings'

export const fieldToDeceasedDateTransformation = (
  alternativeSectionId?: string,
  nestedTransformer?: IFormFieldMutationMapFunction
) => (
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

export const deathEventLocationMutationTransformer = (
  lineNumber: number = 0,
  transformedFieldName?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (!transformedData.eventLocation.address) {
    transformedData.eventLocation = {
      ...transformedData.eventLocation,
      address: {
        country: '',
        state: '',
        district: '',
        postalCode: '',
        line: ['', '', '', '', '', '']
      }
    } as fhir.Location
  }

  if (lineNumber > 0) {
    transformedData.eventLocation.address.line[lineNumber - 1] =
      draftData[sectionId][field.name]
  } else if (field.name === 'deathLocation') {
    transformedData.eventLocation._fhirID = draftData[sectionId][field.name]
    delete transformedData.eventLocation.address
    delete transformedData.eventLocation.type
  } else if (transformedFieldName) {
    transformedData.eventLocation.address[transformedFieldName] = `${
      draftData[sectionId][field.name]
    }`
  } else {
    transformedData.eventLocation.address[field.name] = `${
      draftData[sectionId][field.name]
    }`
  }
  if (field.name === 'addressLine4') {
    transformedData.eventLocation.partOf = `Location/${
      draftData[sectionId][field.name]
    }`
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
    if (draftData.registration.certificates) {
      transformCertificateData(
        transformedData,
        (draftData.registration.certificates as ICertificate[])[0],
        'registration'
      )
    }
  }
  return transformedData
}
