/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import {
  IFormSectionData,
  IForm,
  IFormSection,
  UserSection
} from '@client/forms'
import { Action } from 'redux'
import { formMessages as messages } from '@client/i18n/messages'
import ApolloClient from 'apollo-client'
import { goToHome } from '@client/navigation'
import {
  transformRoleDataToDefinitions,
  alterRolesBasedOnUserRole
} from '@client/views/SysAdmin/utils'
import {
  showSubmitFormSuccessToast,
  showSubmitFormErrorToast
} from '@client/notification/actions'
import { SEARCH_USERS } from '@client/sysadmin/user/queries'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { userSection } from '@client/forms/user/fieldDefinitions/user-section'

const UPDATE_FORM_FIELD_DEFINITIONS = 'USER_FORM/UPDATE_FORM_FIELD_DEFINITIONS'
const MODIFY_USER_FORM_DATA = 'USER_FORM/MODIFY_USER_FORM_DATA'
const CLEAR_USER_FORM_DATA = 'USER_FORM/CLEAR_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA = 'USER_FORM/SUBMIT_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA_SUCCESS = 'USER_FORM/SUBMIT_USER_FORM_DATA_SUCCESS'
const SUBMIT_USER_FORM_DATA_FAIL = 'USER_FORM/SUBMIT_USER_FORM_DATA_FAIL'
const PROCESS_ROLES = 'USER_FORM/PROCESS_ROLES'

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
  submitting: false,
  loadingRoles: false,
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

interface IProcessRoles {
  type: typeof PROCESS_ROLES
  payload: {
    primaryOfficeId: string
  }
}

export function processRoles(primaryOfficeId: string): IProcessRoles {
  return {
    type: PROCESS_ROLES,
    payload: { primaryOfficeId }
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
  loadingRoles: boolean
  submissionError: boolean
}

export const userFormReducer: LoopReducer<IUserFormState, UserFormAction> = (
  state: IUserFormState = initialState,
  action: UserFormAction
): IUserFormState | Loop<IUserFormState, UserFormAction> => {
  switch (action.type) {
    case PROCESS_ROLES:
      const { primaryOfficeId } = (action as IProcessRoles).payload
      return loop(
        {
          ...state,
          loadingRoles: true
        },
        Cmd.run(alterRolesBasedOnUserRole, {
          successActionCreator: updateUserFormFieldDefinitions,
          args: [primaryOfficeId]
        })
      )
    case UPDATE_FORM_FIELD_DEFINITIONS:
      const { data } = (action as IUpdateUserFormFieldDefsAction).payload

      const updatedSections = state.userForm.sections
      updatedSections.forEach(section => {
        section.groups.forEach(group => {
          group.fields = transformRoleDataToDefinitions(
            group.fields,
            data,
            state.userFormData
          )
        })
      })
      const newState = {
        ...state,
        loadingRoles: false,
        submitting: false,
        userForm: {
          sections: updatedSections
        }
      }
      return newState
    case MODIFY_USER_FORM_DATA:
      let submitting = state.submitting
      if (state.loadingRoles) {
        submitting = true
      }
      return {
        ...state,
        submitting,
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
