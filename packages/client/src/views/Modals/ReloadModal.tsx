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
import { IStoreState } from '@client/store'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/reloadModal'

export const ReloadModal = () => {
  const intl = useIntl()

  const visibility = useSelector(
    (state: IStoreState) => state.reloadModalVisibility.isReloadModalVisible
  )

  const handleReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
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
          } else {
            console.log('No service worker registration found.')
          }
        })
        .catch((error) => {
          console.error('Failed to get service worker registration:', error)
        })
    }
    window.location.reload()
  }

  return (
    <ResponsiveModal
      title={intl.formatMessage(messages.title)}
      contentHeight={96}
      responsive={false}
      showCloseButton={false}
      actions={[
        <PrimaryButton key="reload" id="reload" onClick={handleReload}>
          {intl.formatMessage(messages.update)}
        </PrimaryButton>
      ]}
      show={visibility}
    >
      {intl.formatMessage(messages.body)}
    </ResponsiveModal>
  )
}
