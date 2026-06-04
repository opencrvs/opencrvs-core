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

// After a deploy, the old SW serves a stale index.html whose hashed JS chunk
// no longer exists → 404 → index.tsx never runs → controllerchange is never
// wired up → spinner forever. This script is a separate <script> tag so it
// runs even when the main bundle fails to load. When the new SW takes control
// it reloads once, letting the new SW serve the fresh bundle.
if ('serviceWorker' in navigator) {
  var hadController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    // Skip on first-ever SW install (no prior controller = clean browser, not an upgrade).
    // sw_reloaded prevents an infinite loop if controllerchange keeps firing.
    if (hadController && !sessionStorage.getItem('sw_reloaded')) {
      sessionStorage.setItem('sw_reloaded', 'true')
      window.location.reload()
    }
  })
}
