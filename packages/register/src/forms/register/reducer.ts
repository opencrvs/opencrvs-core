import { LoopReducer, Loop } from 'redux-loop'
import { IForm, DOCUMENTS } from 'src/forms'
import { defineMessages } from 'react-intl'
import { childSection } from './child-section'
import { motherSection } from './mother-section'
import { fatherSection } from './father-section'
import { registrationSection } from './registration-section'

const messages = defineMessages({
  documentsTab: {
    id: 'register.form.tabs.documentsTab',
    defaultMessage: 'Documents',
    description: 'Tab title for Documents'
  },
  documentsTitle: {
    id: 'register.form.section.documentsTitle',
    defaultMessage: 'Documents',
    description: 'Form section title for Documents'
  },
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
  registerForm: IForm
}

export const initialState: IRegisterFormState = {
  registerForm: {
    sections: [
      childSection,
      motherSection,
      fatherSection,
      registrationSection,
      {
        id: 'documents',
        viewType: 'form',
        name: messages.documentsTab,
        title: messages.documentsTitle,
        fields: [
          {
            name: 'documents',
            type: DOCUMENTS,
            // Just a dummy message here - not actually shown anywhere
            label: messages.documentsTab,
            required: false,
            initialValue: '',
            validate: []
          }
        ]
      },
      {
        id: 'preview',
        viewType: 'preview',
        name: messages.previewTab,
        title: messages.previewTitle,
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

export const registerFormReducer: LoopReducer<IRegisterFormState, Action> = (
  state: IRegisterFormState = initialState,
  action: Action
): IRegisterFormState | Loop<IRegisterFormState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
