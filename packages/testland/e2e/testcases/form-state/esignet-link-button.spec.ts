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
import { Page, expect, test } from '@playwright/test'
import { goToSection, login } from '@e2e/support/helpers'
import { openBirthDeclaration } from '@e2e/support/birth/helpers'

async function authenticateInformantWithESignet(page: Page) {
  await page.locator('#informant____verify').click()

  // Only tested with mosip-mock so far
  // https://github.com/opencrvs/mosip/blob/release-v1.8.0/packages/esignet-mock/src/index.ts#L166
  await expect(page).toHaveURL(/authorize/)
  // https://github.com/opencrvs/mosip/blob/release-v1.8.0/docs/mock-identities.json#L24
  await page.locator('#id-input').fill('1234567892')
  await page.locator('#authenticate').click()
  await expect(page).not.toHaveURL(/authorize/)
}

test.describe
  .serial('E-Signet LINK_BUTTON inserts and locks informant data', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page)
  })

  test('Name and DOB are inserted+disabled, National ID is unavailable', async () => {
    await openBirthDeclaration(page)
    await goToSection(page, 'informant')

    await page.locator('#informant____relation').click()
    await page.getByText('Brother', { exact: true }).click()

    await authenticateInformantWithESignet(page)

    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })

    await expect(page.locator('#firstname')).toHaveValue('John')
    await expect(page.locator('#surname')).toHaveValue('Doe')
    await expect(page.locator('#firstname')).toBeDisabled()
    await expect(page.locator('#surname')).toBeDisabled()

    await expect(page.locator('#informant____dob-dd')).toHaveValue('20')
    await expect(page.locator('#informant____dob-mm')).toHaveValue('02')
    await expect(page.locator('#informant____dob-yyyy')).toHaveValue('2001')

    await expect(page.locator('#informant____dob-dd')).toBeDisabled()
    await expect(page.locator('#informant____dob-mm')).toBeDisabled()
    await expect(page.locator('#informant____dob-yyyy')).toBeDisabled()

    await expect(page.locator('#informant____nid')).toBeHidden()
  })

  test.skip('Handle surnames with spaces', async () => {})
})
