import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './actions'

export type NotificationState = {
  newContentAvailable: boolean
  backgroundSyncMessageVisible: boolean
  syncCount: number
  waitingSW: ServiceWorker | null
  sessionExpired: boolean
}

export const initialState: NotificationState = {
  newContentAvailable: false,
  backgroundSyncMessageVisible: false,
  syncCount: 0,
  waitingSW: null,
  sessionExpired: false
}

type Action =
  | actions.ShowNewContentAvailableAction
  | actions.HideNewContentAvailableAction
  | actions.ShowBackgroundSyncedAction
  | actions.HideBackgroundSyncedAction
  | actions.SessionExpiredAction

export const notificationReducer: LoopReducer<NotificationState, Action> = (
  state: NotificationState = initialState,
  action: Action
): NotificationState | Loop<NotificationState, Action> => {
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
    default:
      return state
  }
}
