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
import 'focus-visible/dist/focus-visible.js'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from '@client/App'
import registerServiceWorker from '@client/registerServiceWorker'
import { createStore } from '@client/store'
import * as actions from '@client/notification/actions'
import { storage } from '@client/storage'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import * as LogRocket from 'logrocket'
import { SubmissionController } from '@client/SubmissionController'
import * as pdfjs from 'pdfjs-dist/build/pdf'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import WebFont from 'webfontloader'

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:400']
  }
})

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

storage.configStorage('OpenCRVS')

const { store, history } = createStore()

if (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  // setup error reporting using sentry
  Sentry.init({
    release: process.env.REACT_APP_VERSION,
    environment: process.env.NODE_ENV,
    dsn: window.config.SENTRY
  })

  // setup log rocket to ship log messages and record user errors

  if (window.config.LOGROCKET) {
    LogRocket.init(window.config.LOGROCKET, {
      release: process.env.REACT_APP_VERSION
    })
  }

  // Integrate the two
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

function onNewContentAvailable(waitingSW: ServiceWorker | null) {
  if (waitingSW) {
    waitingSW.postMessage('skipWaiting')
    window.location.reload()
  }
}

function onBackGroundSync() {
  if (typeof BroadcastChannel === 'undefined') {
    return
  }
  const channel = new BroadcastChannel(
    window.config.BACKGROUND_SYNC_BROADCAST_CHANNEL
  )
  channel.onmessage = (e) => {
    const action = actions.showBackgroundSyncedNotification()
    store.dispatch(action)
  }
}

onBackGroundSync()

ReactDOM.render(
  <App store={store} history={history} />,
  document.getElementById('root')
)

registerServiceWorker(onNewContentAvailable)
new SubmissionController(store).start()
