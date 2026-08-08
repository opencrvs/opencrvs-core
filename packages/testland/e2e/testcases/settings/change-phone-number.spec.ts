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
import { CLIENT_URL, CREDENTIALS, GATEWAY_HOST } from '../../constants'
import {
  createPIN,
  getToken,
  getAuthTokens,
  login,
  loginWithNewUser,
  NEW_USER_PASSWORD,
  waitForAuthenticatedLanding
} from '../../helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { faker } from '@faker-js/faker'
import { getIdByName, getLocations } from '../birth/helpers'

test('Phone number changed from settings is stored as entered', async ({
  browser
}) => {
  // Covers two full logins plus the account setup flow
  test.setTimeout(180_000)

  const page = await browser.newPage()

  const name = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const fullName = `${name.firstname} ${name.surname}`
  const username = `${name.firstname[0]}.${name.surname}`.toLowerCase()
  const newPhoneNumber = `07${faker.string.numeric(8)}`

  await test.step('Create a new user through API', async () => {
    const token = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

    const offices = await getLocations('CRVS_OFFICE', token)
    const quanzaVillageOfficeId = getIdByName(offices, 'Quanza Village Office')

    const user = {
      name,
      role: 'COMMUNITY_LEADER',
      primaryOfficeId: quanzaVillageOfficeId,
      mobile: `07${faker.string.numeric(8)}`,
      email: faker.internet.email(),
      fullHonorificName: fullName,
      device: 'web',
      data: {}
    }

    await client.user.create.mutate(user)
  })

  await test.step('Complete account setup for the new user', async () => {
    await loginWithNewUser(page, username)
  })

  await test.step('Log in to the client as the new user', async () => {
    const { refreshToken } = await getAuthTokens(username, NEW_USER_PASSWORD)
    expect(refreshToken).toBeDefined()

    await page.goto(`${CLIENT_URL}?refreshToken=${refreshToken}`)
    await waitForAuthenticatedLanding(page)
    await createPIN(page)
    await page.goto(CLIENT_URL)
  })

  await test.step('Change phone number from settings', async () => {
    await page.getByRole('button', { name: 'Profile' }).click()
    await page
      .locator('#ProfileMenu-Dropdown-Content')
      .waitFor({ state: 'visible' })
    await page.locator('li').filter({ hasText: 'Settings' }).click()

    await page.getByTestId('change-phone-button').first().click()
    await page.locator('#PhoneNumber').fill(newPhoneNumber)
    await page.locator('#continue-button').click()

    await page.locator('#VerifyCode').fill('000000')
    await page.locator('#verify-button').click()

    await expect(page.getByText('Phone number updated')).toBeVisible()
  })

  await test.step('New number is shown as entered on the settings page', async () => {
    await expect(page.getByTestId('phone-number-value')).toHaveText(
      newPhoneNumber
    )
  })

  await test.step('Phone number is correct when viewed by national system admin', async () => {
    const adminPage = await browser.newPage()
    await login(adminPage, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

    await adminPage.getByRole('button', { name: 'Team' }).click()

    await adminPage.locator('#location-range-picker-action').first().click()
    await adminPage.getByTestId('locationSearchInput').fill('Quanza')
    await adminPage
      .getByText(/Quanza Village Office/)
      .first()
      .click()

    await adminPage.getByRole('button', { name: fullName }).click()
    await expect(adminPage.locator('#content-name')).toHaveText(fullName)

    await adminPage
      .locator('//nav[@id="sub-page-header-munu-button-dropdownMenu"]')
      .click()
    await adminPage.getByText('Edit details').click()
    await expect(adminPage.getByText('Confirm details')).toBeVisible()

    await expect(adminPage.getByTestId('phoneNumber-value')).toHaveText(
      newPhoneNumber
    )

    await adminPage.close()
  })

  await page.close()
})
