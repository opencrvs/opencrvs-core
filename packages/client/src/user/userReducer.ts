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
import { IForm, IFormSectionData } from '@client/forms'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { goToHome } from '@client/navigation'
import {
  showSubmitFormErrorToast,
  showSubmitFormSuccessToast
} from '@client/notification/actions'
import * as offlineActions from '@client/offline/actions'
import { SEARCH_USERS } from '@client/sysadmin/user/queries'
import {
  alterRolesBasedOnUserRole,
  transformRoleDataToDefinitions
} from '@client/views/SysAdmin/utils'
import ApolloClient from 'apollo-client'
import { Action } from 'redux'
import { Cmd, Loop, loop, LoopReducer } from 'redux-loop'

const UPDATE_FORM_FIELD_DEFINITIONS = 'USER_FORM/UPDATE_FORM_FIELD_DEFINITIONS'
const MODIFY_USER_FORM_DATA = 'USER_FORM/MODIFY_USER_FORM_DATA'
const CLEAR_USER_FORM_DATA = 'USER_FORM/CLEAR_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA = 'USER_FORM/SUBMIT_USER_FORM_DATA'
const STORE_USER_FORM_DATA = 'USER_FORM/STORE_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA_SUCCESS = 'USER_FORM/SUBMIT_USER_FORM_DATA_SUCCESS'
const SUBMIT_USER_FORM_DATA_FAIL = 'USER_FORM/SUBMIT_USER_FORM_DATA_FAIL'
const PROCESS_ROLES = 'USER_FORM/PROCESS_ROLES'

export enum TOAST_MESSAGES {
  SUCCESS = 'userFormSuccess',
  UPDATE_SUCCESS = 'userFormUpdateSuccess',
  FAIL = 'userFormFail'
}

const initialState: IUserFormState = {
  userForm: null,
  userFormData: {},
  userDetailsStored: false,
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
    isUpdate: boolean
  }
}

interface IStoreUserFormDataAction {
  type: typeof STORE_USER_FORM_DATA
  payload: {
    formData: IFormSectionData
  }
}

interface ISubmitSuccessAction {
  type: typeof SUBMIT_USER_FORM_DATA_SUCCESS
  payload: {
    isUpdate: boolean
  }
}

export function submitUserFormData(
  client: ApolloClient<unknown>,
  mutation: any,
  variables: object,
  isUpdate: boolean = false
): IUserFormDataSubmitAction {
  return {
    type: SUBMIT_USER_FORM_DATA,
    payload: {
      client,
      mutation,
      variables,
      isUpdate
    }
  }
}

export function clearUserFormData(): Action {
  return {
    type: CLEAR_USER_FORM_DATA
  }
}

export function submitSuccess(isUpdate: boolean = false): ISubmitSuccessAction {
  return {
    type: SUBMIT_USER_FORM_DATA_SUCCESS,
    payload: {
      isUpdate
    }
  }
}

export function submitFail(): Action {
  return {
    type: SUBMIT_USER_FORM_DATA_FAIL
  }
}

export function storeUserFormData(
  formData: IFormSectionData
): IStoreUserFormDataAction {
  return {
    type: STORE_USER_FORM_DATA,
    payload: {
      formData
    }
  }
}

type UserFormAction =
  | IUserFormDataModifyAction
  | IUserFormDataSubmitAction
  | IStoreUserFormDataAction
  | ISubmitSuccessAction
  | Action

export interface IUserFormState {
  userForm: IForm | null
  userFormData: IFormSectionData
  userDetailsStored: boolean
  submitting: boolean
  loadingRoles: boolean
  submissionError: boolean
}

export const userFormReducer: LoopReducer<IUserFormState, UserFormAction> = (
  state: IUserFormState = initialState,
  action: UserFormAction | offlineActions.Action
): IUserFormState | Loop<IUserFormState, UserFormAction> => {
  switch (action.type) {
    case offlineActions.READY:
    case offlineActions.DEFINITIONS_LOADED:
      const {
        userForm
      } = (action as offlineActions.DefinitionsLoadedAction).payload.forms
      const form = deserializeForm(userForm)

      return {
        ...state,
        userForm: {
          ...form
        }
      }
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

      const updatedSections = state.userForm!.sections
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
        userDetailsStored: true,
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
      return {
        ...initialState,
        userForm: state.userForm
      }
    case SUBMIT_USER_FORM_DATA:
      const {
        client,
        mutation,
        variables,
        isUpdate
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
            successActionCreator: () => submitSuccess(isUpdate),
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
          Cmd.action(
            showSubmitFormSuccessToast(
              (action as ISubmitSuccessAction).payload.isUpdate
                ? TOAST_MESSAGES.UPDATE_SUCCESS
                : TOAST_MESSAGES.SUCCESS
            )
          )
        ])
      )
    case SUBMIT_USER_FORM_DATA_FAIL:
      return loop(
        { ...state, submitting: false, submissionError: true },
        Cmd.action(showSubmitFormErrorToast(TOAST_MESSAGES.FAIL))
      )
    case STORE_USER_FORM_DATA:
      const { formData } = (action as IStoreUserFormDataAction).payload
      return loop(
        {
          ...state,
          userFormData: formData
        },
        Cmd.action(processRoles(formData.primaryOfficeId as string))
      )
    default:
      return state
  }
}
