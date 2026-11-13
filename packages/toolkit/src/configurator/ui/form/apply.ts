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
import type { Model } from 'survey-core'
import type { Snapshot } from '../bindings/snapshot'
import { BACKUP_KEYS_VARIABLE, hasBackupKeys } from '../plan/backupSecrets'
import { inferToggles, suggestType } from './infer'
import { generateMissingSecrets } from './secrets'

// Secrets that exist on GitHub cannot be read, so the form is told which ones exist: they are no
// longer required, and their fields stay locked until Edit is pressed (see SecretQuestionView).
// The backup SSH key pair has no question, so it is told apart: the checkbox that asks for a new pair is
// ticked and locked while the environment has none. No snapshot means nothing exists yet.
function markDefinedSecrets(survey: Model, snapshot?: Snapshot) {
  survey.setVariable('definedSecrets', snapshot?.definedSecrets ?? [])
  survey.setVariable(BACKUP_KEYS_VARIABLE, hasBackupKeys(snapshot))
}

// Back to a blank form for the environment that is named, so nothing from the
// previously loaded one stays behind. Variables (GitHub state) are kept.
function clearAnswers(survey: Model) {
  const name = survey.getValue('ENVIRONMENT_NAME')
  survey.clear(true, false)
  if (name !== undefined) survey.setValue('ENVIRONMENT_NAME', name)
}

export function resetEnvironment(survey: Model) {
  clearAnswers(survey)
  markDefinedSecrets(survey)
  // A secret on the page that is open (the first one, with the Metabase password) is not generated again
  // by a page change, so the blank form gets its values here.
  generateMissingSecrets(survey)
}

// A new environment still sees what the repository holds (REGISTRY_HOST, the registry secrets).
// Fill those in, but never over a value the user typed: only empty questions and ones still
// at their default are touched, so a default does not silently replace what GitHub has.
export function prefillRepositoryValues(survey: Model, snapshot: Snapshot) {
  markDefinedSecrets(survey, snapshot)
  for (const [name, value] of Object.entries(snapshot.values)) {
    const question = survey.getQuestionByName(name)
    if (!question) continue
    const atDefault = question.defaultValue !== undefined && JSON.stringify(question.value) === JSON.stringify(question.defaultValue)
    if (question.isEmpty() || atDefault) survey.setValue(name, value)
  }
}

// Fills the form from what was found for an existing environment.
export function applySnapshot(survey: Model, snapshot: Snapshot) {
  // GitHub's state goes in before the answers are cleared: clearing runs the conditions, and a checkbox that is
  // ticked while a key pair is missing would tick itself again from the previous environment's state.
  markDefinedSecrets(survey, snapshot)
  clearAnswers(survey)

  // The type goes first: choosing staging or production forces ACTIVATE_USERS off, and a stored value then wins.
  const type = suggestType(snapshot.environment)
  if (type) survey.setValue('ENVIRONMENT_TYPE', type)

  for (const [name, value] of Object.entries(snapshot.values)) {
    if (survey.getQuestionByName(name)) survey.setValue(name, value)
  }
  for (const [name, value] of Object.entries(inferToggles(snapshot))) survey.setValue(name, value)

  // The old script kept no mode, only the certificate: an environment that has one uses it.
  if (!('TRAEFIK_MODE' in snapshot.values) && snapshot.definedSecrets.includes('SSL_CRT')) {
    survey.setValue('TRAEFIK_MODE', 'static_ssl')
  }

  // Secrets that GitHub has are skipped; the others on the open page get a value.
  generateMissingSecrets(survey)
}
