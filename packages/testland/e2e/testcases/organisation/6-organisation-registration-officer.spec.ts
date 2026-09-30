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
import { test, expect, type Page } from '@playwright/test'
import { login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { verifyMembersEnabled } from '@e2e/support/birth/helpers'
import { navigateToWorkqueue } from '@e2e/support/utils'
test.describe.serial('6. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('6.1 Basic UI check', async () => {
    test('6.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })

    test('6.1.1 Verify team page member list of District Office', async () => {
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /^Ibombo$/ }).click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()

      const enabledMembers = ['Felix Katongo', 'Kennedy Mweene']

      await verifyMembersEnabled(page, enabledMembers)
    })

    test('6.1.2 Verify Province -> District -> Health Facility', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /^Ibombo$/ }).click()

      await expect(
        page.getByRole('button', { name: /Ibombo District Hospital/ })
      ).toBeEnabled()
    })

    // @TODO: https://github.com/opencrvs/opencrvs-core/issues/11756
    test.skip('6.1.3 Verify Province -> District -> District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()

      await expect(
        page.getByRole('button', { name: /Ilanga District Office/ })
      ).toBeDisabled()
    })
  })
})
