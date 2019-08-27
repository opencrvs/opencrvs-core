import { LoopReducer, Loop } from 'redux-loop'
import { IForm } from '@register/forms'
import { childSection } from '@register/forms/register/fieldDefinitions/birth/child-section'
import { motherSection } from '@register/forms/register/fieldDefinitions/birth/mother-section'
import { fatherSection } from '@register/forms/register/fieldDefinitions/birth/father-section'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { documentsSection } from '@register/forms/register/fieldDefinitions/birth/zmb/documents-section'
import { deceasedSection } from '@register/forms/register/fieldDefinitions/death/deceased-section'
import { applicantsSection } from '@register/forms/register/fieldDefinitions/death/application-section'
import { eventSection } from '@register/forms/register/fieldDefinitions/death/event-section'
import { causeOfDeathSection } from '@register/forms/register/fieldDefinitions/death/cause-of-death-section'
import { documentsSection as deathDocumentsSection } from '@register/forms/register/fieldDefinitions/death/documents-section'
import { messages } from '@register/i18n/messages/views/review'

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
          name: messages.previewName,
          title: messages.previewTitle,
          groups: [
            {
              id: 'preview-view-group',
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
          id: 'preview',
          viewType: 'preview',
          name: messages.previewName,
          title: messages.previewTitle,
          groups: [
            {
              id: 'preview-view-group',
              fields: []
            }
          ]
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
