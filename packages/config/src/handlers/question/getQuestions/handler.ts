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
import { COUNTRY_CONFIG_URL } from '@config/config/constants'
import FormDataset, {
  IDataSetModel,
  IDataset
} from '@config/models/formDataset'
import Question, { IQuestion } from '@config/models/question'

import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'

async function getQuestionsFromCountryConfig(): Promise<IQuestion[]> {
  try {
    const response = await fetch(`${COUNTRY_CONFIG_URL}/forms/questions`)

    if (response.status !== 200) {
      return []
    }

    return response.json()
  } catch (err) {
    return []
  }
}

type IQuestionFromCountryConfig = IQuestion & { datasetName?: string }

function getOptionsForQuestion(
  question: IQuestionFromCountryConfig,
  datasets: IDataSetModel[]
): IDataset['options'] {
  if (!question.datasetId && !question.datasetName) {
    return []
  }

  const dataset = datasets.find(
    (dataset) =>
      dataset._id === question.datasetId ||
      dataset.fileName === question.datasetName
  )

  if (!dataset) {
    return []
  }

  return dataset.options
}

export default async function getQuestions(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const datasets = await FormDataset.find().exec()

  const allQuestionsFromCountryConfig = await getQuestionsFromCountryConfig()

  type QuestionWithDatasetPopulated = IQuestion & {
    options: IDataset['options']
  }

  /*
   * Manually populate datasets for questions from country config
   */

  const questionsFromCountryConfig: QuestionWithDatasetPopulated[] =
    allQuestionsFromCountryConfig.map((question) => {
      return {
        ...question,
        options: getOptionsForQuestion(question, datasets)
      }
    })

  /*
   * Get all questions from form wizard and populate datasets
   */
  const questionsSavedInFormWizard = (await Question.find().exec()).map(
    (question) => {
      return {
        ...question.toObject<IQuestion>(),
        options: getOptionsForQuestion(question, datasets)
      }
    }
  )

  const allQuestions = questionsFromCountryConfig.concat(
    questionsSavedInFormWizard
  )

  return Promise.all(allQuestions)
}
