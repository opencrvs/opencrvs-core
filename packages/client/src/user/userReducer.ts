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
  ShowCreateUserErrorToast,
  showCreateUserErrorToast,
  showSubmitFormErrorToast,
  showSubmitFormSuccessToast
} from '@client/notification/actions'
import * as offlineActions from '@client/offline/actions'
import * as profileActions from '@client/profile/profileActions'
import { SEARCH_USERS } from '@client/user/queries'
import {
  alterRolesBasedOnUserRole,
  transformRoleDataToDefinitions
} from '@client/views/SysAdmin/Team/utils'
import ApolloClient, { ApolloError, ApolloQueryResult } from 'apollo-client'
import { Action } from 'redux'
import {
  ActionCmd,
  Cmd,
  CmdType,
  Loop,
  loop,
  LoopReducer,
  RunCmd
} from 'redux-loop'
import {
  GQLQuery,
  GQLUser,
  GQLLocation,
  GQLRole
} from '@opencrvs/gateway/src/graphql/schema'
import { gqlToDraftTransformer } from '@client/transformer'
import { userAuditForm, IUserAuditForm } from '@client/user/user-audit'
import { createUserForm } from '@client/forms/user/fieldDefinitions/createUser'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import { modifyUserDetails } from '@client/profile/profileActions'
import { IUserDetails } from '@client/utils/userUtils'

const UPDATE_FORM_FIELD_DEFINITIONS = 'USER_FORM/UPDATE_FORM_FIELD_DEFINITIONS'
const MODIFY_USER_FORM_DATA = 'USER_FORM/MODIFY_USER_FORM_DATA'
const CLEAR_USER_FORM_DATA = 'USER_FORM/CLEAR_USER_FORM_DATA' as const
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
    data: GQLRole[]
    queryData?: ApolloQueryResult<GQLQuery>
  }
}

export function updateUserFormFieldDefinitions(
  data: GQLRole[],
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
    variables: { [key: string]: any }
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
interface ISubmitFailedAction {
  type: typeof SUBMIT_USER_FORM_DATA_FAIL
  payload: {
    errorData: ApolloError
  }
}

export function submitUserFormData(
  client: ApolloClient<unknown>,
  mutation: any,
  variables: { [key: string]: any },
  officeLocationId: string,
  isUpdate = false
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

export function clearUserFormData() {
  return {
    type: CLEAR_USER_FORM_DATA
  }
}

export function submitSuccess(
  locationId: string,
  isUpdate = false
): ISubmitSuccessAction {
  return {
    type: SUBMIT_USER_FORM_DATA_SUCCESS,
    payload: {
      locationId,
      isUpdate
    }
  }
}

export function submitFail(errorData: ApolloError): ISubmitFailedAction {
  return {
    type: SUBMIT_USER_FORM_DATA_FAIL,
    payload: {
      errorData
    }
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
  | IUpdateUserFormFieldDefsAction
  | IUserFormDataModifyAction
  | IUserFormDataSubmitAction
  | IStoreUserFormDataAction
  | ISubmitSuccessAction
  | ISubmitFailedAction
  | IProcessRoles
  | IFetchAndStoreUserData
  | IUpdateFormAndFormData
  | profileActions.Action
  | ShowCreateUserErrorToast
  | ReturnType<typeof clearUserFormData>
  | ReturnType<typeof showSubmitFormSuccessToast>
  | ReturnType<typeof showSubmitFormErrorToast>

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
      const form = deserializeForm(createUserForm)

      return {
        ...state,
        userForm: {
          ...form
        }
      }
    case PROCESS_ROLES:
      const { primaryOfficeId, queryData: fetchUserQueryData } = (
        action as IProcessRoles
      ).payload
      return loop(
        {
          ...state,
          loadingRoles: true
        },
        Cmd.run(alterRolesBasedOnUserRole, {
          successActionCreator: (data: GQLRole[]) =>
            updateUserFormFieldDefinitions(data, fetchUserQueryData),
          args: [primaryOfficeId, Cmd.getState]
        })
      )
    case UPDATE_FORM_FIELD_DEFINITIONS:
      const { data, queryData: userQueryData } = (
        action as IUpdateUserFormFieldDefsAction
      ).payload
      const updatedSections = state.userForm!.sections
      if (
        userQueryData &&
        userQueryData.data.getUser &&
        userQueryData.data.getUser.role &&
        userQueryData.data.getUser.type
      ) {
        // This logic combined with the function alterRolesBasedOnUserRole
        // controls only showing unique user types in the case where 1 mayor should exist per location
        // this functionality may be reintroduced in the future.
        // for now types should only exist for field agents as per this requirement:
        //
        const { role: existingRole, type: existingType } =
          userQueryData.data.getUser
        const roleData = (
          data as Array<{
            value: string
            types: string[]
          }>
        ).find(({ value }: { value: string }) => value === existingRole)

        if (roleData && !roleData.types.includes(existingType)) {
          ;(
            data as Array<{
              value: string
              types: string[]
            }>
          ).map((role) => {
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
          ;(
            data as Array<{
              value: string
              types: string[]
            }>
          ).push({ value: existingRole, types: [existingType] })
        }
      }
      updatedSections.forEach((section) => {
        section.groups.forEach((group) => {
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
      const { client, mutation, variables, officeLocationId, isUpdate } = (
        action as IUserFormDataSubmitAction
      ).payload
      const token = getToken()
      const tokenPayload = getTokenPayload(token)
      const userDetails = variables.user
      const isSelfUpdate = userDetails.id === tokenPayload?.sub ? true : false
      const commandList: (RunCmd<Action> | ActionCmd<Action>)[] = [
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
      ]
      if (isSelfUpdate) {
        commandList.push(
          Cmd.action(modifyUserDetails({ mobile: userDetails.mobile }))
        )
      }
      return loop(
        { ...state, submitting: true },
        Cmd.list<UserFormAction>(commandList)
      )
    case SUBMIT_USER_FORM_DATA_SUCCESS:
      const list = Cmd.list<
        | ReturnType<typeof clearUserFormData>
        | ReturnType<typeof goToTeamUserList>
        | ReturnType<typeof showSubmitFormSuccessToast>
      >([
        Cmd.action(clearUserFormData()),
        Cmd.action(goToTeamUserList(action.payload.locationId)),
        Cmd.action(
          showSubmitFormSuccessToast(
            action.payload.isUpdate
              ? TOAST_MESSAGES.UPDATE_SUCCESS
              : TOAST_MESSAGES.SUCCESS
          )
        )
      ])
      return loop({ ...state, submitting: false, submissionError: false }, list)

    case SUBMIT_USER_FORM_DATA_FAIL:
      const { errorData } = (action as ISubmitFailedAction).payload
      if (errorData.message.includes('DUPLICATE_MOBILE')) {
        const mobile = errorData.message.split('-')[1]
        return loop(
          { ...state, submitting: false, submissionError: false },
          Cmd.action(showCreateUserErrorToast(TOAST_MESSAGES.FAIL, mobile))
        )
      } else {
        return loop(
          { ...state, submitting: false, submissionError: true },
          Cmd.action(showSubmitFormErrorToast(TOAST_MESSAGES.FAIL))
        )
      }
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
      const { queryData: getUserQueryData } = (action as IUpdateFormAndFormData)
        .payload
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
