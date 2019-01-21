import { LoopReducer, Loop } from 'redux-loop'
import { IForm } from 'src/forms'
import { defineMessages } from 'react-intl'
import { childSection } from './child-section'
import { motherSection } from './mother-section'
import { fatherSection } from './father-section'
import { registrationSection } from './registration-section'
import { documentsSection } from './documents-section'
import * as actions from 'src/forms/register/actions'

const messages = defineMessages({
  previewTab: {
    id: 'register.form.tabs.previewTab',
    defaultMessage: 'Preview',
    description: 'Tab title for Preview'
  },
  previewTitle: {
    id: 'register.form.section.previewTitle',
    defaultMessage: 'Preview',
    description: 'Form section title for Preview'
  }
})

export type IRegisterFormState = {
  activeEvent: actions.EVENT | null
  registerForm: IForm
  deathRegisterForm: IForm
}

type Action =
  | actions.GetRegisterFormAction
  | actions.GetDeathRegisterFormAction
  | actions.SetActiveEventAction

export const initialState: IRegisterFormState = {
  activeEvent: null,
  registerForm: {
    sections: [
      childSection,
      motherSection,
      fatherSection,
      registrationSection,
      documentsSection,
      {
        id: 'preview',
        viewType: 'preview',
        name: messages.previewTab,
        title: messages.previewTitle,
        fields: []
      }
    ]
  },
  deathRegisterForm: {
    sections: []
  }
}

export const registerFormReducer: LoopReducer<IRegisterFormState, Action> = (
  state: IRegisterFormState = initialState,
  action: Action
): IRegisterFormState | Loop<IRegisterFormState, Action> => {
  switch (action.type) {
    case actions.SET_ACTIVE_EVENT:
      return {
        ...state,
        activeEvent: action.payload.event
      }
    default:
      return state
  }
}
