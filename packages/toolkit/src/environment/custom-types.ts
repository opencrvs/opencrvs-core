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

import prompts, { PromptObject } from 'prompts'
import {
    Secret,
    Variable
} from './github'

export type Question<T extends string> = PromptObject<T> & {
  name: T
  valueType?: 'SECRET' | 'VARIABLE'
  scope: 'ENVIRONMENT' | 'REPOSITORY'
  valueLabel?: string
}

export type QuestionDescriptor<T extends string> = Omit<Question<T>, 'type'> & {
  type: 'disabled' | PromptObject<T>['type']
}

export type SecretAnswer = {
  type: 'SECRET'
  scope: 'ENVIRONMENT' | 'REPOSITORY'
  name: string
  value: string
  didExist: Secret | undefined
}

export type VariableAnswer = {
  type: 'VARIABLE'
  name: string
  didExist: Variable | undefined
  value: string
  scope: 'ENVIRONMENT' | 'REPOSITORY'
}

export type Answer = SecretAnswer | VariableAnswer
export type Answers = Answer[]
export type AnswerWithNullValue =
  | (Omit<SecretAnswer, 'value'> & {
      value: SecretAnswer['value'] | null
    })
  | (Omit<VariableAnswer, 'value'> & {
      value: VariableAnswer['value'] | null
    })
