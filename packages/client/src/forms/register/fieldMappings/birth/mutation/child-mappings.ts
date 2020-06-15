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
import { IFormField, IFormData, TransformedData } from '@client/forms'

export const birthEventLocationMutationTransformer = (
  lineNumber: number = 0,
  transformedFieldName?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (!transformedData.eventLocation) {
    transformedData.eventLocation = {
      address: {
        country: '',
        state: '',
        district: '',
        city: '',
        postalCode: '',
        line: ['', '', '', '', '', '']
      }
    } as fhir.Location
  }
  if (lineNumber > 0) {
    transformedData.eventLocation.address.line[lineNumber - 1] = `${
      draftData[sectionId][field.name]
    }`
  } else if (field.name === 'placeOfBirth') {
    transformedData.eventLocation.type = `${draftData[sectionId][field.name]}`
  } else if (field.name === 'birthLocation') {
    transformedData.eventLocation._fhirID = draftData[sectionId][field.name]
    if (transformedData.eventLocation.address) {
      delete transformedData.eventLocation.address
    }
    if (transformedData.eventLocation.type) {
      delete transformedData.eventLocation.type
    }
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
