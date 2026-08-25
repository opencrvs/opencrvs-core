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
import { mockNetworkConditions } from '@e2e/support/mock-network-conditions'

test('Can Change Workqueue offline', async ({ page }) => {
  await login(page)
  await expect(page.getByText('Farajaland CRS')).toBeVisible({
    timeout: 30000
  })
  await expect(page.locator('#content-name')).toHaveText('Assigned to you')
  await mockNetworkConditions(page, 'offline')
  await page.getByRole('button', { name: 'Pending certification' }).click()
  await expect(page.locator('#content-name')).toHaveText(
    'Pending certification'
  )
})
