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
import { IFormDraft } from './reducer'

export const selectFormDraftData = (store: IStoreState): IFormDraft => {
  if (store.formDraft.state === 'LOADING') {
    throw new Error('FormDraft not loaded yet')
  }
  return store.formDraft.formDraft
}

export function selectFormDraft(store: IStoreState, event: Event) {
  const formDraft = selectFormDraftData(store)
  return formDraft[event]
}
