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
 * @module lockBypass
 *
 * Lets the app skip the mobile PIN lock when an intentional user action
 * sends the tab to the background.
 *
 * On mobile, many user actions briefly background the tab — opening a file
 * picker, launching the camera, redirecting to an external app, and so on.
 * Without this, the PIN screen would appear every time the user comes back.
 *
 * Flow:
 *   1. Caller arms the bypass via {@link setLockBypass} just before the action.
 *   2. `ProtectedPage` checks via {@link shouldBypassLock} on visibility
 *      change to decide whether to lock.
 *   3. The bypass is cleared when the window regains focus — i.e. when the
 *      user actually returns from the external action.
 */

/**
 * How long the bypass stays valid (3 minutes).
 *
 * Long enough for slow user actions like camera permission prompts. Short
 * enough that a forgotten flag can't disable the PIN lock on a later real
 * background event.
 */
const LOCK_BYPASS_TTL_MS = 180_000

/**
 * The expiry timestamp of the pending bypass. `0` means no bypass pending.
 * Comparing against `Date.now()` enforces the TTL with no need for a timer.
 */
let bypassValidUntil = 0

/**
 * Clear the bypass as soon as the user returns to the tab.
 *
 * The `focus` event on `window` fires when the tab regains focus — i.e.
 * the user closed the file picker / camera / external app and is back.
 * Tying the clear to this event (rather than to the lock check) keeps the
 * read in {@link shouldBypassLock} side-effect-free, and ensures the
 * bypass survives until the user actually returns.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    bypassValidUntil = 0
  })
}

/**
 * Tells `ProtectedPage` to skip the PIN lock on the next visibility change.
 *
 * Call this right before any user action that temporarily backgrounds the
 * tab — opening a native picker, launching the camera, redirecting to an
 * external app, etc. The flag is cleared the moment the window regains
 * focus, and auto-expires after 3 minutes as a safety net.
 *
 * @example
 * <button onClick={setLockBypass}>Open camera</button>
 */
export function setLockBypass(): void {
  bypassValidUntil = Date.now() + LOCK_BYPASS_TTL_MS
}

/**
 * Pure query: returns `true` if a bypass is currently pending, `false`
 * otherwise.
 *
 * Has no side effect — multiple calls return the same value until either
 * the window regains focus (cleared by the focus listener) or the TTL
 * elapses.
 *
 * Called by `ProtectedPage` on visibility change to decide whether to lock.
 *
 * @returns `true` to skip the lock, `false` to lock as usual.
 */
export function shouldBypassLock(): boolean {
  return bypassValidUntil > Date.now()
}
