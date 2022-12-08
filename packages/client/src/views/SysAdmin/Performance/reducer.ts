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
import { Loop, LoopReducer } from 'redux-loop'
import * as actions from './actions'
import * as offlineActions from '@client/offline/actions'
import { Event } from '@client/utils/gateway'
import { ISearchLocation } from '@opencrvs/components/lib/LocationSearch'

export type IPerformanceFilterState = {
  selectedLocation: ISearchLocation
  event: Event | null | undefined
  timeStart: Date
  timeEnd: Date
  officeSelected: boolean
}

export const performanceFilterInitialState: IPerformanceFilterState = {
  selectedLocation: { id: '', displayLabel: '', searchableText: '' },
  event: Event.Birth,
  officeSelected: false,
  timeEnd: new Date(),
  timeStart: new Date()
}

export const performanceFilterParamReducer: LoopReducer<
  IPerformanceFilterState,
  Actions
> = (
  state: IPerformanceFilterState = performanceFilterInitialState,
  action: Actions
): IPerformanceFilterState | Loop<IPerformanceFilterState, Actions> => {
  switch (action.type) {
    case actions.SET_PERFORMANCE_FILTER_PARAM: {
      return {
        ...action.payload
      }
    }
    default:
      return state
  }
}

// TODO: I only really want one action here
export type Actions =
  | actions.ModifyPerformanceFilterAction
  | offlineActions.Action
