/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  IForm,
  IFormSection,
  IFormSectionData,
  ISelectFormFieldWithOptions,
  ISelectOption,
  UserSection
} from '@client/forms'
import { AnyFn, deserializeForm } from '@client/forms/deserializer/deserializer'
import { goToTeamUserList } from '@client/navigation'
import {
  ShowCreateUserDuplicateEmailErrorToast,
  ShowCreateUserErrorToast,
  showCreateUserDuplicateEmailErrorToast,
  showCreateUserErrorToast,
  showSubmitFormErrorToast,
  showSubmitFormSuccessToast
} from '@client/notification/actions'
import * as offlineActions from '@client/offline/actions'
import * as profileActions from '@client/profile/profileActions'
import { modifyUserDetails } from '@client/profile/profileActions'
import { SEARCH_USERS } from '@client/user/queries'
import { ApolloClient, ApolloError, ApolloQueryResult } from '@apollo/client'
import { Action } from 'redux'
import { ActionCmd, Cmd, Loop, loop, LoopReducer, RunCmd } from 'redux-loop'
import { IUserAuditForm, userAuditForm } from '@client/user/user-audit'
import { getCreateUserForm } from '@client/forms/user/fieldDefinitions/createUser'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import { roleQueries } from '@client/forms/user/query/queries'
import { Role, SystemRole } from '@client/utils/gateway'
import type { GQLQuery } from '@client/utils/gateway-deprecated-do-not-use'
import { gqlToDraftTransformer } from '@client/transformer'
import { getUserRoleIntlKey } from '@client/views/SysAdmin/Team/utils'
import { validators, Validator } from '@client/forms/validators'

export const ROLES_LOADED = 'USER_FORM/ROLES_LOADED'
const MODIFY_USER_FORM_DATA = 'USER_FORM/MODIFY_USER_FORM_DATA'
const CLEAR_USER_FORM_DATA = 'USER_FORM/CLEAR_USER_FORM_DATA' as const
const SUBMIT_USER_FORM_DATA = 'USER_FORM/SUBMIT_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA_SUCCESS = 'USER_FORM/SUBMIT_USER_FORM_DATA_SUCCESS'
const SUBMIT_USER_FORM_DATA_FAIL = 'USER_FORM/SUBMIT_USER_FORM_DATA_FAIL'
const ROLE_MESSAGES_LOADED = 'USER_FORM/ROLE_MESSAGES_LOADED'
const STORE_USER_FORM_DATA = 'USER_FORM/STORE_USER_FORM_DATA'
const FETCH_USER_DATA = 'USER_FORM/FETCH_USER_DATA'

export enum TOAST_MESSAGES {
  SUCCESS = 'userFormSuccess',
  UPDATE_SUCCESS = 'userFormUpdateSuccess',
  FAIL = 'userFormFail'
}

const initialState: IUserFormState = {
  userForm: deserializeForm(getCreateUserForm(), validators),
  userFormData: {},
  userDetailsStored: false,
  submitting: false,
  loadingRoles: false,
  submissionError: false,
  userAuditForm,
  systemRoleMap: {}
}

export interface IRoleMessagesLoadedAction {
  type: typeof ROLE_MESSAGES_LOADED
}

