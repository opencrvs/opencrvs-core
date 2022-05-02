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
import { Event } from '@client/forms'
import { ISectionFieldMap, IConfigFieldMap } from './utils'

export function selectFormConfigState(store: IStoreState) {
  if (store.formConfig.state === 'LOADING') {
    throw new Error('Offline data not loaded yet')
  }
  return store.formConfig
}

export function selectConfigRegisterForm(store: IStoreState, event: Event) {
  const formConfigState = selectFormConfigState(store)
  return formConfigState[event].registerForm
}

export function selectConfigFields(
  store: IStoreState,
  event: Event
): ISectionFieldMap
export function selectConfigFields(
  store: IStoreState,
  event: Event,
  section: string
): IConfigFieldMap
export function selectConfigFields(
  store: IStoreState,
  event: Event,
  section?: string
) {
  const {
    [event]: { configFields }
  } = selectFormConfigState(store)
  return section ? configFields[section] : configFields
}

export function selectConfigField(
  store: IStoreState,
  event: Event,
  section: string,
  fieldId: string | null
) {
  return fieldId ? selectConfigFields(store, event, section)[fieldId] : null
}
