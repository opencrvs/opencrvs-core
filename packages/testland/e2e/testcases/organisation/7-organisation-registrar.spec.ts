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
import { findOnOrganisationPage, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { verifyMembersClickable } from '@e2e/support/birth/helpers'
import { navigateToWorkqueue } from '@e2e/support/utils'
test('7. Organisation Page', async ({ page }) => {
  await test.step('7.1 Basic UI check', async () => {
    await test.step('7.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    await test.step('7.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /^Ibombo$/ }).click()
      await page.getByRole('button', { name: /Klow/ }).click()

      await expect(
        page.getByRole('button', { name: /Klow Village Hospital/ })
      ).toBeEnabled()
    })
    await test.step('7.1.2 Verify Province -> District -> District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Chuminga/ }).click()
      await page.getByRole('button', { name: /Ama/ }).click()

      await expect(
        page.getByRole('button', { name: /Ama District Office/ })
      ).toBeDisabled()
    })
    await test.step('7.1.3 Verify Province -> District -> Different District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Organisation/ }).click()

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()

      await expect(
        page.getByRole('button', { name: /Ilanga District Office/ })
      ).toBeDisabled()
    })

    await test.step('7.1.4 Verify team page member list of District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /^Ibombo$/ }).click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()

      const members = ['Felix Katongo', 'Kennedy Mweene']

      await verifyMembersClickable(page, members, 'Ibombo District Office')
    })

    await test.step('7.1.5 Verify Embassy Office', async () => {
      await page.getByTestId('navigation_organisation').click()
      await expect(
        await findOnOrganisationPage(page, 'French Embassy Office')
      ).toBeDisabled()
    })
  })
})
