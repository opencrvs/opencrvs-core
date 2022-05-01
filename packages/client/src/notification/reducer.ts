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
import { LoopReducer, Loop } from 'redux-loop'
import * as actions from '@client/notification/actions'
import { AUDIT_ACTION } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'

type UserAuditSuccessToastState =
  | {
      visible: false
    }
  | {
      visible: true
      userFullName: string
      action: AUDIT_ACTION
    }

export type NotificationState = {
  backgroundSyncMessageVisible: boolean
  configurationErrorVisible: boolean
  waitingSW: ServiceWorker | null
  sessionExpired: boolean
  saveDraftClicked: boolean
  submitFormSuccessToast: string | null
  submitFormErrorToast: string | null
  userAuditSuccessToast: UserAuditSuccessToastState
  showPINUpdateSuccess: boolean
  downloadDeclarationFailedToast: boolean
}

export const initialState: NotificationState = {
  backgroundSyncMessageVisible: false,
  configurationErrorVisible: false,
  waitingSW: null,
  sessionExpired: false,
  saveDraftClicked: false,
  submitFormSuccessToast: null,
  submitFormErrorToast: null,
  userAuditSuccessToast: { visible: false },
  showPINUpdateSuccess: false,
  downloadDeclarationFailedToast: false
}

export const notificationReducer: LoopReducer<
  NotificationState,
  actions.Action
> = (
  state: NotificationState = initialState,
  action: actions.Action
): NotificationState | Loop<NotificationState, actions.Action> => {
  switch (action.type) {
    case actions.SHOW_BACKGROUND_SYNC_TRIGGERED:
      return {
        ...state,
        backgroundSyncMessageVisible: true
      }
    case actions.HIDE_BACKGROUND_SYNC_TRIGGERED:
      return {
        ...state,
        backgroundSyncMessageVisible: false
      }
    case actions.SESSION_EXPIRED:
      return {
        ...state,
        sessionExpired: true
      }
    case actions.SHOW_CONFIG_ERROR:
      return {
        ...state,
        configurationErrorVisible: true
      }
    case actions.HIDE_CONFIG_ERROR:
      return {
        ...state,
        configurationErrorVisible: false
      }
    case actions.TOGGLE_DRAFT_SAVED_NOTIFICATION:
      return {
        ...state,
        saveDraftClicked: !state.saveDraftClicked
      }
    case actions.SHOW_SUBMIT_FORM_SUCCESS_TOAST:
      return {
        ...state,
        submitFormSuccessToast: action.payload.data
      }
    case actions.HIDE_SUBMIT_FORM_SUCCESS_TOAST:
      return {
        ...state,
        submitFormSuccessToast: null
      }
    case actions.SHOW_SUBMIT_FORM_ERROR_TOAST:
      return {
        ...state,
        submitFormErrorToast: action.payload.data
      }
    case actions.SHOW_DOWNLOAD_DECLARATION_FAILED_TOAST:
      return {
        ...state,
        downloadDeclarationFailedToast: true
      }
    case actions.HIDE_DOWNLOAD_DECLARATION_FAILED_TOAST:
      return {
        ...state,
        downloadDeclarationFailedToast: false
      }
    case actions.HIDE_SUBMIT_FORM_ERROR_TOAST:
      return {
        ...state,
        submitFormErrorToast: null
      }
    case actions.SHOW_USER_AUDIT_SUCCESS_TOAST:
      const { userFullName, action: auditAction } = (
        action as actions.ShowUserAuditSuccessToast
      ).payload
      return {
        ...state,
        userAuditSuccessToast: {
          ...state.userAuditSuccessToast,
          visible: true,
          userFullName,
          action: auditAction
        }
      }
    case actions.HIDE_USER_AUDIT_SUCCESS_TOAST:
      return {
        ...state,
        userAuditSuccessToast: {
          ...state.userAuditSuccessToast,
          visible: false
        }
      }
    case actions.SHOW_PIN_UPDATE_SUCCESS:
      return {
        ...state,
        showPINUpdateSuccess: true
      }
    case actions.HIDE_PIN_UPDATE_SUCCESS:
      return {
        ...state,
        showPINUpdateSuccess: false
      }
    default:
      return state
  }
}
