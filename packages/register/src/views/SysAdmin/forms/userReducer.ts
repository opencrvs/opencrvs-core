import { LoopReducer, Loop } from 'redux-loop'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import { IFormSectionData, IForm } from '@register/forms'
import { Action } from 'redux'
import { defineMessages } from 'react-intl'

const MODIFY_USER_FORM_DATA = 'MODIFY_USER_FORM_DATA'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  previewTab: {
    id: 'createUser.preview.title',
    defaultMessage: 'Please review the new users details',
    description: 'The title of user preview form'
  },
  previewTitle: {
    id: 'user.title.create',
    defaultMessage: 'Create new user',
    description: 'The title of user form'
  }
})

const initialState: IUserFormState = {
  userForm: {
    sections: [
      userSection,
      {
        id: 'preview',
        viewType: 'preview',
        name: messages.previewTab,
        title: messages.previewTitle,
        fields: userSection.fields
      }
    ]
  },
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
  userForm: IForm
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
