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
import { isShown } from './menu'
import { isSecret } from './secrets'

// The answers that are on screen: a question on a hidden page, or in a hidden panel, is left out,
// so values typed before a switch was turned off never get written. Secrets are included, so
// this must not be shown or exported as it is (see answersWithoutSecrets).
export function activeValues(survey: Model): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const question of survey.getAllQuestions()) {
    if (!question.page?.isVisible || !isShown(question)) continue
    const value = question.value
    if (value === undefined || value === null || value === '') continue
    values[question.getValueName()] = value
  }
  return values
}

// The same answers without the secrets: safe to show, to download, and to send to the file routes.
export function withoutSecrets(survey: Model, values: Record<string, unknown>): Record<string, unknown> {
  const result = { ...values }
  for (const question of survey.getAllQuestions()) {
    if (isSecret(question)) delete result[question.getValueName()]
  }
  return result
}
