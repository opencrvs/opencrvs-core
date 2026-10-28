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
import {
  formatName,
  goToSection,
  login,
  logout,
  switchEventTab
} from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { ensureAssignedToUser } from '@e2e/support/utils'
import {
  fillNotificationChildPage,
  generateBirthNotificationInputs,
  notifyFromReview,
  startBirthNotification
} from '@e2e/support/birth/notify'

// https://github.com/opencrvs/mosip/blob/release-v1.8.0/docs/mock-identities.json#L24
const MOCK_NID = '1234567892'

test("Hospital official authenticates the mother's National ID on a birth notification", async ({
  page
}) => {
  const inputs = generateBirthNotificationInputs()

  await test.step('Login as Hospital official', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
  })

  await test.step('Fill the child page', async () => {
    await startBirthNotification(page)
    await fillNotificationChildPage(page, inputs)
  })

  await test.step("Authenticate the mother's ID with E-Signet", async () => {
    await page.locator('#mother____verify').click()

    // Only tested with mosip-mock so far
    await page.waitForURL(/authorize/)
    await page.locator('#id-input').fill(MOCK_NID)
    await page.locator('#authenticate').click()

    // Wait until we are back on the app, not just away from eSignet
    await page.waitForURL((url) => url.origin === new URL(CLIENT_URL).origin)

    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })
  })

  await test.step('Name and DOB are inserted+disabled, ID fields are hidden', async () => {
    await expect(page.locator('#firstname')).toHaveValue('John')
    await expect(page.locator('#surname')).toHaveValue('Doe')
    await expect(page.locator('#firstname')).toBeDisabled()
    await expect(page.locator('#surname')).toBeDisabled()

    await expect(page.locator('#mother____dob-dd')).toHaveValue('20')
    await expect(page.locator('#mother____dob-mm')).toHaveValue('02')
    await expect(page.locator('#mother____dob-yyyy')).toHaveValue('2001')
    await expect(page.locator('#mother____dob-dd')).toBeDisabled()

    await expect(page.locator('#mother____idType')).toBeHidden()
    await expect(page.locator('#mother____nid')).toBeHidden()
  })

  await test.step('Notify', async () => {
    await page.locator('#informant____email').fill(inputs.informantEmail)
    await goToSection(page, 'review')

    // Child details survive the round trip to E-Signet
    await expect(page.getByTestId('child.name-value')).toHaveText(
      formatName(inputs.child.name)
    )
    await expect(page.getByTestId('mother.name-value')).toHaveText('John Doe')
    await expect(page.getByText('ID Authenticated')).toBeVisible()

    await notifyFromReview(page)
  })

  await test.step('Registration officer sees the authenticated mother on the record', async () => {
    await logout(page)
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formatName(inputs.child.name))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await switchEventTab(page, 'Record')

    await expect(page.getByTestId('mother.name-value')).toHaveText('John Doe')
    await expect(page.getByText('ID Authenticated')).toBeVisible()
  })
})
