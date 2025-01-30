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
import * as Hapi from '@hapi/hapi'
import { getValidRecordById } from '@workflow/records/index'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { isQuestionnaireResponse } from '@opencrvs/commons/types'

interface FieldInput {
  fieldId: string
  valueString?: string
  valueBoolean?: boolean
}

export async function updateField(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const compositionId = request.params.id
  const { fieldId, valueString, valueBoolean } = request.payload as FieldInput

  const savedRecord = await getValidRecordById(
    compositionId,
    request.headers.authorization,
    false
  )
  const recordResources = savedRecord.entry.map((x) => x.resource)

  // There is only one QuestionnaireResponse in the record
  const questionnaireResponseResource = recordResources.filter((resource) =>
    isQuestionnaireResponse(resource)
  )[0]

  const questionnaireResponseItems = questionnaireResponseResource.item?.map(
    (item) => {
      if (item.text === fieldId && valueString) {
        item.answer![0].valueString = valueString
      }

      if (item.text === fieldId && valueBoolean) {
        item.answer![0].valueBoolean = valueBoolean
      }

      return item
    }
  )

  const updatedQuestionnaireResponseResource = {
    resource: {
      ...questionnaireResponseResource,
      item: questionnaireResponseItems
    }
  }

  const updatedRecord = {
    ...savedRecord,
    entry: [updatedQuestionnaireResponseResource]
  }

  await sendBundleToHearth(updatedRecord)
  return h.response(updatedRecord).code(200)
}
