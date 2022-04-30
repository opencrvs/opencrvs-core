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
import {
  ISectionFieldMap,
  isDefaultField,
  hasDefaultFieldChanged
} from './utils'

export function selectConfigFieldsState(store: IStoreState) {
  if (store.configFields.state === 'LOADING') {
    throw new Error('Offline data not loaded yet')
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

function generateQuestionConfigs(configFields: ISectionFieldMap) {
  const questionConfigs: IQuestionConfig[] = []
  Object.values(configFields).forEach((sectionConfigFields) => {
    Object.values(sectionConfigFields).forEach((configField) => {
      if (!isDefaultField(configField)) {
        const { foregoingFieldId, ...rest } = configField
        questionConfigs.push(rest)
      } else if (hasDefaultFieldChanged(configField)) {
        const { foregoingFieldId, identifiers, ...rest } = configField
        questionConfigs.push(rest)
      }
    })
  })
  return questionConfigs
}

export function selectQuestionConfigs(store: IStoreState, event: Event) {
  const configFields = selectConfigFieldsState(store)
  return generateQuestionConfigs(configFields[event])
}
