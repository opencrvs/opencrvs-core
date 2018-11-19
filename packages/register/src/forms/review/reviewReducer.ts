import { LoopReducer, Loop } from 'redux-loop'
import { IForm } from 'src/forms'
import { defineMessages } from 'react-intl'
import { childSection } from '../register/child-section'
import { motherSection } from '../register/mother-section'
import { fatherSection } from '../register/father-section'
import { registrationSection } from '../register/registration-section'
import { documentsSection } from '../register/documents-section'

const messages = defineMessages({
  reviewTab: {
    id: 'register.form.tabs.reviewTab',
    defaultMessage: 'Review',
    description: 'Tab title for Review'
  },
  reviewTitle: {
    id: 'register.form.section.reviewTitle',
    defaultMessage: 'Review',
    description: 'Form section title for Review'
  }
})

export type IReviewFormState = {
  reviewForm: IForm
}

export const initialState: IReviewFormState = {
  reviewForm: {
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
  }
}

const GET_REGISTER_FORM = 'REGISTER_FORM/GET_REGISTER_FORM'
type GetRegisterFormAction = {
  type: typeof GET_REGISTER_FORM
}
type Action = GetRegisterFormAction

export const reviewReducer: LoopReducer<IReviewFormState, Action> = (
  state: IReviewFormState = initialState,
  action: Action
): IReviewFormState | Loop<IReviewFormState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
