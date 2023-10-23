/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as actions from '@client/search/advancedSearch/actions'
import * as offlineActions from '@client/offline/actions'
import { Loop, LoopReducer } from 'redux-loop'

export type IAdvancedSearchParamState = {
  event?: string
  registrationStatuses?: string[]
  dateOfEvent?: string
  dateOfEventStart?: string
  dateOfEventEnd?: string
  registrationNumber?: string
  trackingId?: string
  dateOfRegistration?: string
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  declarationLocationId?: string
  declarationJurisdictionId?: string
  eventCountry?: string
  eventLocationId?: string
  eventLocationLevel1?: string
  eventLocationLevel2?: string
  eventLocationLevel3?: string
  eventLocationLevel4?: string
  eventLocationLevel5?: string
  childFirstNames?: string
  childLastName?: string
  childDoB?: string
  childDoBStart?: string
  childDoBEnd?: string
  childGender?: string
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedGender?: string
  deceasedDoB?: string
  deceasedDoBStart?: string
  deceasedDoBEnd?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: string
  motherDoBStart?: string
  motherDoBEnd?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherDoB?: string
  fatherDoBStart?: string
  fatherDoBEnd?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantDoB?: string
  informantDoBStart?: string
  informantDoBEnd?: string
  searchId?: string
}

export const advancedSearchInitialState: IAdvancedSearchParamState = {
  event: '',
  registrationStatuses: undefined,
  dateOfEvent: '',
  dateOfEventStart: '',
  dateOfEventEnd: '',
  registrationNumber: '',
  eventCountry: '',
  trackingId: '',
  dateOfRegistration: '',
  dateOfRegistrationStart: '',
  dateOfRegistrationEnd: '',
  declarationLocationId: '',
  declarationJurisdictionId: '',
  eventLocationId: '',
  eventLocationLevel1: '',
  eventLocationLevel2: '',
  eventLocationLevel3: '',
  eventLocationLevel4: '',
  eventLocationLevel5: '',
  childFirstNames: '',
  childLastName: '',
  childDoB: '',
  childDoBStart: '',
  childDoBEnd: '',
  childGender: '',
  deceasedFirstNames: '',
  deceasedFamilyName: '',
  deceasedGender: '',
  deceasedDoB: '',
  deceasedDoBStart: '',
  deceasedDoBEnd: '',
  motherFirstNames: '',
  motherFamilyName: '',
  motherDoB: '',
  motherDoBStart: '',
  motherDoBEnd: '',
  fatherFirstNames: '',
  fatherFamilyName: '',
  fatherDoB: '',
  fatherDoBStart: '',
  fatherDoBEnd: '',
  informantFirstNames: '',
  informantFamilyName: '',
  informantDoB: '',
  informantDoBStart: '',
  informantDoBEnd: '',
  searchId: ''
}

type Actions = actions.AdvancedSearchParamActions | offlineActions.Action

export const advancedSearchParamReducer: LoopReducer<
  IAdvancedSearchParamState,
  Actions
> = (
  state: IAdvancedSearchParamState = advancedSearchInitialState,
  action: Actions
): IAdvancedSearchParamState | Loop<IAdvancedSearchParamState, Actions> => {
  switch (action.type) {
    case actions.SET_ADVANCED_SEARCH_PARAM: {
      return {
        ...action.payload
      }
    }
    default:
      return state
  }
}
