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
import type { Model, Question } from 'survey-core'
import { applyGitHubState, createSurvey } from '../../ui/form/survey'
import { MockGitHub, type Scenario } from '../../ui/github/mock'

export async function makeSurvey(scenario: Scenario = 'fresh') {
  const github = new MockGitHub(scenario, 0)
  const survey = createSurvey()
  await applyGitHubState(survey, github)
  return { survey, github }
}

export function question(survey: Model, name: string): Question {
  const found = survey.getQuestionByName(name)
  if (!found) throw new Error(`No question named ${name}`)
  return found
}

// Sets an answer, validates the question synchronously and returns its error messages.
export function validate(survey: Model, name: string, value?: unknown): string[] {
  const q = question(survey, name)
  if (value !== undefined) q.value = value
  q.hasErrors(true)
  return q.errors.map((error) => error.getText())
}

export const pageVisible = (survey: Model, name: string) => {
  const page = survey.getPageByName(name)
  if (!page) throw new Error(`No page named ${name}`)
  return page.isVisible
}
