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
import { Model, type QuestionDropdownModel } from 'survey-core'
import wizard from '../../forms/wizard.yml'
import type { Sources } from '../bindings/snapshot'
import type { GitHubPort } from '../github/port'
import './functions'
import { addReviewItem, groupMenu, trackMenuStatus } from './menu'
import './secretQuestion'
import { BACKUP_KEYS_VARIABLE } from '../plan/backupSecrets'
import { generateMissingSecrets, isSecret } from './secrets'

// A secret is required for a new environment. One that GitHub reports as already set may
// stay empty, which means "keep it" (see src/form/apply.ts).
function requireUnlessDefined(survey: Model) {
  survey.setVariable('definedSecrets', [])
  for (const question of survey.getAllQuestions()) {
    if (isSecret(question) && question.isRequired) {
      question.isRequired = false
      question.requiredIf = `{definedSecrets} notcontains '${question.name}'`
    }
  }
}

// A secret question is asked only while GitHub is available, because GitHub is the only place a secret
// is stored (see src/form/secrets.ts). This is added to every secret question, whatever its own condition
// is, so a new one cannot be forgotten; pages and questions that are about GitHub only (the registry
// page, the Sentry switch, ...) say so in forms/wizard.yml.
function hideSecretsWithoutGitHub(survey: Model) {
  for (const question of survey.getAllQuestions()) {
    if (!isSecret(question)) continue
    const own = question.visibleIf?.trim()
    question.visibleIf = own ? `(${own}) and {githubAvailable} = true` : '{githubAvailable} = true'
  }
}

// `githubAvailable` is false when GitHub was skipped: no secret is asked for or generated.
export function createSurvey(githubAvailable = true): Model {
  const survey = new Model(wizard)
  survey.setVariable('githubAvailable', githubAvailable)
  requireUnlessDefined(survey)
  survey.setVariable(BACKUP_KEYS_VARIABLE, false) // until an environment is picked, it has no key pair
  hideSecretsWithoutGitHub(survey)
  survey.onCurrentPageChanged.add(generateMissingSecrets)
  generateMissingSecrets(survey) // the first page is shown without a page change
  groupMenu(survey)
  addReviewItem(survey)
  trackMenuStatus(survey)
  return survey
}

function applyEnvironmentChoices(survey: Model, names: string[]) {
  // Existing environments can be picked to update them; any other name creates a new one.
  const environmentName = survey.getQuestionByName('ENVIRONMENT_NAME') as QuestionDropdownModel
  environmentName.choices = names
  // Existing environments are also what a restore can be taken from.
  const restoreFrom = survey.getQuestionByName('RESTORE_ENVIRONMENT_NAME') as QuestionDropdownModel
  restoreFrom.choices = names
}

// The environments that GitHub has become the choices of the environment fields.
export async function applyGitHubState(survey: Model, github: GitHubPort) {
  applyEnvironmentChoices(survey, await github.listEnvironments())
}

// The environment list comes from GitHub when it is connected, otherwise from the local
// environments/ folder.
export async function applyEnvironmentSources(survey: Model, sources: Sources) {
  if (sources.github) return applyGitHubState(survey, sources.github)
  applyEnvironmentChoices(survey, (await sources.local.listEnvironments()).names)
}
