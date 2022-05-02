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
import { Event, IQuestionConfig, IForm } from '@client/forms'
import {
  ISectionFieldMap,
  isDefaultField,
  hasDefaultFieldChanged
} from './utils'

export function selectFormConfigState(store: IStoreState) {
  if (store.formConfig.state === 'LOADING') {
    throw new Error('Offline data not loaded yet')
  }
  return store.formConfig
}

function selectConfigRegisterForm(store: IStoreState, event: Event) {
  const formConfigState = selectFormConfigState(store)
  return formConfigState[event].registerForm
}

export function selectSectionConfigFields(
  store: IStoreState,
  event: Event,
  section: string
) {
  const formConfigState = selectFormConfigState(store)
  return formConfigState[event].configFields[section]
}

export function selectConfigField(
  store: IStoreState,
  event: Event,
  section: string,
  fieldId: string | null
) {
  return fieldId
    ? selectSectionConfigFields(store, event, section)[fieldId]
    : null
}

function generateModifiedQuestionConfigs(
  configFields: ISectionFieldMap,
  registerForm: IForm
) {
  const questionConfigs: IQuestionConfig[] = []
  Object.values(configFields).forEach((sectionConfigFields) => {
    Object.values(sectionConfigFields).forEach((configField) => {
      if (!isDefaultField(configField)) {
        const { foregoingFieldId, ...rest } = configField
        questionConfigs.push(rest)
      } else if (hasDefaultFieldChanged(configField, registerForm)) {
        const { foregoingFieldId, identifiers, ...rest } = configField
        questionConfigs.push(rest)
      }
    })
  })
  return questionConfigs
}

export function selectModifiedQuestionConfigs(
  store: IStoreState,
  event: Event
) {
  const configFields = selectFormConfigState(store)[event].configFields
  const registerForm = selectConfigRegisterForm(store, event)
  return generateModifiedQuestionConfigs(configFields, registerForm)
}
