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
import { LoopReducer, Loop } from 'redux-loop'
import {
  rejectRegistration,
  IRejectRegistrationForm
} from '@client/review/reject-registration'

export type IRejectState = {
  rejectForm: IRejectRegistrationForm
}

export const initialState: IRejectState = {
  rejectForm: rejectRegistration
}

const GET_REJECTION_FORM = 'REJECT/GET_REJECTION_FORM'
type GetRejectFormAction = {
  type: typeof GET_REJECTION_FORM
}
type Action = GetRejectFormAction

export const rejectReducer: LoopReducer<IRejectState, Action> = (
  state: IRejectState = initialState,
  action: Action
): IRejectState | Loop<IRejectState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
