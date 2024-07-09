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
import * as actions from '@login/login/actions'
import { getReloadModalVisibility } from '@login/login/selectors'

export const ReloadModal = () => {
  const dispatch = useDispatch()
  const visibility = useSelector(getReloadModalVisibility)

  return (
    <ResponsiveModal
      title="Version does not match. please reload"
      contentHeight={96}
      responsive={false}
      actions={[
        <PrimaryButton
          key="reload"
          id="reload"
          onClick={() => {
            document.location.reload()
            dispatch(actions.storeReloadModalVisibility(false))
          }}
        >
          Reload
        </PrimaryButton>
      ]}
      show={visibility}
    />
  )
}
