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
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import {
  continueForm,
  continueUntilReview,
  drawSignature,
  getToken,
  login
} from '@e2e/support/helpers'
import { expectInUrl } from '@e2e/support/utils'
import { createClient } from '@opencrvs/toolkit/api'
import { faker } from '@faker-js/faker'
import { getIdByName, getLocations } from '@e2e/support/birth/helpers'

test('Basic UI check', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('Verify UI', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    await page.getByRole('button', { name: 'Team' }).click()
    await expect(page.locator('#content-name')).toHaveText('HQ Office')
  })

  await test.step('Verify Team Members Status', async () => {
    const row1 = page.getByRole('row', { name: /Mutale Musonda/ })
    await expect(row1.getByText('Active')).toBeVisible()
    const row2 = page.getByRole('row', { name: /Chipo Lungu/ })
    await expect(row2.getByText('Active')).toBeVisible()
    const row3 = page.getByRole('row', { name: /Jonathan Campbell/ })
    await expect(row3.getByText('Active')).toBeVisible()
  })

  await test.step('should be able to only find locations with location picker, not administrative areas', async () => {
    await page.getByRole('button', { name: 'HQ Office' }).click()
    await page.getByTestId('locationSearchInput').fill('Aman')

    await expect(
      page.getByText('Amani Village Office, Amani, Irundu, Sulaka', {
        exact: true
      })
    ).toBeVisible()

    await expect(
      page.getByText('Amani, Irundu, Sulaka', { exact: true })
    ).not.toBeVisible()
  })
})

const TEST_OFFICE = 'Bakari Village Office'

test('User Account Actions', async ({ browser }) => {
  const page = await browser.newPage()

  const name = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const fullName = `${name.firstname} ${name.surname}`

  /*
   * A user is created for every run in an office no other test touches, so that
   * editing it below does not mutate users other tests rely on.
   */
  await test.step(`Create a new user in ${TEST_OFFICE}`, async () => {
    const token = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
    const offices = await getLocations('CRVS_OFFICE', token)

    await client.user.create.mutate({
      name,
      // Registrar roles have the 'profile.electronic-signature' scope, which is
      // what makes the signature page part of the edit form below.
      role: 'LOCAL_REGISTRAR',
      primaryOfficeId: getIdByName(offices, TEST_OFFICE),
      mobile: `07${faker.string.numeric(8)}`,
      email: faker.internet.email(),
      fullHonorificName: fullName,
      device: 'web',
      data: {}
    })
  })

  await test.step('Login and navigate to edit details page', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    await page.getByRole('button', { name: 'Team' }).click()

    await page.getByRole('button', { name: 'HQ Office' }).click()
    await page.getByTestId('locationSearchInput').fill(TEST_OFFICE)
    await page.getByText(new RegExp(TEST_OFFICE)).click()
    await expect(page.locator('#content-name')).toHaveText(TEST_OFFICE)

    const userRow = page.getByRole('row').filter({ hasText: fullName })
    await userRow.locator('nav[id$="-menu-dropdownMenu"]').click()
    await userRow.getByText('Edit details').click()
    await expect(page.getByText('Confirm details')).toBeVisible()
  })

  await test.step('Edit User Details', async () => {
    await expect(
      page
        .getByTestId('accordion-Accordion_user.office')
        .filter({ hasText: 'Registration Office' })
    ).toBeVisible()
  })

  let phoneNumber: string

  await test.step('Change Phone Number', async () => {
    phoneNumber = '0785963' + (Math.floor(Math.random() * 900) + 100)
    await page.getByTestId('change-button-phoneNumber').click()
    await page.locator('input[name="phoneNumber"]').fill(phoneNumber)
    await continueForm(page)
  })

  await test.step('Add signature', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'signature_canvas_element', false)
    await page.getByRole('button', { name: 'Apply' }).click()
  })

  await test.step('Submit the form', async () => {
    await continueUntilReview(page)
    await page.getByRole('button', { name: 'Confirm' }).click()
    expectInUrl(page, 'view')
  })

  await test.step('Verify Phone Number Changed', async () => {
    await page
      .locator('#sub-page-header-munu-button-dropdownMenu')
      .getByRole('button')
      .click()
    await page.getByText('Edit details').click()
    await expect(page.getByText('Confirm details')).toBeVisible()
    await expect(page.locator('#phoneNumber')).toContainText(phoneNumber)
  })
})
