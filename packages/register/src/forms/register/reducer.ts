import { LoopReducer, Loop } from 'redux-loop'
import { IForm, IFormSection } from 'src/forms'
import { defineMessages } from 'react-intl'
import { childSection, IChildSectionFormData } from './child-section'
import { motherSection, IMotherSectionFormData } from './mother-section'
import {
  fatherSection,
  fathersSectionDetails,
  IFatherSectionFormData
} from './father-section'

export interface IRegisterFormData {
  child: IChildSectionFormData
  mother: IMotherSectionFormData
  father: IFatherSectionFormData
}

const messages = defineMessages({
  registrationTab: {
    id: 'register.form.tabs.registrationTab',
    defaultMessage: 'Registration',
    description: 'Tab title for Registration'
  },
  registrationTitle: {
    id: 'register.form.section.registrationTitle',
    defaultMessage: 'Registration',
    description: 'Form section title for Registration'
  },
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

const ADD_FATHERS_DETAILS = 'REGISTER_FORM/ADD_FATHERS_DETAILS'
const REMOVE_FATHERS_DETAILS = 'REGISTER_FORM/REMOVE_FATHERS_DETAILS'

type AddFathersDetailsAction = {
  type: typeof ADD_FATHERS_DETAILS
}

export function addFathersDetails() {
  return { type: ADD_FATHERS_DETAILS }
}

type RemoveFathersDetailsAction = {
  type: typeof REMOVE_FATHERS_DETAILS
}

export function removeFathersDetails() {
  return { type: REMOVE_FATHERS_DETAILS }
}

type Action = AddFathersDetailsAction | RemoveFathersDetailsAction

export type IRegisterFormState = {
  registerForm: IForm
  fathersDetailsAdded: boolean
}

export const initialState: IRegisterFormState = {
  registerForm: {
    sections: [
      childSection,
      motherSection,
      fatherSection,
      {
        id: 'registration',
        viewType: 'form',
        name: messages.registrationTab,
        title: messages.registrationTitle,
        fields: []
      },
      {
        id: 'documents',
        viewType: 'form',
        name: messages.documentsTab,
        title: messages.documentsTitle,
        fields: []
      },
      {
        id: 'preview',
        viewType: 'preview',
        name: messages.previewTab,
        title: messages.previewTitle,
        fields: []
      }
    ]
  },
  fathersDetailsAdded: false
}

const getRegisterFormSection = (state: IRegisterFormState, key: string) => {
  return state.registerForm.sections.find(
    (section: IFormSection) => section.id === key
  ) as IFormSection
}

const getRegisterFormSectionIndex = (
  state: IRegisterFormState,
  section: IFormSection
) => {
  return state.registerForm.sections.indexOf(section)
}

export const registerFormReducer: LoopReducer<IRegisterFormState, Action> = (
  state: IRegisterFormState = initialState,
  action: Action
): IRegisterFormState | Loop<IRegisterFormState, Action> => {
  switch (action.type) {
    case ADD_FATHERS_DETAILS:
      if (!state.fathersDetailsAdded) {
        const newState = { ...state, fathersDetailsAdded: true }
        const fathersSection = getRegisterFormSection(state, 'father')
        const sectionIndex = getRegisterFormSectionIndex(state, fathersSection)
        const newFields = fathersSection.fields.concat(fathersSectionDetails)
        fathersSection.fields = newFields
        newState.registerForm.sections.splice(sectionIndex, 1, fathersSection)
        return newState
      } else {
        return { ...state }
      }
    case REMOVE_FATHERS_DETAILS:
      if (state.fathersDetailsAdded) {
        const newState = { ...state, fathersDetailsAdded: false }
        newState.registerForm.sections[2].fields.length = 1
        return newState
      } else {
        return { ...state }
      }
    default:
      return state
  }
}
