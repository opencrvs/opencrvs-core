import { LoopReducer, Loop } from 'redux-loop'
import { IForm } from '@register/forms'
import { childSection } from '@register/forms/register/fieldDefinitions/birth/child-section'
import { motherSection } from '@register/forms/register/fieldDefinitions/birth/zmb/mother-section'
import { fatherSection } from '@register/forms/register/fieldDefinitions/birth/zmb/father-section'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { documentsSection } from '@register/forms/register/fieldDefinitions/birth/documents-section'
import { deceasedSection } from '@register/forms/register/fieldDefinitions/death/deceased-section'
import { applicantsSection } from '@register/forms/register/fieldDefinitions/death/application-section'
import { eventSection } from '@register/forms/register/fieldDefinitions/death/event-section'
import { causeOfDeathSection } from '@register/forms/register/fieldDefinitions/death/cause-of-death-section'
import { documentsSection as deathDocumentsSection } from '@register/forms/register/fieldDefinitions/death/documents-section'
import { messages } from '@register/i18n/messages/views/review'

export interface IReviewFormState {
  reviewForm: {
    birth: IForm
    death: IForm
  }
}

export const initialState: IReviewFormState = {
  reviewForm: {
    birth: {
      sections: [
        childSection,
        motherSection,
        fatherSection,
        registrationSection,
        documentsSection,
        {
          id: 'review',
          viewType: 'review',
          name: messages.reviewName,
          title: messages.reviewTitle,
          groups: [
            {
              id: 'review-group',
              fields: []
            }
          ]
        }
      ]
    },
    death: {
      sections: [
        deceasedSection,
        eventSection,
        causeOfDeathSection,
        applicantsSection,
        deathDocumentsSection,
        {
          id: 'review',
          viewType: 'review',
          name: messages.reviewName,
          title: messages.reviewTitle,
          groups: [
            {
              id: 'review-group',
              fields: []
            }
          ]
        }
      ]
    }
  }
}

const GET_REVIEW_FORM = 'REVIEW_FORM/GET_REVIEW_FORM'
type GetReviewFormAction = {
  type: typeof GET_REVIEW_FORM
}
type Action = GetReviewFormAction

export const reviewReducer: LoopReducer<IReviewFormState, Action> = (
  state: IReviewFormState = initialState,
  action: Action
): IReviewFormState | Loop<IReviewFormState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
