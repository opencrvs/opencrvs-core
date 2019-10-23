import { LoopReducer, Loop } from 'redux-loop'
import { IForm, ReviewSection } from '@register/forms'
import { messages } from '@register/i18n/messages/views/review'
import * as offlineActions from '@register/offline/actions'
import { deserializeForm } from '@register/forms/mappings/deserializer'

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
      const birth = deserializeForm(action.payload.forms.registerForm.birth)
      const death = deserializeForm(action.payload.forms.registerForm.death)

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
