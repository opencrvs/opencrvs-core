/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
// eslint-disable-next-line import/no-unassigned-import
import 'focus-visible/dist/focus-visible.js'
import { showUserOnlineStatusNotificationToast } from '@client/notification/actions'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from '@client/App'
import registerServiceWorker from '@client/registerServiceWorker'
import { createStore } from '@client/store'
import * as actions from '@client/notification/actions'
import { storage } from '@client/storage'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'
import * as LogRocket from 'logrocket'
import { SubmissionController } from '@client/SubmissionController'
import * as pdfjs from 'pdfjs-dist/build/pdf'
import WebFont from 'webfontloader'
import { BACKGROUND_SYNC_BROADCAST_CHANNEL } from './utils/constants'
import { BrowserTracing } from '@sentry/tracing'

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:400']
  }
})
const pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry')
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

storage.configStorage('OpenCRVS')

const { store, history } = createStore()

if (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  // setup error reporting using sentry
  if (window.config.SENTRY) {
    Sentry.init({
      release: import.meta.env.REACT_APP_VERSION,
      environment: import.meta.env.NODE_ENV,
      integrations: [new BrowserTracing()],

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 1.0,
      dsn: window.config.SENTRY
    })
  }

  // setup log rocket to ship log messages and record user errors
  if (window.config.LOGROCKET) {
    LogRocket.init(window.config.LOGROCKET, {
      release: import.meta.env.VITE_APP_VERSION
    })
  }

  // Integrate the two
  if (window.config.SENTRY && window.config.LOGROCKET) {
    Sentry.configureScope((scope) => {
      scope.addEventProcessor(async (event) => {
        if (!event.extra) {
          event.extra = {}
        }
        const sessionUrl = await new Promise((resolve) => {
          LogRocket.getSessionURL((url) => {
            resolve(url)
          })
        })
        event.extra.sessionURL = sessionUrl
        return event
      })
    })
  }
}

function onNewContentAvailable(waitingSW: ServiceWorker | null) {
  if (waitingSW) {
    waitingSW.postMessage('skipWaiting')
    window.location.reload()
  }
}

function userOnlineStatus() {
  const action = actions.showUserOnlineStatusNotificationToast()
  store.dispatch(action)
}

window.addEventListener('online', userOnlineStatus)

ReactDOM.render(
  <App store={store} history={history} />,
  document.getElementById('root')
)

registerServiceWorker(onNewContentAvailable)
new SubmissionController(store).start()
