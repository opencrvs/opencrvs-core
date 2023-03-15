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
  TransformedData,
  IFormFieldMutationMapFunction
} from '@client/forms'
import { cloneDeep } from 'lodash'

export const marriageEventLocationMutationTransformer =
  (lineNumber = 0, transformedFieldName?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    let defaultLocation: fhir.Location = {}
    if (
      (transformedData.eventLocation &&
        !transformedData.eventLocation.address) ||
      !transformedData.eventLocation
    ) {
      defaultLocation = {
        address: {
          country: '',
          state: '',
          district: '',
          city: '',
          postalCode: '',
          line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] // lines must be available as empty strings for GraphQL to parse all options
        }
      } as fhir.Location
      if (transformedData.eventLocation && transformedData.eventLocation.type) {
        defaultLocation['type'] = transformedData.eventLocation.type
      }
      transformedData.eventLocation = defaultLocation
    }
    if (lineNumber > 0) {
      transformedData.eventLocation.address.line[lineNumber - 1] = `${
        draftData[sectionId][field.name]
      }`
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

export const fieldToMarriageDateTransformation =
  (
    alternativeSectionIds?: string[],
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

    alternativeSectionIds?.forEach((sectionId) => {
      transformedData[sectionId].dateOfMarriage = fieldValue
    })

    return transformedData
  }
