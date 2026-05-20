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
 * Callers signal the upcoming background by calling {@link setLockBypass}
 * just before the action. `ProtectedPage` checks via
 * {@link shouldBypassLock} on visibility change to decide whether to lock.
 */

const LOCK_BYPASS_KEY = 'lockBypass'

/**
 * How long the bypass stays valid (3 minutes).
 *
 * Long enough for slow user actions like camera permission prompts. Short
 * enough that a forgotten flag can't disable the PIN lock on a later real
 * background event.
 */
const LOCK_BYPASS_TTL_MS = 180_000

/**
 * Tells `ProtectedPage` to skip the PIN lock on the next visibility change.
 *
 * Call this right before any user action that temporarily backgrounds the
 * tab — opening a native picker, launching the camera, redirecting to an
 * external app, etc. The flag auto-clears after 3 minutes so a stuck flag
 * can't disable the lock forever.
 *
 * No-ops if `sessionStorage` is blocked (e.g. Safari private mode) — the
 * PIN screen will show, which is safe.
 *
 * @example
 * <button onClick={setLockBypass}>Open camera</button>
 */
export function setLockBypass(): void {
  try {
    sessionStorage.setItem(LOCK_BYPASS_KEY, '1')
    setTimeout(() => {
      try {
        sessionStorage.removeItem(LOCK_BYPASS_KEY)
      } catch {}
    }, LOCK_BYPASS_TTL_MS)
  } catch {}
}

/**
 * Returns `true` if the PIN lock should be skipped because a backgrounding
 * action was just intentionally triggered, `false` otherwise.
 *
 * Single-shot: when it returns `true` it also clears the flag, so each
 * {@link setLockBypass} grants exactly one skip. A later unrelated
 * background event will still trigger the PIN — that's the point.
 *
 * Called by `ProtectedPage` on every visibility change.
 *
 * @returns `true` to skip the lock, `false` to lock as usual.
 */
export function shouldBypassLock(): boolean {
  try {
    const pending = sessionStorage.getItem(LOCK_BYPASS_KEY) === '1'
    if (pending) {
      sessionStorage.removeItem(LOCK_BYPASS_KEY)
    }
    return pending
  } catch {
    return false
  }
}
