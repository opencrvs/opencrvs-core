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
