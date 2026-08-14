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
import { openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validation of data limit for all name edit text" - the
 * First name(s)/Last name fields on Child's, Mother's and Father's details
 * pages all share `farajalandNameConfig.maxLength = MAX_NAME_LENGTH = 32`
 * (packages/testland/src/events/birth/validators.ts).
 */

const THIRTY_TWO_OR_LESS = 'Rakibul Islam Khandaker Mia'
const MORE_THAN_THIRTY_TWO = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'

trackAndDeleteCreatedEvents()

test('1. Validate the Child\'s details page name fields', async ({
  page
}) => {
  await login(page)
  await openBirthDeclaration(page)

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

test("2. Validate the Mother's details page name fields", async ({
  page
}) => {
  await login(page)
  await openBirthDeclaration(page)
  await page.locator('#firstname').fill('Rakibul')
  await page.locator('#surname').fill('Islam')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Brother', { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText("Mother's details", { exact: true })
  ).toBeVisible()

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

test("3. Validate the Father's details page name fields", async ({
  page
}) => {
  await login(page)
  await openBirthDeclaration(page)
  await page.locator('#firstname').fill('Rakibul')
  await page.locator('#surname').fill('Islam')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Brother', { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText("Father's details", { exact: true })
  ).toBeVisible()

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
