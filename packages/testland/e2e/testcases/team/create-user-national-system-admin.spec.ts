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
import path from 'path'
import { continueForm, login, loginWithNewUser } from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { ASSETS_DIR } from '@e2e/support/paths'

test.describe.serial('1. Create user -1', () => {
  let page: Page
  const userinfo = {
    firstName: faker.person.firstName('male'),
    surname: faker.person.lastName('male'),
    email: faker.internet.email(),
    role: 'Registrar'
  }
  const signaturePath = path.join(ASSETS_DIR, 'sign1.png')
  const username = `${userinfo.firstName[0]}.${userinfo.surname}`.toLowerCase()
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 User creation started by national system admin', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(
        page.locator('#location-range-picker-action').getByText('HQ Office')
      ).toBeVisible()

      await page.getByRole('button', { name: /HQ Office/ }).click()
      await page.getByTestId('locationSearchInput').fill('Klow')

      await page.getByText(/Klow Village Hospital/).click()

      await page.click('#add-user')
      await expect(page.getByText('User details')).toBeVisible()
    })

    test('1.1.1 Fill user details', async () => {
      await page.locator('#surname').fill(userinfo.surname)
      await page.locator('#firstname').fill(userinfo.firstName)
      await page.locator('#email').fill(userinfo.email)
      await page.locator('#role').click()
      await page.getByText(userinfo.role, { exact: true }).click()
      await continueForm(page)
    })

    // @TODO: requires file upload support in events service.
    test('1.1.2 Upload Signature', async () => {
      await page.setInputFiles('input[type="file"]', signaturePath)
      await continueForm(page)
    })

    test('1.1.2 Create user', async () => {
      await page.getByRole('button', { name: 'Create user' }).click()

      await expect(page.locator('#header')).toContainText(
        'Klow Village Hospital'
      )

      await expect(
        page.getByText('Klow, Ibombo, Central', {
          exact: true
        })
      ).toBeVisible()
    })
  })

  test.describe('2.1 Login with newly created user credentials', () => {
    test('2.1.1 Enter your username and password', async ({ page }) => {
      await loginWithNewUser(page, username)
    })
  })
})

test('Browser back on the user creation form returns to the team page', async ({
  page
}) => {
  await test.step('Log in', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
  })

  await test.step('Open a location team page', async () => {
    await page.getByRole('button', { name: 'Team' }).click()
    await expect(
      page.locator('#location-range-picker-action').getByText('HQ Office')
    ).toBeVisible()

    await page.getByRole('button', { name: /HQ Office/ }).click()
    await page.getByTestId('locationSearchInput').fill('Klow')
    await page.getByText(/Klow Village Hospital/).click()

    await expect(page.locator('#add-user').first()).toBeVisible()
  })

  await test.step('Open the user creation form', async () => {
    await page.locator('#add-user').first().click()
    await expect(page.getByText('User details')).toBeVisible()
  })

  await test.step('Browser back returns to the team page', async () => {
    await page.goBack()

    // Back on the team page: the "add user" action is available again and the creation form is gone.
    await expect(page.locator('#add-user').first()).toBeVisible()
    await expect(page.getByText('User details')).toBeHidden()
  })
})
