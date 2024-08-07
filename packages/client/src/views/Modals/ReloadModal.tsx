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

import { ResponsiveModal } from '@opencrvs/components'
import { PrimaryButton } from '@opencrvs/components/src/buttons'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { storeReloadModalVisibility } from '@client/reload/reducer'

export const ReloadModal = () => {
  const dispatch = useDispatch()
  const visibility = useSelector(
    (state) => state.reloadModalVisibility.isReloadModalVisible
  )

  return (
    <ResponsiveModal
      title="Version does not match. please reload!!"
      contentHeight={96}
      responsive={false}
      handleClose={() => {
        dispatch(storeReloadModalVisibility(false))
      }}
      actions={[
        <PrimaryButton
          key="reload"
          id="reload"
          onClick={() => {
            dispatch(storeReloadModalVisibility(false))
            document.location.reload()
          }}
        >
          Reload
        </PrimaryButton>
      ]}
      show={visibility}
    />
  )
}
