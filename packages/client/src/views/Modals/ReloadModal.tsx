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
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { storeReloadModalVisibility } from '@client/reload/reducer'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { SecondaryButton } from '@opencrvs/components/lib/buttons'
import { IStoreState } from '@client/store'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/reloadModal'

export const ReloadModal = () => {
  const dispatch = useDispatch()
  const intl = useIntl()

  const visibility = useSelector(
    (state: IStoreState) => state.reloadModalVisibility.isReloadModalVisible
  )

  const [suppressUntill, setSupressUntill] = useState(0)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      r &&
        setInterval(() => {
          r.update()
        }, 30 * 1000)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    }
  })

  const closeModal = () => {
    dispatch(storeReloadModalVisibility(false))
    setSupressUntill(Date.now() + 30 * 1000)
  }

  return (
    <ResponsiveModal
      title={
        needRefresh
          ? intl.formatMessage(messages.newContent)
          : intl.formatMessage(messages.versionDoesNotMatch)
      }
      contentHeight={96}
      responsive={false}
      handleClose={closeModal}
      actions={
        needRefresh
          ? [
              <SecondaryButton key="cancel" id="cancel" onClick={closeModal}>
                {intl.formatMessage(messages.notNow)}
              </SecondaryButton>,
              <PrimaryButton
                key="reload"
                id="reload"
                onClick={() => {
                  updateServiceWorker(true)
                }}
              >
                {intl.formatMessage(messages.reload)}
              </PrimaryButton>
            ]
          : []
      }
      show={visibility || (needRefresh && Date.now() > suppressUntill)}
    />
  )
}
