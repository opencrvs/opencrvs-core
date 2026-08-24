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
import { CREDENTIALS } from '../../constants'
import { login } from '../../helpers'
import { faker } from '@faker-js/faker'

test('Email and phone changed from settings are reflected in user details', async ({
  browser
}) => {
  // Two full logins (f.katongo + j.campbell) plus contact change flows
  test.setTimeout(240_000)

  const page = await browser.newPage()
  const newEmail = faker.internet.email().toLowerCase()
  const newPhoneNumber = `07${faker.string.numeric(8)}`

  await test.step('Log in as f.katongo', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Navigate to settings', async () => {
    await page.getByRole('button', { name: 'Profile' }).click()
    await page
      .locator('#ProfileMenu-Dropdown-Content')
      .waitFor({ state: 'visible' })
    await page.locator('li').filter({ hasText: 'Settings' }).click()
  })

  await test.step('Change email address', async () => {
    await page.getByTestId('change-email-address').first().click()
    await page.locator('#EmailAddressTextInput').fill(newEmail)
    await page.locator('#continue-button').click()

    await page.locator('#VerifyCode').fill('000000')
    await page.locator('#verify-button').click()

    await expect(page.getByText('Email Address updated')).toBeVisible()
  })

  await test.step('New email is shown on the settings page', async () => {
    await expect(page.getByTestId('email-address-value')).toHaveText(newEmail)
  })

  await test.step('Change phone number', async () => {
    await page.getByTestId('change-phone-button').first().click()
    await page.locator('#PhoneNumber').fill(newPhoneNumber)
    await page.locator('#continue-button').click()

    await page.locator('#VerifyCode').fill('000000')
    await page.locator('#verify-button').click()

    await expect(page.getByText('Phone number updated')).toBeVisible()
  })

  await test.step('New phone number is shown on the settings page', async () => {
    await expect(page.getByTestId('phone-number-value')).toHaveText(
      newPhoneNumber
    )
  })

  await test.step('Both updates are reflected in user details viewed by national system admin', async () => {
    const adminPage = await browser.newPage()
    await login(adminPage, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

    await adminPage.getByRole('button', { name: 'Team' }).click()

    await adminPage.locator('#location-range-picker-action').first().click()
    await adminPage.getByTestId('locationSearchInput').fill('Ibombo')
    await adminPage
      .getByText(/Ibombo District Office/)
      .first()
      .click()

    await adminPage.getByRole('button', { name: 'Felix Katongo' }).click()
    await expect(adminPage.locator('#content-name')).toHaveText('Felix Katongo')

    await adminPage
      .locator('//nav[@id="sub-page-header-munu-button-dropdownMenu"]')
      .click()
    await adminPage.getByText('Edit details').click()
    await expect(adminPage.getByText('Confirm details')).toBeVisible()

    await expect(adminPage.getByTestId('email-value')).toHaveText(newEmail)
    await expect(adminPage.getByTestId('phoneNumber-value')).toHaveText(
      newPhoneNumber
    )

    await adminPage.close()
  })

  await page.close()
})
