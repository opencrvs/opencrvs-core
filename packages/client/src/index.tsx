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
import { SubmissionController } from '@client/SubmissionController'
import { createBrowserRouter } from 'react-router-dom'
import WebFont from 'webfontloader'
import { App, routesConfig } from './App'

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:500', 'Noto+Sans:400']
  }
})

storage.configStorage()

const { store } = createStore()

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
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
})

// eslint-disable-next-line no-console
console.debug('Waiting for service worker to be ready...')
void navigator.serviceWorker.ready.then(() => {
  // eslint-disable-next-line no-console
  console.debug('Service worker is ready')
  root.render(<App router={router} store={store} />)
})

new SubmissionController(store).start()
