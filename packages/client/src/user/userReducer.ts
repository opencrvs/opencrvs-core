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
  ISelectFormFieldWithDynamicOptions,
  ISelectOption
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
import { modifyUserDetails } from '@client/profile/profileActions'
import { SEARCH_USERS } from '@client/user/queries'
import { ApolloClient, ApolloError } from '@apollo/client'
import { Action } from 'redux'
import { ActionCmd, Cmd, Loop, loop, LoopReducer, RunCmd } from 'redux-loop'
import { IUserAuditForm, userAuditForm } from '@client/user/user-audit'
import { createUserForm } from '@client/forms/user/fieldDefinitions/createUser'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import { roleQueries } from '@client/forms/user/query/queries'
import { Role, SystemRole } from '@client/utils/gateway'

const ROLES_LOADED = 'USER_FORM/ROLES_LOADED'
const MODIFY_USER_FORM_DATA = 'USER_FORM/MODIFY_USER_FORM_DATA'
const CLEAR_USER_FORM_DATA = 'USER_FORM/CLEAR_USER_FORM_DATA' as const
const SUBMIT_USER_FORM_DATA = 'USER_FORM/SUBMIT_USER_FORM_DATA'
const SUBMIT_USER_FORM_DATA_SUCCESS = 'USER_FORM/SUBMIT_USER_FORM_DATA_SUCCESS'
const SUBMIT_USER_FORM_DATA_FAIL = 'USER_FORM/SUBMIT_USER_FORM_DATA_FAIL'

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

interface ISubmitFailedAction {
  type: typeof SUBMIT_USER_FORM_DATA_FAIL
  payload: {
    errorData: ApolloError
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

interface IUpdateSystemRoleLoadedAction {
  type: typeof ROLES_LOADED
  payload: {
    systemRoles: SystemRole[]
  }
}

function rolesLoaded(systemRoles: SystemRole[]): IUpdateSystemRoleLoadedAction {
  return {
    type: ROLES_LOADED,
    payload: {
      systemRoles
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
  | IUpdateSystemRoleLoadedAction
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

const fetchRoles = async () => {
  const roles = await roleQueries.fetchRoles()
  return roles.data.getSystemRoles
}

const optionsGenerator = (systemRoles: SystemRole[]) => {
  const options: { [key: string]: ISelectOption[] } = {}
  systemRoles.forEach((systemRole: SystemRole) => {
    const generateRolesBySystemRole: ISelectOption[] = []

    systemRole.roles.forEach((role: Role) => {
      generateRolesBySystemRole.push({
        value: role.value,
        label: {
          id: `${systemRole.value}.role.${role.value}`,
          description: '',
          defaultMessage: role.labels[0].label
        }
      })
    })
    options[systemRole.value] = generateRolesBySystemRole
  })

  return options
}

const generateUserFormWithRoles = (
  form: IForm,
  mutateOptions: { [key: string]: ISelectOption[] }
) => {
  const section = form.sections.find((section) => section.id === 'user')!
  const group = section.groups.find((group) => group.id === 'user-view-group')!
  const field = group.fields.find(
    (field) => field.name === 'role'
  ) as ISelectFormFieldWithDynamicOptions

  field.dynamicOptions.options = mutateOptions
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
          loadingRoles: true
        },
        Cmd.run(fetchRoles, {
          successActionCreator: rolesLoaded
        })
      )

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

    case ROLES_LOADED:
      const { systemRoles } = action.payload
      const form = deserializeForm(createUserForm)
      const mutateOptions = optionsGenerator(systemRoles)
      generateUserFormWithRoles(form, mutateOptions)
      return {
        ...state,
        userForm: {
          ...form
        }
      }

    default:
      return state
  }
}