export function rolesMessageAddData(): IRoleMessagesLoadedAction {
  return {
    type: ROLE_MESSAGES_LOADED
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

interface ISubmitSuccessAction {
  type: typeof SUBMIT_USER_FORM_DATA_SUCCESS
  payload: {
    locationId: string
    isUpdate: boolean
  }
}

function submitSuccess(
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

interface ISubmitFailedAction {
  type: typeof SUBMIT_USER_FORM_DATA_FAIL
  payload: {
    errorData: ApolloError
  }
}

function submitFail(errorData: ApolloError): ISubmitFailedAction {
  return {
    type: SUBMIT_USER_FORM_DATA_FAIL,
    payload: {
      errorData
    }
  }
}

export interface IRoleLoadedAction {
  type: typeof ROLES_LOADED
  payload: {
    systemRoles: SystemRole[]
  }
}

export function rolesLoaded(systemRoles: SystemRole[]): IRoleLoadedAction {
  return {
    type: ROLES_LOADED,
    payload: {
      systemRoles
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

interface IStoreUserFormDataAction {
  type: typeof STORE_USER_FORM_DATA
  payload: {
    queryData: ApolloQueryResult<GQLQuery>
  }
}

function storeUserFormData(
  queryData: ApolloQueryResult<GQLQuery>
): IStoreUserFormDataAction {
  return {
    type: STORE_USER_FORM_DATA,
    payload: {
      queryData
    }
  }
}

type UserFormAction =
  | IUserFormDataModifyAction
  | IUserFormDataSubmitAction
  | ISubmitSuccessAction
  | ISubmitFailedAction
  | profileActions.Action
  | ShowCreateUserErrorToast
  | ShowCreateUserDuplicateEmailErrorToast
  | IRoleLoadedAction
  | IFetchAndStoreUserData
  | IStoreUserFormDataAction
  | IRoleMessagesLoadedAction
  | ReturnType<typeof clearUserFormData>
  | ReturnType<typeof showSubmitFormSuccessToast>
  | ReturnType<typeof showSubmitFormErrorToast>

export interface ISystemRolesMap {
  [key: string]: string
}
export interface IUserFormState {
  userForm: IForm
  userFormData: IFormSectionData
  userDetailsStored: boolean
  submitting: boolean
  loadingRoles: boolean
  submissionError: boolean
  userAuditForm: IUserAuditForm
  systemRoleMap: ISystemRolesMap
}

const fetchRoles = async () => {
  const roles = await roleQueries.fetchRoles()
  return roles.data.getSystemRoles
}

const getRoleWiseSystemRoles = (systemRoles: SystemRole[]) => {
  const roleMap: ISystemRolesMap = {}
  systemRoles.forEach((systemRole: SystemRole) => {
    systemRole.roles.forEach((role: Role) => {
      roleMap[role._id] = systemRole.value
    })
  })

  return roleMap
}

const generateIntlObject = (
  systemRole: SystemRole,
  role: Role
): ISelectOption => {
  return {
    value: role._id,
    label: {
      id: getUserRoleIntlKey(role._id),
      description: '',
      defaultMessage: role.labels[0].label
    }
  }
}

const optionsGenerator = (systemRoles: SystemRole[]) => {
  const typeList: ISelectOption[] = []
  systemRoles.forEach((systemRole: SystemRole) => {
    systemRole.roles.forEach((role: Role) => {
      typeList.push(generateIntlObject(systemRole, role))
    })
  })

  return typeList
}

const generateUserFormWithRoles = (
  form: IForm,
  mutateOptions: ISelectOption[]
) => {
  const section = form.sections.find((section) => section.id === 'user')!
  const group = section.groups.find((group) => group.id === 'user-view-group')!
  const field = group.fields.find(
    (field) => field.name === 'role'
  ) as ISelectFormFieldWithOptions

  field.options = mutateOptions
}

export const userFormReducer: LoopReducer<IUserFormState, UserFormAction> = (
  state: IUserFormState = initialState,
  action: UserFormAction | offlineActions.Action
): IUserFormState | Loop<IUserFormState, UserFormAction> => {
  switch (action.type) {
    case offlineActions.READY:
      return loop(
        {
          ...state,
          userAuditForm,
          loadingRoles: true
        },
        Cmd.run(fetchRoles, {
          successActionCreator: rolesLoaded
        })
      )

    case MODIFY_USER_FORM_DATA:
      return {
        ...state,
        userFormData: (action as IUserFormDataModifyAction).payload.data
      }

    case CLEAR_USER_FORM_DATA:
      return {
        ...initialState,
        userForm: state.userForm,
        systemRoleMap: state.systemRoleMap
      }

    case SUBMIT_USER_FORM_DATA:
      const { client, mutation, variables, officeLocationId, isUpdate } = (
        action as IUserFormDataSubmitAction
      ).payload
      const token = getToken()
      const tokenPayload = getTokenPayload(token)
      const userDetails = variables.user
      const isSelfUpdate = userDetails.id === tokenPayload?.sub
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
      const duplicateErrorFromGQL = errorData?.graphQLErrors?.find(
        (gqlErr) => gqlErr.extensions.duplicateNotificationMethodError
      )

      if (duplicateErrorFromGQL) {
        const duplicateError =
          duplicateErrorFromGQL.extensions.duplicateNotificationMethodError

        if (duplicateError.field && duplicateError.field === 'email') {
          return loop(
            { ...state, submitting: false, submissionError: false },
            Cmd.action(
              showCreateUserDuplicateEmailErrorToast(
                TOAST_MESSAGES.FAIL,
                duplicateError.conflictingValue
              )
            )
          )
        } else if (duplicateError.field && duplicateError.field === 'mobile') {
          return loop(
            { ...state, submitting: false, submissionError: false },
            Cmd.action(
              showCreateUserErrorToast(
                TOAST_MESSAGES.FAIL,
                duplicateError.conflictingValue
              )
            )
          )
        }
      }
      return loop(
        { ...state, submitting: false, submissionError: true },
        Cmd.action(showSubmitFormErrorToast(TOAST_MESSAGES.FAIL))
      )

    case ROLES_LOADED:
      const { systemRoles } = action.payload
      const getSystemRoleMap = getRoleWiseSystemRoles(systemRoles)
      const form = deserializeForm(getCreateUserForm(), validators)
      const mutateOptions = optionsGenerator(systemRoles)

      generateUserFormWithRoles(form, mutateOptions)
      return {
        ...state,
        userForm: {
          ...form
        },
        systemRoleMap: getSystemRoleMap
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
            successActionCreator: storeUserFormData,
            failActionCreator: () =>
              showSubmitFormErrorToast(TOAST_MESSAGES.FAIL)
          }
        )
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
    case ROLE_MESSAGES_LOADED:
      return {
        ...state,
        loadingRoles: false
      }
    default:
      return state
  }
}
