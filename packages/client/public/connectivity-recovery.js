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

/*
 * Connectivity recovery during initial app load (#12898).
 *
 * Loaded as a classic script BEFORE the app bundle, so its listeners attach
 * before the bundle downloads — catching network switches that happen while the
 * bundle / service-worker assets are still loading. Such a switch can abort the
 * service worker precache (leaving the app stuck on "Installing application…")
 * or interrupt the bundle fetch; browsers don't auto-retry either, only a reload
 * does. So if we go offline while still loading and then come back online, force
 * one reload. Once the app has rendered we unsubscribe, so a blip in an active
 * session never reloads.
 */
;(function () {
  function appLoaded() {
    // React replaces #root's contents on first render, removing this placeholder.
    const noRootAppProgress = !document.getElementById('root-app-progress')
    const noAppSpinner = !document.getElementById('appSpinner')
    return noRootAppProgress && noAppSpinner
  }

  var wentOfflineWhileLoading = !navigator.onLine

  function onOffline() {
    if (!appLoaded()) {
      wentOfflineWhileLoading = true
    }
  }

  function onOnline() {
    if (!appLoaded() && wentOfflineWhileLoading) {
      window.location.reload()
    }
  }

  function unsubscribe() {
    window.removeEventListener('offline', onOffline)
    window.removeEventListener('online', onOnline)
  }

  window.addEventListener('offline', onOffline)
  window.addEventListener('online', onOnline)

  // Unsubscribe as soon as the app has rendered.
  var root = document.getElementById('root')
  if (root && 'MutationObserver' in window) {
    var observer = new MutationObserver(function () {
      if (appLoaded()) {
        observer.disconnect()
        unsubscribe()
      }
    })
    observer.observe(root, { childList: true, subtree: true })
  }
})()
