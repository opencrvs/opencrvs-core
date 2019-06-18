import { LoopReducer, Loop } from 'redux-loop'
import { IForm } from '@register/forms'
import { defineMessages } from 'react-intl'
import { childSection } from '@register/forms/register/fieldDefinitions/birth/child-section'
import { motherSection } from '@register/forms/register/fieldDefinitions/birth/mother-section'
import { fatherSection } from '@register/forms/register/fieldDefinitions/birth/father-section'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { documentsSection } from '@register/forms/register/fieldDefinitions/birth/documents-section'
import { deceasedSection } from '@register/forms/register/fieldDefinitions/death/deceased-section'
import { applicantsSection } from '@register/forms/register/fieldDefinitions/death/application-section'
import { eventSection } from '@register/forms/register/fieldDefinitions/death/event-section'
import { causeOfDeathSection } from '@register/forms/register/fieldDefinitions/death/cause-of-death-section'
import { documentsSection as deathDocumentsSection } from '@register/forms/register/fieldDefinitions/death/documents-section'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  reviewTab: {
    id: 'review.form.tabs.reviewTab',
    defaultMessage: 'Review',
    description: 'Tab title for Review'
  },
  reviewTitle: {
    id: 'review.form.section.reviewTitle',
    defaultMessage: 'Review',
    description: 'Form section title for Review'
  }
})

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
          name: messages.reviewTab,
          title: messages.reviewTitle,
          fields: []
        }
      ]
    },
    death: {
      sections: [
        deceasedSection,
        applicantsSection,
        eventSection,
        causeOfDeathSection,
        deathDocumentsSection,
        {
          id: 'review',
          viewType: 'review',
          name: messages.reviewTab,
          title: messages.reviewTitle,
          fields: []
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
