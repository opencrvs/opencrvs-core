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
import { IFormSectionData } from '@client/forms'
import {
  showSubmitFormErrorToast,
  showSubmitFormSuccessToast
} from '@client/notification/actions'
import * as offlineActions from '@client/offline/actions'
import * as profileActions from '@client/profile/profileActions'
import { IUserAuditForm, userAuditForm } from '@client/user/user-audit'
import { UserRole } from '@client/utils/gateway'
import { trpcClient } from '@client/v2-events/trpc'
import { User } from '@opencrvs/commons/client'

import { Cmd, Loop, LoopReducer, loop } from 'redux-loop'

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

function clearUserFormData() {
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

interface ISubmitFailedAction {
  type: typeof SUBMIT_USER_FORM_DATA_FAIL
  payload: {
    errorData: ApolloError
  }
}

interface IFetchAndStoreUserData {
  type: typeof FETCH_USER_DATA
  payload: {
    variables: { userId: string }
  }
}
interface IStoreUserFormDataAction {
  type: typeof STORE_USER_FORM_DATA
  payload: {
    user: User
  }
}

function storeUserFormData(user: User): IStoreUserFormDataAction {
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
  | IFetchAndStoreUserData
  | IStoreUserFormDataAction
  | IRoleMessagesLoadedAction
  | ReturnType<typeof clearUserFormData>
  | ReturnType<typeof showSubmitFormSuccessToast>
  | ReturnType<typeof showSubmitFormErrorToast>

export interface IUserFormState {
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

    case FETCH_USER_DATA:
      const {
        variables: { userId }
      } = (action as IFetchAndStoreUserData).payload
      return loop(
        state,
        Cmd.run(() => trpcClient.user.get.query(userId), {
          successActionCreator: (result) => storeUserFormData(result as User),
          failActionCreator: () => showSubmitFormErrorToast(TOAST_MESSAGES.FAIL)
        })
      )

    default:
      return state
  }
}
