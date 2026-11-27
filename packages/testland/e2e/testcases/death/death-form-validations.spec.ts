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
import { login } from '@e2e/support/helpers'

test('Death form - date validations', async ({ page }) => {
  await test.step('Log in', async () => {
    await login(page)
  })

  await test.step('Start death event declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Input valid deceased date-of-birth', async () => {
    await page.getByPlaceholder('dd').fill('22')
    await page.getByPlaceholder('mm').fill('09')
    await page.getByPlaceholder('yyyy').fill('1993')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#deceased____dob_error')).not.toBeVisible()
  })

  await test.step('Navigate to event details section', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Input date-of-death which is before date-of-birth, expect to see validation error', async () => {
    await page.getByPlaceholder('dd').fill('09')
    await page.getByPlaceholder('mm').fill('10')
    await page.getByPlaceholder('yyyy').fill('1990')

    await page.getByPlaceholder('yyyy').blur()

    await expect(
      page.getByText("Date of death must be after the deceased's birth date")
    ).toBeVisible()
  })

  await test.step('Input date-of-death which is after date-of-birth, expect to see no validation error', async () => {
    await page.getByPlaceholder('dd').fill('09')
    await page.getByPlaceholder('mm').fill('10')
    await page.getByPlaceholder('yyyy').fill('1995')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#eventDetails____date_error')).not.toBeVisible()
  })

  await test.step('Go back to deceased details section', async () => {
    await page.getByRole('button', { name: 'Back' }).click()
  })

  await test.step('Input invalid deceased date-of-birth, expect to see validation error', async () => {
    await page.getByPlaceholder('dd').fill('22')
    await page.getByPlaceholder('mm').fill('09')
    await page.getByPlaceholder('yyyy').fill('1996')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#deceased____dob_error')).toHaveText(
      'Date of birth must be before the date of death'
    )
  })

  await test.step('Input valid deceased date-of-birth, expect to see no validation error', async () => {
    await page.getByPlaceholder('dd').fill('22')
    await page.getByPlaceholder('mm').fill('10')
    await page.getByPlaceholder('yyyy').fill('1988')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#deceased____dob_error')).not.toBeVisible()
  })
})
