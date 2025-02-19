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
// eslint-disable-next-line import/no-unassigned-import
import 'focus-visible/dist/focus-visible.js'
import * as actions from '@client/notification/actions'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
// eslint-disable-next-line no-restricted-imports
import { SubmissionController } from '@client/SubmissionController'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { createBrowserRouter } from 'react-router-dom'
import WebFont from 'webfontloader'
import { App, routesConfig } from './App'
import { APPLICATION_VERSION } from './utils/constants'

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:500', 'Noto+Sans:400']
  }
})

storage.configStorage('OpenCRVS')

const { store } = createStore()

if (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  // setup error reporting using sentry
  if (window.config.SENTRY) {
    Sentry.init({
      release: APPLICATION_VERSION,
      environment: import.meta.env.NODE_ENV,
      integrations: [new BrowserTracing()],

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 1.0,
      dsn: window.config.SENTRY
    })
  }
}

function userReconnectedToast() {
  const action = actions.showUserReconnectedToast()
  store.dispatch(action)
}

window.addEventListener('online', userReconnectedToast)

const container = document.getElementById('root')
const root = createRoot(container!)

const router = createBrowserRouter(routesConfig, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true
  }
})

root.render(<App router={router} store={store} />)

new SubmissionController(store).start()
