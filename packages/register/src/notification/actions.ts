export const SHOW_NEW_CONTENT_AVAILABLE = 'SHOW_NEW_CONTENT_AVAILABLE'
export const HIDE_NEW_CONTENT_AVAILABLE = 'HIDE_NEW_CONTENT_AVAILABLE'

export const SHOW_BACKGROUND_SYNC_TRIGGERED = 'SHOW_BACKGROUND_SYNC_TRIGGERED'
export const HIDE_BACKGROUND_SYNC_TRIGGERED = 'HIDE_BACKGROUND_SYNC_TRIGGERED'
export const SHOW_CONFIG_ERROR = 'SHOW_CONFIG_ERROR'
export const HIDE_CONFIG_ERROR = 'HIDE_CONFIG_ERROR'
export const SESSION_EXPIRED = 'AUTH/SESSION_EXPIRED'
export const TOGGLE_DRAFT_SAVED_NOTIFICATION = 'TOGGLE_DRAFT_SAVED_NOTIFICATION'

export type ShowNewContentAvailableAction = {
  type: typeof SHOW_NEW_CONTENT_AVAILABLE
  payload: { waitingSW: ServiceWorker }
}

export type HideNewContentAvailableAction = {
  type: typeof HIDE_NEW_CONTENT_AVAILABLE
}

export const showNewContentAvailableNotification = (
  waitingSW: ServiceWorker
): ShowNewContentAvailableAction => ({
  type: SHOW_NEW_CONTENT_AVAILABLE,
  payload: { waitingSW }
})

export const hideNewContentAvailableNotification = (): HideNewContentAvailableAction => ({
  type: HIDE_NEW_CONTENT_AVAILABLE
})

export type ShowConfigurationErrorAction = {
  type: typeof SHOW_CONFIG_ERROR
}

export type HideConfigurationErrorAction = {
  type: typeof HIDE_CONFIG_ERROR
}

export type toggleDraftSavedNotificationAction = {
  type: typeof TOGGLE_DRAFT_SAVED_NOTIFICATION
}

export const showConfigurationErrorNotification = (): ShowConfigurationErrorAction => ({
  type: SHOW_CONFIG_ERROR
})

export const hideConfigurationErrorNotification = (): HideConfigurationErrorAction => ({
  type: HIDE_CONFIG_ERROR
})

export const toggleDraftSavedNotification = (): toggleDraftSavedNotificationAction => ({
  type: TOGGLE_DRAFT_SAVED_NOTIFICATION
})

type backgroundSyncPayload = {
  syncCount: number
}

export type ShowBackgroundSyncedAction = {
  type: typeof SHOW_BACKGROUND_SYNC_TRIGGERED
  payload: backgroundSyncPayload
}

export type HideBackgroundSyncedAction = {
  type: typeof HIDE_BACKGROUND_SYNC_TRIGGERED
}

export type SessionExpiredAction = {
  type: typeof SESSION_EXPIRED
}

export const showBackgroundSyncedNotification = (
  syncCount: number
): ShowBackgroundSyncedAction => ({
  type: SHOW_BACKGROUND_SYNC_TRIGGERED,
  payload: { syncCount }
})

export const hideBackgroundSyncedNotification = (): HideBackgroundSyncedAction => ({
  type: HIDE_BACKGROUND_SYNC_TRIGGERED
})

export const showSessionExpireConfirmation = (): SessionExpiredAction => ({
  type: SESSION_EXPIRED
})

export type Action =
  | ShowNewContentAvailableAction
  | HideNewContentAvailableAction
  | ShowBackgroundSyncedAction
  | HideBackgroundSyncedAction
  | SessionExpiredAction
  | ShowConfigurationErrorAction
  | HideConfigurationErrorAction
  | toggleDraftSavedNotificationAction
