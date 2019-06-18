import { LoopReducer, Loop } from 'redux-loop'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import { IFormSection, IFormSectionData } from '@register/forms'
import { Action } from 'redux'

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

type UserFormAction = IUserFormDataModifyAction | Action

export interface IUserFormState {
  userForm: IFormSection
  userFormData: IFormSectionData
}

export const userFormReducer: LoopReducer<IUserFormState, UserFormAction> = (
  state: IUserFormState = initialState,
  action: UserFormAction
): IUserFormState | Loop<IUserFormState, UserFormAction> => {
  switch (action.type) {
    case MODIFY_USER_FORM_DATA:
      return {
        ...state,
        userFormData: (action as IUserFormDataModifyAction).payload.data
      }
    default:
      return state
  }
}
