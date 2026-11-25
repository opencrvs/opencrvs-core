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
import { test } from '@playwright/test'
import {
  CLIENT_URL,
  CREDENTIALS,
  TEST_USER_PASSWORD,
  isClientUrl,
  isLoginUrl
} from '@e2e/support/constants'
import { createPIN, ensureLoginPageReady, logout } from '@e2e/support/helpers'

test('Navigating between client and login', async ({ page }) => {
  await test.step('Go to client unauthenticated', async () => {
    await page.goto(CLIENT_URL)
    await page.waitForURL(isLoginUrl)
    await ensureLoginPageReady(page)
  })

  await test.step('Login step one', async () => {
    await page.fill('#username', CREDENTIALS.REGISTRAR)
    await page.fill('#password', TEST_USER_PASSWORD)
    await page.click('#login-mobile-submit')
  })

  await test.step('Login step two', async () => {
    await page.fill('#code', '000000')
    await page.click('#login-mobile-submit')
    await page.waitForURL(isClientUrl)
  })

  await test.step('Logout', async () => {
    await createPIN(page)

    await logout(page)
    await page.waitForURL(isLoginUrl)
  })
})
