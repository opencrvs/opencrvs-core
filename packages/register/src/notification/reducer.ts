import { LoopReducer, Loop } from 'redux-loop'
import * as actions from '@register/notification/actions'

export type NotificationState = {
  newContentAvailable: boolean
  backgroundSyncMessageVisible: boolean
  configurationErrorVisible: boolean
  syncCount: number
  waitingSW: ServiceWorker | null
  sessionExpired: boolean
  saveDraftClicked: boolean
}

export const initialState: NotificationState = {
  newContentAvailable: false,
  backgroundSyncMessageVisible: false,
  configurationErrorVisible: false,
  syncCount: 0,
  waitingSW: null,
  sessionExpired: false,
  saveDraftClicked: false
}

export const notificationReducer: LoopReducer<
  NotificationState,
  actions.Action
> = (
  state: NotificationState = initialState,
  action: actions.Action
): NotificationState | Loop<NotificationState, actions.Action> => {
  switch (action.type) {
    case actions.SHOW_NEW_CONTENT_AVAILABLE:
      return {
        ...state,
        newContentAvailable: true,
        waitingSW: action.payload.waitingSW
      }
    case actions.HIDE_NEW_CONTENT_AVAILABLE:
      return {
        ...state,
        newContentAvailable: false,
        waitingSW: null
      }
    case actions.SHOW_BACKGROUND_SYNC_TRIGGERED:
      return {
        ...state,
        backgroundSyncMessageVisible: true,
        syncCount: action.payload.syncCount
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
    default:
      return state
  }
}
