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
import { IDataSetModel } from '@config/models/formDataset'
import Question from '@config/models/question'
import { resolveFormDatasetOptions } from '@config/services/formDatasetService'
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
        const options = await resolveFormDatasetOptions(
          populatedQuestion.datasetId
        )
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
