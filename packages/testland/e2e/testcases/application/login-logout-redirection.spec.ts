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
import { test, type Page, expect } from '@playwright/test'
import { login, logout } from '@e2e/support/helpers'
import { CREDENTIALS, LOGIN_URL } from '@e2e/support/constants'
import { setMobileViewport } from '@e2e/support/mobile-helpers'

test.describe('Desktop', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Logging in twice in a row', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await logout(page)

    await page.waitForURL((url) => {
      return url.origin === LOGIN_URL
    })

    const url = new URL(page.url())

    const redirectTo = url.searchParams.get('redirectTo')
    expect(redirectTo).toBe(null)
    const lang = url.searchParams.get('lang')
    expect(lang).toBe('en')

    await login(page, CREDENTIALS.REGISTRAR, true)

    // Crashed previously due bad redirect value
    await expect(page.getByText('Farajaland CRS')).toBeVisible({
      timeout: 15_000
    })
  })
})

test.describe('Mobile', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await setMobileViewport(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Logging in twice in a row', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await logout(page)

    await page.waitForURL((url) => {
      return url.origin === LOGIN_URL
    })

    const url = new URL(page.url())
    const redirectTo = url.searchParams.get('redirectTo')
    expect(redirectTo).toBe(null)
    const lang = url.searchParams.get('lang')
    expect(lang).toBe('en')

    await login(page, CREDENTIALS.REGISTRAR, true)

    // Crashed previously due bad redirect value.
    await expect(
      page.getByRole('heading', { name: 'Assigned to you' })
    ).toBeVisible({ timeout: 15_000 })
  })
})
