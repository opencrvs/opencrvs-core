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

const container = document.getElementById('root')
const root = createRoot(container!)
const router = createBrowserRouter(routesConfig, {
  future: { v7_relativeSplatPath: true }
})
async function renderAppWithConfig() {
  return authApi.getApplicationConfig().then((res) => {
    store.dispatch(applicationConfigLoadedAction(res))

    root.render(<App router={router} store={store} />)
  })
}

function withRetry(render: () => Promise<void>) {
  render().catch(() => {
    delay(() => withRetry(render), RETRY_TIMEOUT)
  })
}

withRetry(renderAppWithConfig)
