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
import { test, expect } from '@playwright/test'
import { login } from '../../../../helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validation of data limit for all name edit text" (death
 * variant) - the QA doc only lists the Deceased's and Informant's details
 * pages (step 1 -> "Go to step 5: Deceased's details", step 2 -> "Go to
 * step 11: Informant's details") - unlike birth's equivalent, which also
 * covers a third page (Father's). Spouse's name field shares the same
 * `farajalandNameConfig` (32-char max) but isn't part of this QA case's own
 * text, so it's left to 6.validate-spouse-details-page.spec.ts.
 */

const THIRTY_TWO_OR_LESS = 'Rakibul Islam Khandaker Mia'
const MORE_THAN_THIRTY_TWO = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'

trackAndDeleteCreatedEvents()

test("1. Validate the Deceased's details page name fields", async ({
  page
}) => {
  await login(page)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await test.step('Enter 32 or less characters', async () => {
    await page.locator('#firstname').fill(THIRTY_TWO_OR_LESS)
    await expect(page.locator('#firstname')).toHaveValue(THIRTY_TWO_OR_LESS)
    await page.locator('#surname').fill(THIRTY_TWO_OR_LESS)
    await expect(page.locator('#surname')).toHaveValue(THIRTY_TWO_OR_LESS)
  })

  await test.step('Enter more than 32 characters is clipped', async () => {
    await page.locator('#firstname').fill(MORE_THAN_THIRTY_TWO)
    await expect(page.locator('#firstname')).toHaveValue(
      MORE_THAN_THIRTY_TWO.slice(0, 32)
    )
    await page.locator('#surname').fill(MORE_THAN_THIRTY_TWO)
    await expect(page.locator('#surname')).toHaveValue(
      MORE_THAN_THIRTY_TWO.slice(0, 32)
    )
  })
})

test("2. Validate the Informant's details page name fields", async ({
  page
}) => {
  await login(page)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#firstname').fill('Richard')
  await page.locator('#surname').fill('Doppler')
  await page.getByRole('button', { name: 'Continue' }).click()

  const dateOfDeath = new Date()
  dateOfDeath.setDate(dateOfDeath.getDate() - 5)
  const [yyyy, mm, dd] = dateOfDeath.toISOString().split('T')[0].split('-')
  await page.getByPlaceholder('dd').fill(dd)
  await page.getByPlaceholder('mm').fill(mm)
  await page.getByPlaceholder('yyyy').fill(yyyy)
  await page.locator('#eventDetails____placeOfDeath').click()
  await page.getByText('Health Institution', { exact: true }).click()
  await page
    .locator('#searchable-select-eventDetails____deathLocation input')
    .fill('ib')
  await page.getByText('Ibombo District Hospital').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByText("Informant's details")).toBeVisible()
  await page.locator('#informant____relation').click()
  await page.getByText('Son', { exact: true }).click()

  await test.step('Enter 32 or less characters', async () => {
    await page.locator('#firstname').fill(THIRTY_TWO_OR_LESS)
    await expect(page.locator('#firstname')).toHaveValue(THIRTY_TWO_OR_LESS)
    await page.locator('#surname').fill(THIRTY_TWO_OR_LESS)
    await expect(page.locator('#surname')).toHaveValue(THIRTY_TWO_OR_LESS)
  })

  await test.step('Enter more than 32 characters is clipped', async () => {
    await page.locator('#firstname').fill(MORE_THAN_THIRTY_TWO)
    await expect(page.locator('#firstname')).toHaveValue(
      MORE_THAN_THIRTY_TWO.slice(0, 32)
    )
    await page.locator('#surname').fill(MORE_THAN_THIRTY_TWO)
    await expect(page.locator('#surname')).toHaveValue(
      MORE_THAN_THIRTY_TWO.slice(0, 32)
    )
  })
})
