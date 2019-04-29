import { LoopReducer, Loop } from 'redux-loop'
import { IForm } from 'forms'
import { defineMessages } from 'react-intl'
import { childSection } from './fieldDefinitions/birth/child-section'
import { motherSection } from './fieldDefinitions/birth/mother-section'
import { fatherSection } from './fieldDefinitions/birth/father-section'
import { registrationSection } from './fieldDefinitions/birth/registration-section'
import { documentsSection } from './fieldDefinitions/birth/documents-section'
import { deceasedSection } from './fieldDefinitions/death/deceased-section'
import { applicantsSection } from './fieldDefinitions/death/application-section'
import { eventSection } from './fieldDefinitions/death/event-section'
import { causeOfDeathSection } from './fieldDefinitions/death/cause-of-death-section'
import { documentsSection as deathDocumentsSection } from './fieldDefinitions/death/documents-section'

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
  registerForm: {
    birth: IForm
    death: IForm
  }
}

export const initialState: IRegisterFormState = {
  registerForm: {
    birth: {
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
    death: {
      sections: [
        deceasedSection,
        applicantsSection,
        eventSection,
        causeOfDeathSection,
        deathDocumentsSection,
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
