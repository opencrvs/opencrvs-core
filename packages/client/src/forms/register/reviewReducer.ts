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
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import { IForm } from '@client/forms'
import * as offlineActions from '@client/offline/actions'
import { deserializeForm } from '@client/forms/deserializer/deserializer'
import { initValidators, validators } from '@client/forms/validators'

export type IReviewFormState =
  | {
      state: 'LOADING'
      reviewForm: null
    }
  | {
      state: 'READY'
      reviewForm: {
        birth: IForm
        death: IForm
        marriage: IForm
      }
    }

const initialState: IReviewFormState = {
  state: 'LOADING',
  reviewForm: null
}

const GET_REVIEW_FORM = 'REVIEW_FORM/GET_REVIEW_FORM'
type GetReviewFormAction = {
  type: typeof GET_REVIEW_FORM
}
type Action = GetReviewFormAction

export const reviewReducer: LoopReducer<IReviewFormState, Action> = (
  state: IReviewFormState = initialState,
  action: Action | offlineActions.Action
): IReviewFormState | Loop<IReviewFormState, Action> => {
  switch (action.type) {
    case offlineActions.READY:
    case offlineActions.FORMS_LOADED:
      return loop(
        state,
        Cmd.run(
          async () => {
            await initValidators()
            return action.payload
          },
          {
            successActionCreator: offlineActions.CustomValidatorsSuccess
          }
        )
      )
    case offlineActions.CUSTOM_VALIDATORS_LOADED:
      const { forms } = action.payload

      const birth = deserializeForm(forms.birth, validators)
      const death = deserializeForm(forms.death, validators)
      const marriage = deserializeForm(forms.marriage, validators)

      return {
        ...state,
        state: 'READY',
        reviewForm: {
          birth: {
            ...birth,
            sections: [
              ...birth.sections.filter(({ viewType }) =>
                ['form', 'hidden', 'review'].includes(viewType)
              )
            ]
          },
          death: {
            ...death,
            sections: [
              ...death.sections.filter(({ viewType }) =>
                ['form', 'hidden', 'review'].includes(viewType)
              )
            ]
          },
          marriage: {
            ...marriage,
            sections: [
              ...marriage.sections.filter(({ viewType }) =>
                ['form', 'hidden', 'review'].includes(viewType)
              )
            ]
          }
        }
      }
    default:
      return state
  }
}
