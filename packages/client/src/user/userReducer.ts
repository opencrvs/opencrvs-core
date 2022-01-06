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
import {
  IForm,
  IFormSectionData,
  UserSection,
  IFormSection
} from '@client/forms'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { goToTeamUserList } from '@client/navigation'
import {
  showSubmitFormErrorToast,
  showSubmitFormSuccessToast
} from '@client/notification/actions'
import * as offlineActions from '@client/offline/actions'
import { SEARCH_USERS } from '@client/user/queries'
import {
  alterRolesBasedOnUserRole,
  transformRoleDataToDefinitions
} from '@client/views/SysAdmin/Team/utils'
import ApolloClient, { ApolloQueryResult } from 'apollo-client'
import { Action } from 'redux'
import { Cmd, Loop, loop, LoopReducer } from 'redux-loop'
import {
  GQLQuery,
  GQLUser,
  GQLLocation
} from '@opencrvs/gateway/src/graphql/schema'
import { gqlToDraftTransformer } from '@client/transformer'
import { userAuditForm, IUserAuditForm } from '@client/user/user-audit'

const UPDATE_FORM_FIELD_DEFINITIONS = 'USER_FORM/UPDATE_FORM_FIELD_DEFINITIONS'
const MODIFY_USER_FORM_DATA = 'USER_FORM/MODIFY_USER_FORM_DATA'
const CLEAR_USER_FORM_DATA = 'USER_FORM/CLEAR_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA = 'USER_FORM/SUBMIT_USER_FORM_DATA'
const STORE_USER_FORM_DATA = 'USER_FORM/STORE_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA_SUCCESS = 'USER_FORM/SUBMIT_USER_FORM_DATA_SUCCESS'
const SUBMIT_USER_FORM_DATA_FAIL = 'USER_FORM/SUBMIT_USER_FORM_DATA_FAIL'
const PROCESS_ROLES = 'USER_FORM/PROCESS_ROLES'
const FETCH_USER_DATA = 'USER_FORM/FETCH_USER_DATA'
const UPDATE_DEFINITIONS_AND_FORM_DATA =
  'USER_FORM/UPDATE_DEFINTIONS_AND_FORM_DATA'

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
  submissionError: false,
  userAuditForm
}

interface IUpdateUserFormFieldDefsAction {
  type: typeof UPDATE_FORM_FIELD_DEFINITIONS
  payload: {
    data: object
    queryData?: ApolloQueryResult<GQLQuery>
  }
}

export function updateUserFormFieldDefinitions(
  data: object,
  queryData?: ApolloQueryResult<GQLQuery>
): IUpdateUserFormFieldDefsAction {
  return {
    type: UPDATE_FORM_FIELD_DEFINITIONS,
    payload: { data, queryData }
  }
}

interface IProcessRoles {
  type: typeof PROCESS_ROLES
  payload: {
    primaryOfficeId: string
    queryData?: ApolloQueryResult<GQLQuery>
  }
}

export function processRoles(
  primaryOfficeId: string,
  queryData?: ApolloQueryResult<GQLQuery>
): IProcessRoles {
  return {
    type: PROCESS_ROLES,
    payload: { primaryOfficeId, queryData }
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
    officeLocationId: string
  }
}

interface IStoreUserFormDataAction {
  type: typeof STORE_USER_FORM_DATA
  payload: {
    queryData: ApolloQueryResult<GQLQuery>
  }
}

interface ISubmitSuccessAction {
  type: typeof SUBMIT_USER_FORM_DATA_SUCCESS
  payload: {
    locationId: string
    isUpdate: boolean
  }
}

export function submitUserFormData(
  client: ApolloClient<unknown>,
  mutation: any,
  variables: object,
  officeLocationId: string,
  isUpdate: boolean = false
): IUserFormDataSubmitAction {
  return {
    type: SUBMIT_USER_FORM_DATA,
    payload: {
      client,
      mutation,
      variables,
      officeLocationId,
      isUpdate
    }
  }
}

export function clearUserFormData(): Action {
  return {
    type: CLEAR_USER_FORM_DATA
  }
}

