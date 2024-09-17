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
import { useSelector } from 'react-redux'
import { getReloadModalVisibility } from '@login/login/selectors'
import { useIntl } from 'react-intl'
import { IStoreState } from '@login/store'
import { messages } from '@login/i18n/messages/views/reloadModal'

export const ReloadModal = () => {
  const intl = useIntl()

  const visibility = useSelector(getReloadModalVisibility)
  const app_name = useSelector(
    (state: IStoreState) => state.login.config.APPLICATION_NAME
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
        <PrimaryButton key="reload" id="reload" onClick={handleReload}>
          {intl.formatMessage(messages.update)}
        </PrimaryButton>
      ]}
      show={visibility}
    >
      {intl.formatMessage(messages.body, { app_name: app_name })}
    </ResponsiveModal>
  )
}
