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
import { IFormField, IFormData } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { GQLRegWorkflow } from '@opencrvs/gateway/src/graphql/schema'
import { transformStatusData } from '@client/forms/register/mappings/fields/birth/query/registration-mappings'
import format from '@client/utils/date-formatting'

export const deceasedDateToFieldTransformation =
  (alternativeSectionId?: string) =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: string,
    field: IFormField
  ) => {
    const fromSectionId = alternativeSectionId
      ? alternativeSectionId
      : sectionId
    if (!queryData[fromSectionId] || !queryData[fromSectionId].deceased) {
      return transformedData
    }
    transformedData[sectionId][field.name] =
      queryData[fromSectionId].deceased.deathDate
    return transformedData
  }

export const deceasedDateFormatTransformation =
  (locale: string, dateFormat: string, alternativeSectionId?: string) =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: string,
    field: IFormField
  ) => {
    const fromSectionId = alternativeSectionId
      ? alternativeSectionId
      : sectionId
    if (!queryData[fromSectionId] || !queryData[fromSectionId].deceased) {
      return transformedData
    }
    const queryValue = queryData[fromSectionId].deceased.deathDate

    const date = new Date(queryValue)
    if (!Number.isNaN(date.getTime())) {
      const prevLocale = window.__localeId__
      window.__localeId__ = locale

      if (!transformedData[sectionId]) {
        transformedData[sectionId] = {}
      }
      transformedData[sectionId][field.name] = format(date, dateFormat)
      window.__localeId__ = prevLocale
    }
    return transformedData
  }

export const deathPlaceToFieldTransformer = (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (!queryData.eventLocation || !queryData.eventLocation.type) {
    return transformedData
  }
  transformedData[sectionId][field.name] = queryData.eventLocation.type
  return transformedData
}

export function getDeathRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (!transformedData['registration']) {
    transformedData['registration'] = {}
  }

  if (queryData['registration'].id) {
    transformedData['registration']._fhirID = queryData['registration'].id
  }
  if (queryData['registration'].trackingId) {
    transformedData['registration'].trackingId =
      queryData['registration'].trackingId
  }

  if (queryData['registration'].registrationNumber) {
    transformedData['registration'].registrationNumber =
      queryData['registration'].registrationNumber
  }

  if (
    queryData['registration'].type &&
    queryData['registration'].type === 'DEATH'
  ) {
    transformedData['registration'].type = Event.Death
  }

  if (queryData['registration'].status) {
    transformStatusData(
      transformedData,
      queryData['registration'].status as GQLRegWorkflow[],
      'registration'
    )
  }

  if (queryData[sectionId].informantsSignature) {
    transformedData[sectionId].informantsSignature =
      queryData[sectionId].informantsSignature
  }

  if (queryData[sectionId].informantsSignatureURI) {
    transformedData[sectionId].informantsSignatureURI =
      queryData[sectionId].informantsSignatureURI
  }
}
