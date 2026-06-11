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

/**
 * Simulates the browser going offline/online in storybook play functions.
 *
 * useOnlineStatus reads navigator.onLine when the online/offline event fires,
 * so the value must be stubbed before dispatching — a bare event alone keeps
 * the previous status.
 *
 * Stories that go offline must call `setNavigatorOnline(true)` before they
 * finish, otherwise the stubbed offline state leaks into the next story
 * rendered in the same preview iframe.
 */
export function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => isOnline
  })
  window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'))
}
