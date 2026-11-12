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
import type { Question, SurveyModel } from 'survey-core'
import { QuestionSecretModel } from './secretQuestion'

export const isSecret = (question: Question) =>
  question instanceof QuestionSecretModel || question.getPropertyValue('secret') === true

// The only shape of answers that may be exported or displayed in full.
export function answersWithoutSecrets(survey: SurveyModel): Record<string, unknown> {
  const answers: Record<string, unknown> = { ...survey.data }
  for (const question of survey.getAllQuestions()) {
    if (isSecret(question)) delete answers[question.getValueName()]
  }
  return answers
}

// GitHub reports secrets that are already set, by name (see src/form/apply.ts).
export const isDefinedOnGitHub = (survey: SurveyModel, question: Question) =>
  ((survey.getVariable('definedSecrets') as string[] | undefined) ?? []).includes(question.name)

// Secrets are only ever stored on GitHub (the files hold none). When GitHub was skipped, or the dev server
// lost the connection, they have nowhere to go: the secret questions are hidden (see src/form/survey.ts)
// and nothing is generated. The form variable `githubAvailable` says which it is; wizard.yml reads it too.
const GITHUB_AVAILABLE = 'githubAvailable'

export const githubAvailable = (survey: SurveyModel) => survey.getVariable(GITHUB_AVAILABLE) !== false

export function setGitHubAvailable(survey: SurveyModel, available: boolean) {
  survey.setVariable(GITHUB_AVAILABLE, available)
  if (available) {
    generateMissingSecrets(survey)
    return
  }
  // Nothing is kept in memory that can no longer be written anywhere.
  for (const question of survey.getAllQuestions()) {
    if (isSecret(question)) question.clearValue()
  }
}

// Fills auto-generated secrets that are still empty on the page being shown.
// Runs in a navigation handler, so each value is created once and then kept.
// A secret that already exists on GitHub is left alone, so it is not replaced by accident.
export function generateMissingSecrets(survey: SurveyModel) {
  if (!githubAvailable(survey)) return
  for (const question of survey.currentPage?.questions ?? []) {
    if (
      question instanceof QuestionSecretModel &&
      question.autoGenerate &&
      question.isEmpty() &&
      !isDefinedOnGitHub(survey, question)
    ) {
      question.generate()
    }
  }
}
