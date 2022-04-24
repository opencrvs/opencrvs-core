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

import { IStoreState } from '@client/store'
import { Event, IQuestionConfig } from '@client/forms'
import { ISectionFieldMap } from './utils'

export function selectConfigFieldsState(store: IStoreState) {
  if (store.configFields.state === 'LOADING') {
    throw new Error('ConfigFields not loaded yet')
  }
  return store.configFields
}
export function selectConfigFields(
  store: IStoreState,
  event: Event,
  section: string
) {
  const configFields = selectConfigFieldsState(store)
  return configFields[event][section]
}

export function selectConfigField(
  store: IStoreState,
  event: Event,
  section: string,
  fieldId: string
) {
  return selectConfigFields(store, event, section)[fieldId]
}

function generateQuestionConfigs(
  oldQuestions: IQuestionConfig[],
  configFields: ISectionFieldMap
) {
  // TODO: create newQuestionConfigs using configFields
  return oldQuestions
}

export function selectNewQuestionConfigs(store: IStoreState, event: Event) {
  const configFields = selectConfigFieldsState(store)
  return generateQuestionConfigs(configFields.questions, configFields[event])
}
