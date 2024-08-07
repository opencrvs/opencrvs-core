export type IReloadModalVisibilityState = {
  isReloadModalVisible: boolean
}

const initialState: IReloadModalVisibilityState = {
  isReloadModalVisible: false
}

export const RELOAD_MODAL_VISIBILITY = 'RELOAD_MODAL_VISIBILITY'

export type ReloadModalVisibilityAction = {
  type: typeof RELOAD_MODAL_VISIBILITY
  payload?: boolean
}

export const storeReloadModalVisibility = (
  visibility: boolean
): ReloadModalVisibilityAction => ({
  type: RELOAD_MODAL_VISIBILITY,
  payload: visibility
})

export function reloadModalVisibilityReducer(
  state: IReloadModalVisibilityState = initialState,
  action: ReloadModalVisibilityAction
): IReloadModalVisibilityState {
  if (action.type === RELOAD_MODAL_VISIBILITY) {
    return { ...state, isReloadModalVisible: Boolean(action.payload) }
  }
  return state
}
