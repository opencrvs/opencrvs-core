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
import { IReviewFormState } from '@client/forms/register/reviewReducer'
import { IStoreState } from '@client/store'
import { Event } from '@client/forms'

const getPartialState = (store: IStoreState): IReviewFormState =>
  store.reviewForm

function getKey<K extends keyof IReviewFormState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getReviewForm = (store: IStoreState) => {
  const form = getKey(store, 'reviewForm')
  if (!form) {
    throw new Error(
      'Selector called before data was ready. This should never happen'
    )
  }

  return form
}

export const getEventReviewForm = (store: IStoreState, event: Event) => {
  return getReviewForm(store)[event]
}
