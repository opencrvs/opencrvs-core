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
import { expect, Page, test } from '@playwright/test'
import { login } from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import { mockNetworkConditions } from '@e2e/support/mock-network-conditions'
import { hasPrecachedBuildAssets } from '@e2e/support/service-worker'

const SKILL_LEVEL_MODULE =
  '/api/countryconfig/static/custom-fields/skill-level.js'

const SKIP_ON_DEVELOPMENT_SERVER =
  'The development server serves the client without a precache, so the app cannot work offline.'

async function openTennisClubForm(page: Page) {
  await page.click('#header-new-event')
  await page.getByLabel('Tennis club membership application').click()
  await page.getByRole('button', { name: 'Continue' }).click()
}

/*
 * The workqueue renders only after the custom field modules of all events are
 * loaded, as it does with the event configuration. So when the user sees the
 * workqueue, the forms work also if the user then goes offline.
 */
test('Custom field works offline right after the app opens', async ({
  page,
  context
}) => {
  await test.step('Log in', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await expect(page.locator('#content-name')).toHaveText('Assigned to you')
    test.skip(
      !(await hasPrecachedBuildAssets(page)),
      SKIP_ON_DEVELOPMENT_SERVER
    )
  })

  await test.step('Go offline', async () => {
    await context.setOffline(true)
    await mockNetworkConditions(page, 'offline')
  })

  await test.step('Open a form not opened before and use the custom field', async () => {
    await openTennisClubForm(page)

    await expect(page.getByRole('radio')).toHaveCount(5)
    await expect(page.getByText('Error loading component')).not.toBeVisible()

    await page.getByRole('radio', { name: '3 of 5' }).click()
    await expect(page.getByRole('radio', { name: '3 of 5' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })
})

/*
 * The service worker caches the custom field modules, so the app loads them
 * also when it is opened again offline.
 */
test('Custom field module loads from the cache when the app opens again offline', async ({
  page,
  context
}) => {
  await test.step('Log in, open the app again and wait until the module is cached', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await expect(page.locator('#content-name')).toHaveText('Assigned to you')
    test.skip(
      !(await hasPrecachedBuildAssets(page)),
      SKIP_ON_DEVELOPMENT_SERVER
    )

    /*
     * On the first visit, the app loads its country config before the service
     * worker is active, so the service worker does not cache it. The app is
     * opened again online, as a user does before they go offline.
     */
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
    })
    await page.goto(CLIENT_URL)
    await expect(page.locator('#content-name')).toHaveText('Assigned to you')

    /*
     * The response has `Vary: origin`, and the module request of the browser
     * sends an `Origin` header but `caches.match` does not, so the Vary check
     * must be skipped here.
     */
    await expect
      .poll(
        async () =>
          page.evaluate(async (url) => {
            const cached = await caches.match(url, { ignoreVary: true })
            const contentType = cached?.headers.get('content-type') ?? ''
            return contentType.includes('javascript')
          }, SKILL_LEVEL_MODULE),
        { timeout: 30000 }
      )
      .toBe(true)
  })

  await test.step('Go offline', async () => {
    await context.setOffline(true)
    await mockNetworkConditions(page, 'offline')
  })

  await test.step('Open the app again offline', async () => {
    const moduleResponse = page.waitForResponse((response) =>
      response.url().endsWith(SKILL_LEVEL_MODULE)
    )

    // The new page loads the module again, and only the service worker cache has it
    await page.goto(CLIENT_URL)

    const response = await moduleResponse
    expect(response.status()).toBe(200)
    expect(response.fromServiceWorker()).toBe(true)
  })
})