export function submitSuccess(
  locationId: string,
  isUpdate: boolean = false
): ISubmitSuccessAction {
  return {
    type: SUBMIT_USER_FORM_DATA_SUCCESS,
    payload: {
      locationId,
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
  queryData: ApolloQueryResult<GQLQuery>
): IStoreUserFormDataAction {
  return {
    type: STORE_USER_FORM_DATA,
    payload: {
      queryData
    }
  }
}

interface IFetchAndStoreUserData {
  type: typeof FETCH_USER_DATA
  payload: {
    client: ApolloClient<unknown>
    query: any
    variables: { userId: string }
  }
}

export function fetchAndStoreUserData(
  client: ApolloClient<unknown>,
  query: any,
  variables: { userId: string }
): IFetchAndStoreUserData {
  return {
    type: FETCH_USER_DATA,
    payload: {
      client,
      query,
      variables
    }
  }
}

interface IUpdateFormAndFormData {
  type: typeof UPDATE_DEFINITIONS_AND_FORM_DATA
  payload: {
    queryData: ApolloQueryResult<GQLQuery>
  }
}

function updateFormAndFormData(
  queryData: ApolloQueryResult<GQLQuery>
): IUpdateFormAndFormData {
  return {
    type: UPDATE_DEFINITIONS_AND_FORM_DATA,
    payload: {
      queryData
    }
  }
}
type UserFormAction =
  | IUserFormDataModifyAction
  | IUserFormDataSubmitAction
  | IStoreUserFormDataAction
  | ISubmitSuccessAction
  | IProcessRoles
  | IFetchAndStoreUserData
  | IUpdateFormAndFormData
  | Action

export interface IUserFormState {
  userForm: IForm | null
  userFormData: IFormSectionData
  userDetailsStored: boolean
  submitting: boolean
  loadingRoles: boolean
  submissionError: boolean
  userAuditForm: IUserAuditForm
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
      const {
        primaryOfficeId,
        queryData: fetchUserQueryData
      } = (action as IProcessRoles).payload
      return loop(
        {
          ...state,
          loadingRoles: true
        },
        Cmd.run(alterRolesBasedOnUserRole, {
          successActionCreator: data =>
            updateUserFormFieldDefinitions(data, fetchUserQueryData),
          args: [primaryOfficeId]
        })
      )
    case UPDATE_FORM_FIELD_DEFINITIONS:
      const {
        data,
        queryData: userQueryData
      } = (action as IUpdateUserFormFieldDefsAction).payload
      const updatedSections = state.userForm!.sections
      if (
        userQueryData &&
        userQueryData.data.getUser &&
        userQueryData.data.getUser.role &&
        userQueryData.data.getUser.type
      ) {
        const {
          role: existingRole,
          type: existingType
        } = userQueryData.data.getUser
        const roleData = (data as Array<{
          value: string
          types: string[]
        }>).find(({ value }: { value: string }) => value === existingRole)

        if (roleData && !roleData.types.includes(existingType)) {
          ;(data as Array<{
            value: string
            types: string[]
          }>).map(role => {
            if (role.value === existingRole) {
              return {
                ...role,
                types: [existingRole, ...role.types]
              }
            } else {
              return role
            }
          })
        } else if (!roleData) {
          ;(data as Array<{
            value: string
            types: string[]
          }>).push({ value: existingRole, types: [existingType] })
        }
      }
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

      if (userQueryData) {
        return loop(newState, Cmd.action(storeUserFormData(userQueryData)))
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
        officeLocationId,
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
            successActionCreator: () =>
              submitSuccess(officeLocationId, isUpdate),
            failActionCreator: submitFail
          }
        )
      )
    case SUBMIT_USER_FORM_DATA_SUCCESS:
      return loop(
        { ...state, submitting: false, submissionError: false },
        Cmd.list([
          Cmd.action(clearUserFormData()),
          Cmd.action(
            goToTeamUserList({
              id: (action as ISubmitSuccessAction).payload.locationId,
              searchableText: '',
              displayLabel: ''
            })
          ),
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
      const { queryData } = (action as IStoreUserFormDataAction).payload
      const formData = gqlToDraftTransformer(
        { sections: (state.userForm as IForm).sections as IFormSection[] },
        { [UserSection.User]: queryData.data.getUser }
      )

      return {
        ...state,
        userFormData: formData.user,
        userDetailsStored: true
      }
    case FETCH_USER_DATA:
      const {
        client: userClient,
        query: getUserQuery,
        variables: { userId }
      } = (action as IFetchAndStoreUserData).payload
      return loop(
        state,
        Cmd.run(
          () =>
            userClient.query({
              query: getUserQuery,
              variables: { userId },
              fetchPolicy: 'no-cache'
            }),
          {
            successActionCreator: updateFormAndFormData,
            failActionCreator: () =>
              showSubmitFormErrorToast(TOAST_MESSAGES.FAIL)
          }
        )
      )
    case UPDATE_DEFINITIONS_AND_FORM_DATA:
      const {
        queryData: getUserQueryData
      } = (action as IUpdateFormAndFormData).payload
      const { primaryOffice } = getUserQueryData.data.getUser as GQLUser
      return loop(
        state,
        Cmd.action(
          processRoles((primaryOffice as GQLLocation).id, getUserQueryData)
        )
      )
    default:
      return state
  }
}
