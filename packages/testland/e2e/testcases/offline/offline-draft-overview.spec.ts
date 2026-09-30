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

import { formatName, login } from '@e2e/support/helpers'
import { mockNetworkConditions } from '@e2e/support/mock-network-conditions'
import { faker } from '@faker-js/faker'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test.describe.serial('Can Open Draft offline', () => {
  let page: Page
  const name = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male')
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page)
    await expect(page.getByText('Farajaland CRS')).toBeVisible({
      timeout: 30000
    })
    await expect(page.locator('#content-name')).toHaveText('Assigned to you')
  })

  test('Create a draft', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(name.firstNames)
    await page.locator('#surname').fill(name.familyName)

    const draftResponse = page.waitForResponse(
      (res) => res.url().includes('event.draft.create') && res.ok()
    )
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await draftResponse
  })

  test('Open the draft offline', async () => {
    await mockNetworkConditions(page, 'offline')
    await page.getByRole('button', { name: 'Drafts' }).click()
    await expect(page.locator('#content-name')).toHaveText('Drafts')

    await openRecordByTitle(page, formatName(name))

    await expect(page.locator('#content-name')).toHaveText(formatName(name))
  })
})
