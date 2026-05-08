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
import { Button } from '@opencrvs/components/lib/Button'
import React from 'react'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/reloadModal'

export const ReloadModal = () => {
  const intl = useIntl()

  const visibility = useSelector(
    (state: IStoreState) => state.reloadModalVisibility.isReloadModalVisible
  )
  const app_name = useSelector(
    (state: IStoreState) => state.offline.offlineData.config?.APPLICATION_NAME
  )

  const handleReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update()
          registration.onupdatefound = () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                )
                  window.location.reload()
              }
            }
          }
        }
      })
    }
    window.location.reload()
  }

  return (
    <ResponsiveModal
      title={intl.formatMessage(messages.title)}
      responsive={false}
      showCloseButton={false}
      autoHeight={true}
      titleHeightAuto={true}
      actions={[
        <Button key="reload" id="reload" type="primary" onClick={handleReload}>
          {intl.formatMessage(messages.update)}
        </Button>
      ]}
      show={visibility}
    >
      {intl.formatMessage(messages.body, { app_name: app_name })}
    </ResponsiveModal>
  )
}
