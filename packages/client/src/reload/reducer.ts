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
export type IReloadModalVisibilityState = {
  isReloadModalVisible: boolean
}

const initialState: IReloadModalVisibilityState = {
  isReloadModalVisible: false
}

const RELOAD_MODAL_VISIBILITY = 'RELOAD_MODAL_VISIBILITY'

type ReloadModalVisibilityAction = {
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
