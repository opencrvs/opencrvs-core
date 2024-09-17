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
