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
import { LoopReducer, Loop } from 'redux-loop'
import * as actions from '@client/notification/actions'
import { AUDIT_ACTION } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import { ShowUnassignedPayload } from '@client/notification/actions'

type UserAuditSuccessToastState =
  | {
      visible: false
    }
  | {
      visible: true
      userFullName: string
      action: AUDIT_ACTION
    }

type userCreateDuplicateMobileFailedToastState = {
  visible: boolean
  mobile: string | null
}

type userCreateDuplicateEmailFailedToastState = {
  visible: boolean
  email: string | null
}

export type NotificationState = {
  backgroundSyncMessageVisible: boolean
  configurationError: string | null
  configurationErrorVisible: boolean
  waitingSW: ServiceWorker | null
  sessionExpired: boolean
  saveDraftClicked: boolean
  submitFormSuccessToast: string | null
  submitFormErrorToast: string | null
  userAuditSuccessToast: UserAuditSuccessToastState
  showPINUpdateSuccess: boolean
  showDuplicateRecordsToast: boolean
  duplicateCompositionId: string | null
  duplicateTrackingId: string | null
  downloadDeclarationFailedToast: boolean
  unassignedModal: ShowUnassignedPayload | null
  userCreateDuplicateMobileFailedToast: userCreateDuplicateMobileFailedToastState
  userCreateDuplicateEmailFailedToast: userCreateDuplicateEmailFailedToastState
  userReconnectedToast: boolean
}

const initialState: NotificationState = {
  backgroundSyncMessageVisible: false,
  configurationError: null,
  configurationErrorVisible: false,
  waitingSW: null,
  sessionExpired: false,
  saveDraftClicked: false,
  submitFormSuccessToast: null,
  submitFormErrorToast: null,
  userAuditSuccessToast: { visible: false },
  showPINUpdateSuccess: false,
  showDuplicateRecordsToast: false,
  duplicateCompositionId: null,
  duplicateTrackingId: null,
  downloadDeclarationFailedToast: false,
  unassignedModal: null,
  userCreateDuplicateMobileFailedToast: {
    visible: false,
    mobile: null
  },
  userCreateDuplicateEmailFailedToast: {
    visible: false,
    email: null
  },
  userReconnectedToast: false
}

export const notificationReducer: LoopReducer<
  NotificationState,
  actions.Action
> = (
  state: NotificationState = initialState,
  action: actions.Action
): NotificationState | Loop<NotificationState, actions.Action> => {
  switch (action.type) {
    case actions.SESSION_EXPIRED:
      return {
        ...state,
        sessionExpired: true
      }
    case actions.CONFIGURATION_ERROR:
      return {
        ...state,
        configurationError: action.payload
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
    case actions.SHOW_CREATE_USER_ERROR_TOAST:
      const userCreateDuplicateMobileFailedToast = {
        visible: true,
        mobile: action.payload.mobile
      }
      return {
        ...state,
        userCreateDuplicateMobileFailedToast
      }
    case actions.SHOW_CREATE_USER_DUPLICATE_EMAIL_ERROR_TOAST:
      const userCreateDuplicateEmailFailedToast = {
        visible: true,
        email: action.payload.email
      }
      return {
        ...state,
        userCreateDuplicateEmailFailedToast
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
    case actions.HIDE_CREATE_USER_ERROR_TOAST:
      return {
        ...state,
        userCreateDuplicateMobileFailedToast: {
          visible: false,
          mobile: null
        }
      }
    case actions.HIDE_CREATE_USER_DUPLICATE_EMAIL_ERROR_TOAST:
      return {
        ...state,
        userCreateDuplicateEmailFailedToast: {
          visible: false,
          email: null
        }
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
    case actions.SHOW_DUPLICATE_RECORDS_TOAST:
      return {
        ...state,
        showDuplicateRecordsToast: true,
        duplicateTrackingId: action.payload.trackingId,
        duplicateCompositionId: action.payload.compositionId
      }
    case actions.HIDE_DUPLICATE_RECORDS_TOAST:
      return {
        ...state,
        showDuplicateRecordsToast: false,
        duplicateTrackingId: null,
        duplicateCompositionId: null
      }
    case actions.SHOW_UNASSIGNED:
      return {
        ...state,
        unassignedModal: action.payload
      }
    case actions.HIDE_UNASSIGNED:
      return {
        ...state,
        unassignedModal: null
      }
    case actions.SHOW_USER_RECONNECTED_TOAST:
      return {
        ...state,
        userReconnectedToast: true
      }
    case actions.HIDE_USER_RECONNECTED_TOAST:
      return {
        ...state,
        userReconnectedToast: false
      }
    default:
      return state
  }
}
