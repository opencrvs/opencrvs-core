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
import { DISTRICT, HEALTH_FACILITY, STATE } from '@config/config/constants'
import { IDataSetModel } from '@config/models/formDataset'
import Question from '@config/models/question'
import { healthFacilityService } from '@config/services/locationService'
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'

export default async function getQuestions(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const populatedQuestions = await Question.find()
      .populate<{ datasetId: IDataSetModel }>('datasetId')
      .exec()

    const questions = populatedQuestions.map(async (populatedQuestion) => {
      if (populatedQuestion.datasetId) {
        let options = populatedQuestion.datasetId.options

        if (populatedQuestion.datasetId.resource === HEALTH_FACILITY) {
          options = await healthFacilityService({ type: HEALTH_FACILITY })
        } else if (populatedQuestion.datasetId.resource === STATE) {
          options = await healthFacilityService({ identifier: STATE })
        } else if (populatedQuestion.datasetId.resource === DISTRICT) {
          options = await healthFacilityService({ identifier: DISTRICT })
        }

        return {
          ...populatedQuestion.toObject(),
          options,
          datasetId: populatedQuestion.datasetId._id
        }
      }
      return populatedQuestion
    })

    return Promise.all(questions)
  } catch (error) {
    throw internal(error.message)
  }
}
