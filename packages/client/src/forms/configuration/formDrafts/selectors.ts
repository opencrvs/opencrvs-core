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
import { IFormDraftDataState } from './reducer'
import { Event } from '@client/forms'

export const selectFormDraftData = (store: IStoreState): IFormDraftDataState =>
  store.formDraft

function getKey<K extends keyof IFormDraftDataState>(
  store: IStoreState,
  key: K
) {
  return selectFormDraftData(store)[key]
}

export function selectFormDraftLoaded(store: IStoreState) {
  return selectFormDraftData(store).formDraftDataLoaded
}

export function selectEventFormDraft(store: IStoreState, event: Event) {
  return selectFormDraftData(store).formDraftData?.[event]
}

export const getFormDraftData = (store: IStoreState): any =>
  getKey(store, 'formDraftData')
