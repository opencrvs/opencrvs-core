export const RELOAD_MODAL_VISIBILITY = 'RELOAD_MODAL_VISIBILITY'
export type StoreReloadModalVisibilityAction = {
  type: typeof RELOAD_MODAL_VISIBILITY
  payload: { visibility: boolean }
}

export const storeReloadModalVisibility = (
  visibility: boolean
): StoreReloadModalVisibilityAction => {
  return {
    type: RELOAD_MODAL_VISIBILITY,
    payload: { visibility }
  }
}
