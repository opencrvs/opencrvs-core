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
import { expect, test } from '@playwright/test'
import { login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { mockNetworkConditions } from '@e2e/support/mock-network-conditions'

const SKILL_LEVEL_MODULE =
  '/api/countryconfig/static/custom-fields/skill-level.js'

/*
 * The client loads the custom field modules of all events when the user logs
 * in, so a custom field works offline in a form that the user did not open
 * while online.
 */
test('Custom field works offline in a form not opened before', async ({
  page,
  context
}) => {
  await test.step('Log in and wait until the module is cached', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
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

  await test.step('Open the form and use the custom field', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Tennis club membership application').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('radio')).toHaveCount(5)
    await expect(page.getByText('Error loading component')).not.toBeVisible()

    await page.getByRole('radio', { name: '3 of 5' }).click()
    await expect(page.getByRole('radio', { name: '3 of 5' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })
})
