import { LoopReducer, Loop } from 'redux-loop'
import * as actions from '@register/notification/actions'

export type NotificationState = {
  backgroundSyncMessageVisible: boolean
  configurationErrorVisible: boolean
  waitingSW: ServiceWorker | null
  sessionExpired: boolean
  saveDraftClicked: boolean
  submitFormSuccessToast: string | null
  submitFormErrorToast: string | null
}

export const initialState: NotificationState = {
  backgroundSyncMessageVisible: false,
  configurationErrorVisible: false,
  waitingSW: null,
  sessionExpired: false,
  saveDraftClicked: false,
  submitFormSuccessToast: null,
  submitFormErrorToast: null
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
    case actions.HIDE_SUBMIT_FORM_ERROR_TOAST:
      return {
        ...state,
        submitFormErrorToast: null
      }
    default:
      return state
  }
}
