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
import { ApolloClient, ApolloError } from '@apollo/client'
import {
  IForm,
  IFormField,
  IFormSectionData,
  UserSection,
  modifyFormField
} from '@client/forms'
import { deserializeForm } from '@client/forms/deserializer/deserializer'
import { getCreateUserForm } from '@client/forms/user/fieldDefinitions/createUser'
import { validators } from '@client/forms/validators'
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
import { gqlToDraftTransformer } from '@client/transformer'
import { IUserAuditForm, userAuditForm } from '@client/user/user-audit'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import { UserRole } from '@client/utils/gateway'
import { SEARCH_USERS } from '@client/user/queries'
import { trpcClient } from '@client/v2-events/trpc'
import { User } from '@opencrvs/commons/client'

import { Action } from 'redux'
import { ActionCmd, Cmd, Loop, LoopReducer, RunCmd, loop } from 'redux-loop'

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
  userRoles: [],
  submissionError: false,
  userAuditForm
}

export interface IRoleMessagesLoadedAction {
  type: typeof ROLE_MESSAGES_LOADED
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
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    mutation: any
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    variables: { [key: string]: any }
    isUpdate: boolean
    officeLocationId: string
    onSuccess: () => void
  }
}

export function submitUserFormData(
  client: ApolloClient<unknown>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  mutation: any,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  variables: { [key: string]: any },
  officeLocationId: string,
  isUpdate = false,
  onSuccess: () => void
): IUserFormDataSubmitAction {
  return {
    type: SUBMIT_USER_FORM_DATA,
    payload: {
      client,
      mutation,
      variables,
      officeLocationId,
      isUpdate,
      onSuccess
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
    isUpdate: boolean
    onSuccess: () => void
  }
}

function submitSuccess(
  isUpdate: boolean,
  onSuccess: () => void
): ISubmitSuccessAction {
  return {
    type: SUBMIT_USER_FORM_DATA_SUCCESS,
    payload: {
      isUpdate,
      onSuccess
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

interface IFetchAndStoreUserData {
  type: typeof FETCH_USER_DATA
  payload: {
    variables: { userId: string }
  }
}

export function fetchAndStoreUserData(
  variables: { userId: string }
): IFetchAndStoreUserData {
  return {
    type: FETCH_USER_DATA,
    payload: {
      variables
    }
  }
}

interface IStoreUserFormDataAction {
  type: typeof STORE_USER_FORM_DATA
  payload: {
    user: User
  }
}

function storeUserFormData(
  user: User
): IStoreUserFormDataAction {
  return {
    type: STORE_USER_FORM_DATA,
    payload: {
      user
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
  | IFetchAndStoreUserData
  | IStoreUserFormDataAction
  | IRoleMessagesLoadedAction
  | ReturnType<typeof clearUserFormData>
  | ReturnType<typeof showSubmitFormSuccessToast>
  | ReturnType<typeof showSubmitFormErrorToast>

interface UserRolesMap {
  [key: string]: string
}

export interface IUserFormState {
  userForm: IForm
  userFormData: IFormSectionData
  userDetailsStored: boolean
  submitting: boolean
  submissionError: boolean
  userRoles: UserRole[]
  userAuditForm: IUserAuditForm
}

export const userFormReducer: LoopReducer<IUserFormState, UserFormAction> = (
  state: IUserFormState = initialState,
  action: UserFormAction | offlineActions.Action
): IUserFormState | Loop<IUserFormState, UserFormAction> => {
  switch (action.type) {
    case offlineActions.READY:
      return {
        ...state,
        userAuditForm
      }

    case MODIFY_USER_FORM_DATA: {
      const formData = action.payload.data
      return {
        ...state,
        userFormData: formData
      }
    }

    case CLEAR_USER_FORM_DATA:
      return {
        ...initialState,
        userForm: state.userForm,
        userRoles: state.userRoles
      }

    case SUBMIT_USER_FORM_DATA:
      const { client, mutation, variables, isUpdate } = action.payload
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
              submitSuccess(isUpdate, action.payload.onSuccess),
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
        | ReturnType<typeof showSubmitFormSuccessToast>
      >([
        Cmd.action(
          showSubmitFormSuccessToast(
            action.payload.isUpdate
              ? TOAST_MESSAGES.UPDATE_SUCCESS
              : TOAST_MESSAGES.SUCCESS
          )
        ),
        Cmd.run(action.payload.onSuccess),
        Cmd.action(clearUserFormData())
      ])

      return loop({ ...state, submitting: false, submissionError: false }, list)

    case SUBMIT_USER_FORM_DATA_FAIL:
      const { errorData } = action.payload
      const duplicateErrorFromGQL = errorData?.graphQLErrors?.find(
        (gqlErr) =>
          gqlErr.extensions.invalidArgs?.duplicateNotificationMethodError
      )

      if (duplicateErrorFromGQL) {
        const duplicateError =
          duplicateErrorFromGQL.extensions.invalidArgs
            .duplicateNotificationMethodError

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

    case FETCH_USER_DATA:
      const {
        variables: { userId }
      } = (action as IFetchAndStoreUserData).payload
      return loop(
        state,
        Cmd.run(
          () => trpcClient.user.get.query(userId),
          {
            successActionCreator: (result) => storeUserFormData(result as User),
            failActionCreator: () =>
              showSubmitFormErrorToast(TOAST_MESSAGES.FAIL)
          }
        )
      )

    case STORE_USER_FORM_DATA:
      const { user } = action.payload
      const gqlCompatibleUser = {
        ...user,
        name: user.name.map((n) => ({
          use: n.use,
          firstNames: n.given.join(' '),
          familyName: n.family
        })),
        primaryOffice: { id: user.primaryOfficeId }
      }
      const formData = gqlToDraftTransformer(
        { sections: state.userForm.sections },
        {
          [UserSection.User]: gqlCompatibleUser
        }
      )

      return {
        ...state,
        userFormData: formData.user,
        userDetailsStored: true
      }

    default:
      return state
  }
}
