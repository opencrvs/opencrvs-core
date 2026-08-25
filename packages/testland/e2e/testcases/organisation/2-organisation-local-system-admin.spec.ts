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
test.describe.serial('2. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  //User: Local System Admin(e.mayuka)
  //Scope: Ibombo, Central,Farajaland

  test.describe.serial('2.1 UI check', async () => {
    test('2.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('2.1.1 Verify Province -> District -> Health Facility', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /^Ibombo$/ }).click()
      await page.getByRole('button', { name: /Klow/ }).click()

      await page.getByRole('button', { name: /Klow Village Hospital/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Klow Village Hospital/
      )
      await expect(
        page.getByText('Klow, Ibombo, Central', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeHidden()
    })
    test('2.1.2 Verify Province -> District -> District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /^Ibombo$/ }).click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Ibombo District Office/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
    })
    test('2.1.3 Verify Team Members Status', async () => {
      const ibomboMembers = ['Felix Katongo', 'Kennedy Mweene']
      await verifyMembersClickable(
        page,
        ibomboMembers,
        'Ibombo District Office'
      )
    })
  })

  test.describe.serial('2.2 Out of Scope Access', async () => {
    test('2.2.1 Verify Province -> District -> Health Facility', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()
      await expect(
        page.getByRole('button', { name: /Ilanga District Hospital/ })
      ).toBeDisabled()
    })

    test('2.2.2 Verify Province -> District -> District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')

      await page.getByRole('button', { name: /Chuminga/ }).click()
      await page.getByRole('button', { name: /Ama/ }).click()

      await expect(
        page.getByRole('button', { name: /Ama District Office/ })
      ).toBeDisabled()
    })

    test('2.2.3 Verify Embassy', async () => {
      await page.getByRole('button', { name: /Organisation/ }).click()

      await expect(
        await findOnOrganisationPage(page, /UK Embassy Office/)
      ).toBeDisabled()
    })
  })
})
