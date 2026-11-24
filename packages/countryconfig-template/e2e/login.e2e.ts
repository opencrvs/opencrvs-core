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
  GATEWAY_URL,
  LOGIN_URL,
  TEST_PASSWORD,
  TEST_USERNAME
} from './constants'

/*
 * Sample smoke tests. Replace or extend these with tests covering your own
 * forms, workqueues and certificates.
 */
test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    // Wait until the login app has loaded the country logo from countryconfig
    await page.waitForFunction(
      () => !!document.querySelector<HTMLImageElement>('#Box img')?.src
    )
  })

  test('shows the login form', async ({ page }) => {
    await expect(page.locator('#login-step-one-box')).toBeVisible()
  })

  test('rejects an invalid password', async ({ page }) => {
    await page.fill('#username', TEST_USERNAME)
    await page.fill('#password', 'wrong-password')
    await page.click('#login-mobile-submit')

    // Message comes from login.submissionError in src/translations/login.csv
    await expect(page.getByText('Incorrect username or password')).toBeVisible()
  })

  test('asks for a verification code after valid credentials', async ({
    page
  }) => {
    await page.fill('#username', TEST_USERNAME)
    await page.fill('#password', TEST_PASSWORD)
    await page.click('#login-mobile-submit')

    await expect(page.locator('#login-step-two-box')).toBeVisible()
  })
})

test('gateway is healthy', async ({ request }) => {
  const response = await request.get(`${GATEWAY_URL}/ping`)
  expect(response.ok()).toBeTruthy()
})
