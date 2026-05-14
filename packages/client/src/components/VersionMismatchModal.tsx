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
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { IStoreState } from '@client/store'
import { storage } from '@client/storage'
import { removeToken } from '@client/utils/authUtils'
import { removeUserDetails } from '@client/utils/userUtils'
import { messages as reloadModalMessages } from '@client/i18n/messages/views/reloadModal'
import { ROUTES } from '@client/v2-events/routes/routes'

const SCREEN_LOCK = 'screenLock'

export function VersionMismatchModal({ show }: { show: boolean }) {
  const intl = useIntl()
  const appName = useSelector(
    (state: IStoreState) => state.offline.offlineData.config?.APPLICATION_NAME
  )

  const handleReLogin = async () => {
    // Unregister the SW and clear all caches before redirecting so the stale
    // SW cannot intercept the navigation to the login service.
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      await registration?.unregister()
      await Promise.all((await caches.keys()).map((key) => caches.delete(key)))
    }
    await storage.removeItem(SCREEN_LOCK)
    await removeToken()
    await removeUserDetails()
    window.location.assign(
      `/login?lang=${await storage.getItem('language')}&redirectTo=${window.location.origin}${ROUTES.V2.buildPath({})}`
    )
  }

  return (
    <ResponsiveModal
      title={intl.formatMessage(reloadModalMessages.title)}
      responsive={false}
      showCloseButton={false}
      autoHeight={true}
      titleHeightAuto={true}
      actions={[
        <PrimaryButton key="login" id="login" onClick={handleReLogin}>
          {intl.formatMessage(reloadModalMessages.loginAgain)}
        </PrimaryButton>
      ]}
      show={show}
    >
      {intl.formatMessage(reloadModalMessages.body, { app_name: appName })}
    </ResponsiveModal>
  )
}
