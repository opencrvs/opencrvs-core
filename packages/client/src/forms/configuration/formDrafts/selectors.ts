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
import { IFormDraftState } from './reducer'
import { Event } from '@client/forms'

export const selectFormDraftData = (store: IStoreState): IFormDraftState =>
  store.formDraft

function getKey<K extends keyof IFormDraftState>(store: IStoreState, key: K) {
  return selectFormDraftData(store)[key]
}

export function selectFormDraftLoaded(store: IStoreState) {
  return getKey(store, 'state') !== 'LOADING'
}

export function selectFormDraft(store: IStoreState, event: Event) {
  const formDraftState = selectFormDraftData(store)
  if (formDraftState.state === 'LOADING') {
    throw new Error('FormDraft not loaded yet')
  }
  return formDraftState.formDraftData[event]
}

export function selectFormDraftVersion(store: IStoreState, event: Event) {
  const formDraftState = selectFormDraftData(store)
  if (formDraftState.state === 'LOADING') {
    return 0
  }
  return formDraftState.formDraftData[event].version
}
