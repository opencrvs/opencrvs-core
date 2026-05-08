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
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'

import { App, routesConfig } from '@login/App'
import { storage } from '@login/storage'
import { createStore } from './store'
import { BrowserTracing } from '@sentry/tracing'
// eslint-disable-next-line import/no-unassigned-import
import 'focus-visible/dist/focus-visible.js'
import WebFont from 'webfontloader'
import { authApi } from './utils/authApi'
import { delay } from 'lodash'
import { applicationConfigLoadedAction } from './login/actions'
import { createBrowserRouter } from 'react-router-dom'

const RETRY_TIMEOUT = 5000

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:400']
  }
})
storage.configStorage('OpenCRVS')
if (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  // setup error reporting using sentry
  if (window.config.SENTRY) {
    Sentry.init({
      environment: process.env.HOSTNAME,
      dsn: window.config.SENTRY,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0
    })
  }
}
const { store } = createStore()

// Proactive: if a new SW takes control mid-session (autoUpdate skipWaiting), reload
// so the page runs against the new bundle. Guarded by hadController to skip the
// very first SW install on a clean browser (no existing controller → not an update).
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) {
      window.location.reload()
    }
  })
}

const container = document.getElementById('root')
const root = createRoot(container!)
const router = createBrowserRouter(routesConfig, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
})
async function renderAppWithConfig() {
  return authApi.getApplicationConfig().then((res) => {
    store.dispatch(applicationConfigLoadedAction(res))

    root.render(<App router={router} store={store} />)
  })
}

function withRetry(render: () => Promise<void>) {
  render().catch(async (error) => {
    if (error?.message === 'VERSION_MISMATCH') {
      const reloads = Number(
        sessionStorage.getItem('version-mismatch-reloads') || 0
      )
      if (reloads < 3) {
        sessionStorage.setItem('version-mismatch-reloads', String(reloads + 1))
        // Clear stale SW runtime caches (login-config.js, etc.) and stored
        // language/user details so the next load starts fresh against the new version.
        const keys = await caches.keys()
        await Promise.all(
          keys
            .filter((k) => k.includes('-runtime'))
            .map((k) => caches.delete(k))
        )
        await storage.removeItem('language')
        await storage.removeItem('USER_DETAILS')

        // Trigger an immediate SW update check rather than waiting for the
        // browser's 24 h cycle. With autoUpdate, the new SW will skipWaiting
        // and fire controllerchange → the listener above reloads the page.
        // window.location.reload() below is the fallback when no new SW exists.
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready
            await registration.update()
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('SW update failed, reloading anyway', e)
          }
        }

        window.location.reload()
      }
      return
    }
    delay(() => withRetry(render), RETRY_TIMEOUT)
  })
}

withRetry(renderAppWithConfig)
