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
import { IFormField, IFormData } from '@client/forms'
import format from '@client/utils/date-formatting'

export const marriageDateToFieldTransformation =
  (alternativeSectionIds?: string[]) =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: string,
    field: IFormField
  ) => {
    const fromSectionIds =
      alternativeSectionIds && alternativeSectionIds.length > 0
        ? alternativeSectionIds
        : sectionId
    if (Array.isArray(fromSectionIds)) {
      fromSectionIds.forEach((id) => {
        transformedData[sectionId][field.name] = queryData.id
          ? queryData[id]?.dateOfMarriage || queryData[id]?.dateOfMarriage
          : ''
      })

      return transformedData
    } else {
      if (!queryData[fromSectionIds]) {
        return transformedData
      }
      transformedData[sectionId][field.name] =
        queryData[fromSectionIds].marriageDate
      return transformedData
    }
  }

export const marriageDateFormatTransformation =
  (locale: string, dateFormat: string, alternativeSectionIds?: string[]) =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: string,
    field: IFormField
  ) => {
    let queryValue
    const fromSectionIds =
      alternativeSectionIds && alternativeSectionIds.length > 0
        ? alternativeSectionIds
        : sectionId

    if (Array.isArray(fromSectionIds)) {
      fromSectionIds.forEach((id) => {
        queryValue =
          queryData[id]?.dateOfMarriage || queryData[id]?.dateOfMarriage
      })
    } else {
      if (!queryData[fromSectionIds]) {
        return transformedData
      }
      queryValue = queryData[fromSectionIds].dateOfMarriage
    }

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
