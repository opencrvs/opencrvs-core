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
import { IFormField, IFormData, Event } from '@client/forms'
import { REGISTRATION_SECTION } from '@client/forms/register/fieldMappings/death/query/documents-mappings'
import { GQLRegWorkflow } from '@opencrvs/gateway/src/graphql/schema'
import { transformStatusData } from '@client/forms/register/fieldMappings/birth/query/registration-mappings'
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
  if (!transformedData[REGISTRATION_SECTION]) {
    transformedData[REGISTRATION_SECTION] = {}
  }

  if (queryData[REGISTRATION_SECTION].id) {
    transformedData[REGISTRATION_SECTION]._fhirID =
      queryData[REGISTRATION_SECTION].id
  }
  if (queryData[REGISTRATION_SECTION].trackingId) {
    transformedData[REGISTRATION_SECTION].trackingId =
      queryData[REGISTRATION_SECTION].trackingId
  }

  if (queryData[REGISTRATION_SECTION].registrationNumber) {
    transformedData[REGISTRATION_SECTION].registrationNumber =
      queryData[REGISTRATION_SECTION].registrationNumber
  }

  if (
    queryData[REGISTRATION_SECTION].type &&
    queryData[REGISTRATION_SECTION].type === 'DEATH'
  ) {
    transformedData[REGISTRATION_SECTION].type = Event.DEATH
  }

  if (queryData[REGISTRATION_SECTION].status) {
    transformStatusData(
      transformedData,
      queryData[REGISTRATION_SECTION].status as GQLRegWorkflow[],
      REGISTRATION_SECTION
    )
  }
}
