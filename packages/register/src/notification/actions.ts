export const SHOW_NEW_CONTENT_AVAILABLE = 'SHOW_NEW_CONTENT_AVAILABLE'
export const HIDE_NEW_CONTENT_AVAILABLE = 'HIDE_NEW_CONTENT_AVAILABLE'

export type ShowNewContentAvailableAction = {
  type: typeof SHOW_NEW_CONTENT_AVAILABLE
}

export type HideNewContentAvailableAction = {
  type: typeof HIDE_NEW_CONTENT_AVAILABLE
}

export const showNewContentAvailableNotification = (): ShowNewContentAvailableAction => ({
  type: SHOW_NEW_CONTENT_AVAILABLE
})

export const hideNewContentAvailableNotification = (): HideNewContentAvailableAction => ({
  type: HIDE_NEW_CONTENT_AVAILABLE
})
