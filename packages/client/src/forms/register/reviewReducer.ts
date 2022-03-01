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
import { IForm, ReviewSection, ISerializedForm } from '@client/forms'
import { messages } from '@client/i18n/messages/views/review'
import * as offlineActions from '@client/offline/actions'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { defaultFormsConfig } from '@client/forms/configurable'
import { mockOfflineData } from '@client/tests/util'

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
      }
    }

export const initialState: IReviewFormState = {
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
    case offlineActions.CONTENT_LOADED:
      const birth = deserializeForm(
        process.env.NODE_ENV === 'test'
          ? (mockOfflineData.forms.registerForm.birth as ISerializedForm)
          : (defaultFormsConfig.registerForm.birth as ISerializedForm)
      )
      const death = deserializeForm(
        process.env.NODE_ENV === 'test'
          ? (mockOfflineData.forms.registerForm.death as ISerializedForm)
          : (defaultFormsConfig.registerForm.death as ISerializedForm)
      )

      const review = {
        id: ReviewSection.Review,
        viewType: 'review' as const,
        name: messages.reviewName,
        title: messages.reviewTitle,
        groups: [
          {
            id: 'review-view-group',
            fields: []
          }
        ]
      }

      return {
        ...state,
        state: 'READY',
        reviewForm: {
          birth: {
            ...birth,
            sections: [...birth.sections, review]
          },
          death: {
            ...death,
            sections: [...death.sections, review]
          }
        }
      }
    default:
      return state
  }
}
