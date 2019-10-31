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
import { IStoreState } from '@opencrvs/register/src/store'
import { IRejectState } from '@opencrvs/register/src/review/reducer'

const getPartialState = (store: IStoreState): IRejectState => store.reject

function getKey<K extends keyof IRejectState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getRejectForm = (store: IStoreState): IRejectState['rejectForm'] =>
  getKey(store, 'rejectForm')
