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
  IFormData,
  IFormField,
  IQuestionnaireQuestion,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS
} from '@client/forms'
import { getFieldOptions } from '@client/forms/utils'
import { IOfflineData } from '@client/offline/reducer'

export function questionnaireToCustomFieldTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField,
  _: IFormField,
  offlineCountryConfig?: IOfflineData
) {
  if (!queryData.questionnaire) {
    return
  }
  const selectedQuestion: IQuestionnaireQuestion =
    queryData.questionnaire.filter(
      (question: IQuestionnaireQuestion) =>
        question.fieldId === field.customQuesstionMappingId
    )[0]

  if (selectedQuestion) {
    /* transformedData[sectionId] is undefined when mapping templates */
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    if (
      field.custom &&
      offlineCountryConfig &&
      field.type === SELECT_WITH_DYNAMIC_OPTIONS
    ) {
      const options = getFieldOptions(field, queryData, offlineCountryConfig)
      transformedData[sectionId][field.name] =
        options
          .find((option) => option.value === selectedQuestion.value)
          ?.label.defaultMessage?.toString() || selectedQuestion.value
    } else if (field.custom && field.type === SELECT_WITH_OPTIONS) {
      transformedData[sectionId][field.name] =
        field.options
          .find((option) => option.value === selectedQuestion.value)
          ?.label.defaultMessage?.toString() || selectedQuestion.value
    } else {
      transformedData[sectionId][field.name] = selectedQuestion.value
    }
  }
}
