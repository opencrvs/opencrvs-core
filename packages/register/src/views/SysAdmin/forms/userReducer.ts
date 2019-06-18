import { LoopReducer, Loop } from 'redux-loop'
import { userSection } from './fieldDefinitions/user-section'
import { IFormSection, IFormSectionData } from 'src/forms'

const MODIFY_USER_FORM_DATA = 'MODIFY_USER_FORM_DATA'

const initialState: IUserFormState = {
  userForm: userSection,
  userFormData: {}
}

interface IUserFormDataModifyAction {
  type: typeof MODIFY_USER_FORM_DATA
  payload: {
    data: IFormSectionData
  }
}

export function modifyUserFormData(
  data: IFormSectionData
): IUserFormDataModifyAction {
  return {
    type: MODIFY_USER_FORM_DATA,
    payload: {
      data
    }
  }
}

type Action = IUserFormDataModifyAction
export interface IUserFormState {
  userForm: IFormSection
  userFormData: IFormSectionData
}

export const userFormReducer: LoopReducer<IUserFormState, Action> = (
  state: IUserFormState = initialState,
  action: Action
): IUserFormState | Loop<IUserFormState, Action> => {
  switch (action.type) {
    case MODIFY_USER_FORM_DATA:
      return { ...state, userFormData: action.payload.data }
    default:
      return state
  }
}
