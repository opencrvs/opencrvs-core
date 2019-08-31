import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import {
  IFormSectionData,
  IForm,
  UserSection,
  IFormSection
} from '@register/forms'
import { Action } from 'redux'
import { formMessages as messages } from '@register/i18n/messages'
import ApolloClient from 'apollo-client'
import { goToHome } from '@register/navigation'
import { transformRoleDataToDefinitions } from '@register/views/SysAdmin/user/utils'
import {
  showSubmitFormSuccessToast,
  showSubmitFormErrorToast
} from '@register/notification/actions'
import { SEARCH_USERS } from '@register/sysadmin/user/queries'
import { deserializeForm } from '@register/forms/mappings/deserializer'

const UPDATE_FORM_FIELD_DEFINITIONS = 'USER_FORM/UPDATE_FORM_FIELD_DEFINITIONS'
const MODIFY_USER_FORM_DATA = 'USER_FORM/MODIFY_USER_FORM_DATA'
const CLEAR_USER_FORM_DATA = 'USER_FORM/CLEAR_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA = 'USER_FORM/SUBMIT_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA_SUCCESS = 'USER_FORM/SUBMIT_USER_FORM_DATA_SUCCESS'
const SUBMIT_USER_FORM_DATA_FAIL = 'USER_FORM/SUBMIT_USER_FORM_DATA_FAIL'

enum TOAST_MESSAGES {
  SUCCESS = 'userFormSuccess',
  FAIL = 'userFormFail'
}

const previewGroups = () => {
  return userSection.groups.map(group => {
    return {
      id: 'preview-' + group.id,
      fields: group.fields
    }
  })
}

const initialState: IUserFormState = {
  userForm: deserializeForm({
    sections: [
      userSection,
      {
        id: UserSection.Preview,
        viewType: 'preview' as const,
        name: messages.userFormReviewTitle,
        title: messages.userFormTitle,
        groups: previewGroups()
      }
    ]
  }),
  userFormData: {},
  submitting: true,
  submissionError: false
}

interface IUpdateUserFormFieldDefsAction {
  type: typeof UPDATE_FORM_FIELD_DEFINITIONS
  payload: {
    data: object
  }
}

export function updateUserFormFieldDefinitions(
  data: object
): IUpdateUserFormFieldDefsAction {
  return {
    type: UPDATE_FORM_FIELD_DEFINITIONS,
    payload: { data }
  }
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

interface IUserFormDataSubmitAction {
  type: typeof SUBMIT_USER_FORM_DATA
  payload: {
    client: ApolloClient<unknown>
    mutation: any
    variables: object
  }
}

export function submitUserFormData(
  client: ApolloClient<unknown>,
  mutation: any,
  variables: object
): IUserFormDataSubmitAction {
  return {
    type: SUBMIT_USER_FORM_DATA,
    payload: {
      client,
      mutation,
      variables
    }
  }
}

export function clearUserFormData(): Action {
  return {
    type: CLEAR_USER_FORM_DATA
  }
}

export function submitSuccess(): Action {
  return {
    type: SUBMIT_USER_FORM_DATA_SUCCESS
  }
}

export function submitFail(): Action {
  return {
    type: SUBMIT_USER_FORM_DATA_FAIL
  }
}

type UserFormAction =
  | IUserFormDataModifyAction
  | IUserFormDataSubmitAction
  | Action

export interface IUserFormState {
  userForm: IForm
  userFormData: IFormSectionData
  submitting: boolean
  submissionError: boolean
}

export const userFormReducer: LoopReducer<IUserFormState, UserFormAction> = (
  state: IUserFormState = initialState,
  action: UserFormAction
): IUserFormState | Loop<IUserFormState, UserFormAction> => {
  switch (action.type) {
    case UPDATE_FORM_FIELD_DEFINITIONS:
      const { data } = (action as IUpdateUserFormFieldDefsAction).payload

      const userSection = state.userForm.sections[0]

      const updatedFields = transformRoleDataToDefinitions(
        state.userForm.sections[0].groups[0].fields,
        data
      )
      const updatedSection: IFormSection = {
        ...userSection,
        groups: [
          {
            ...userSection.groups[0],
            fields: updatedFields
          },
          ...userSection.groups.slice(1)
        ]
      }
      const newState = {
        ...state,
        submitting: false,
        userForm: {
          sections: [updatedSection, ...state.userForm.sections.slice(1)]
        }
      }
      return newState
    case MODIFY_USER_FORM_DATA:
      return {
        ...state,
        userFormData: (action as IUserFormDataModifyAction).payload.data
      }
    case CLEAR_USER_FORM_DATA:
      return initialState
    case SUBMIT_USER_FORM_DATA:
      const {
        client,
        mutation,
        variables
      } = (action as IUserFormDataSubmitAction).payload
      return loop(
        { ...state, submitting: true },
        Cmd.run(
          () =>
            client.mutate({
              mutation,
              variables,
              refetchQueries: [
                { query: SEARCH_USERS, variables: { count: 10, skip: 0 } }
              ]
            }),
          {
            successActionCreator: submitSuccess,
            failActionCreator: submitFail
          }
        )
      )
    case SUBMIT_USER_FORM_DATA_SUCCESS:
      return loop(
        { ...state, submitting: false, submissionError: false },
        Cmd.list([
          Cmd.action(clearUserFormData()),
          Cmd.action(goToHome()),
          Cmd.action(showSubmitFormSuccessToast(TOAST_MESSAGES.SUCCESS))
        ])
      )
    case SUBMIT_USER_FORM_DATA_FAIL:
      return loop(
        { ...state, submitting: false, submissionError: true },
        Cmd.action(showSubmitFormErrorToast(TOAST_MESSAGES.FAIL))
      )
    default:
      return state
  }
}
