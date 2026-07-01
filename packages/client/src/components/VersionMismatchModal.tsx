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
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { IStoreState } from '@client/store'
import { storage } from '@client/storage'
import { removeToken } from '@client/utils/authUtils'
import { removeUserDetails } from '@client/utils/userUtils'
import { messages as reloadModalMessages } from '@client/i18n/messages/views/reloadModal'

const SCREEN_LOCK = 'screenLock'

export function buildLoginUrl(lang: string | null) {
  const url = window.config.LOGIN_URL
    ? new URL(window.config.LOGIN_URL)
    : new URL('/login', window.location.origin)
  url.searchParams.set('lang', lang ?? 'en')
  url.searchParams.set('redirectTo', window.location.pathname)
  return url.toString()
}

export function VersionMismatchModal({ show }: { show: boolean }) {
  const intl = useIntl()
  const appName = useSelector(
    (state: IStoreState) => state.offline.offlineData.config?.APPLICATION_NAME
  )

  const handleReLogin = async () => {
    // Unregister the SW before redirecting so it cannot intercept the
    // navigation to the login service.
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      await registration?.unregister()
    }
    await storage.removeItem(SCREEN_LOCK)
    await removeToken()
    await removeUserDetails()
    const lang = await storage.getItem('language')
    window.location.assign(buildLoginUrl(lang))
  }

  return (
    <Dialog
      title={intl.formatMessage(reloadModalMessages.title)}
      actions={[
        <PrimaryButton key="login" id="login" onClick={handleReLogin}>
          {intl.formatMessage(reloadModalMessages.loginAgain)}
        </PrimaryButton>
      ]}
      isOpen={show}
    >
      {intl.formatMessage(reloadModalMessages.body, { app_name: appName })}
    </Dialog>
  )
}
