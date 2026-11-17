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

test('Advanced Search - Birth Event Declaration', async ({ page }) => {
  await test.step('0.1 - Validate navigating to advanced search', async () => {
    await login(page)

    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await expect(
      page.getByText('Select the options to build an advanced search.')
    ).toBeVisible()
  })

  await test.step('0.3 - Validate display child details when selecting Birth', async () => {
    await page.getByText('Birth').click()
    await expect(page.getByText('Child details')).toBeVisible()
  })

  await test.step('0.4 - Validate Search button disabled when form is incomplete', async () => {
    const searchButton = page.locator('#search')
    await expect(searchButton).toBeDisabled()
  })
})
