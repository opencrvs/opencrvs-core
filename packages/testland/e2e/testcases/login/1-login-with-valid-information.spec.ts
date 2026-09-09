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
import { test, expect } from '@playwright/test'
import {
  CREDENTIALS,
  LOGIN_URL,
  TEST_USER_PASSWORD
} from '@e2e/support/constants'
import { ensureLoginPageReady } from '@e2e/support/helpers'

test.describe('1. Login with valid information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    await ensureLoginPageReady(page)
  })

  test('1.1. Navigate to the login URL', async ({ page }) => {
    // Expected result: User should be redirected to the login page
    await expect(page.locator('#login-step-one-box')).toBeVisible()
  })

  test('1.2. Enter your username and password', async ({ page }) => {
    await page.fill('#username', CREDENTIALS.REGISTRAR)
    await page.fill('#password', TEST_USER_PASSWORD)
    await page.click('#login-mobile-submit')

    // Expected result: User should navigate to the next page to verify through mobile number or email address
    await expect(page.locator('#login-step-two-box')).toBeVisible()
  })

  test.describe.skip('1.3. Validate 2FA', () => {
    test('Validate the SMS for 2fa', async () => {})
    test('Validate the email for 2fa', async () => {})
  })

  test('1.4. Verify through by inputting the 2FA code', async ({ page }) => {
    await page.fill('#username', CREDENTIALS.REGISTRAR)
    await page.fill('#password', TEST_USER_PASSWORD)
    await page.click('#login-mobile-submit')

    await page.fill('#code', '000000')
    await page.click('#login-mobile-submit')
  })
})
