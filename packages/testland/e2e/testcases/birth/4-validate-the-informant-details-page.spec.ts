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
import { test, expect, Page } from '@playwright/test'
import { goToSection, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { trackAndDeleteCreatedEvents } from '@e2e/support/test-data/eventDeletion'

test.describe('4. Validate the informants details pages', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  trackAndDeleteCreatedEvents()

  test.describe.serial('4.1 Validate "Phone number" text field', async () => {
    test('4.1.1 Enter Non-valid phone number', async () => {
      await page.locator('#informant____phoneNo').fill('1234567890')
      await page.getByRole('heading', { name: 'Birth', exact: true }).click()
      await expect(page.locator('#informant____phoneNo_error')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    test('4.1.2 Navigate to review page and check for error', async () => {
      await goToSection(page, 'review')
      await expect(page.getByTestId('informant.phoneNo-value')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    test('4.1.3 Change phone number to empty', async () => {
      await page.getByTestId('change-button-informant.phoneNo').click()
      await page.getByText('Continue').click()
      await page.locator('#informant____phoneNo').fill('')
      await page.getByRole('heading', { name: 'Birth', exact: true }).click()

      await expect(page.locator('#informant____phoneNo_error')).toBeHidden()
    })

    test('4.1.4 Navigate to review page and check that error does not appear', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
      await expect(page.getByTestId('informant.phoneNo-value')).toBeEmpty()
    })
  })
})
