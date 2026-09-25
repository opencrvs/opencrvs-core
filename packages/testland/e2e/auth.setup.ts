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
import { test as setup, expect } from '@playwright/test'
import { CREDENTIALS } from '@e2e/support/constants'
import { captureSharedSession } from '@e2e/support/auth'
import {
  createPIN,
  getAuthTokens,
  waitForAuthenticatedLanding
} from '@e2e/support/helpers'

/**
 * Signs in once for the whole run and persists the session state, following
 * Playwright's authentication guide (https://playwright.dev/docs/auth).
 *
 * Every `login()` in the suite reuses what this writes, so no spec has to
 * walk the sign-in handoff and the PIN screen again, and no spec has to wait
 * for the country configuration to load before the app renders. Nothing it
 * captures is user-specific except the PIN hash, which is keyed by user id,
 * and the certificate templates, which are dropped for a user whose scopes
 * differ - see `e2e/support/auth.ts` - so one sign-in is enough for every
 * test user.
 *
 * `login()` falls back to signing in through the app when this has not run,
 * which keeps runs that filter tests down to single spec files working.
 */
setup('capture shared authentication state', async ({ page }) => {
  const { token, refreshToken } = await getAuthTokens(CREDENTIALS.REGISTRAR)
  expect(refreshToken).toBeDefined()

  await waitForAuthenticatedLanding(page, refreshToken)
  await createPIN(page)

  await captureSharedSession(page, token)
})
