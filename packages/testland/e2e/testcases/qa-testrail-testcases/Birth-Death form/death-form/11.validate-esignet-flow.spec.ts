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
import { login } from '../../../../helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validation of e-signet flow for informants/deceased/spouse
 * details page".
 *
 * Correction to the QA doc: the deceased page passes `esignet: false`
 * (packages/testland/src/events/death/forms/pages/deceased.ts:153-156), so
 * it has NO e-signet button at all - only a QR-scan option (covered in
 * 10.validate-mosip-integration.spec.ts). This spec therefore only
 * exercises the informant (when not Spouse) and spouse pages, both of
 * which default `esignet: true`.
 */

async function authenticateWithESignet(page: Page) {
  await page
    .getByRole('link', { name: 'Authenticate with National ID system' })
    .click()

  await expect(page).toHaveURL(/authorize/)
  await page.locator('#id-input').fill('1234567892')
  await page.locator('#authenticate').click()
  await expect(page).not.toHaveURL(/authorize/)
}

const beginAtInformantPage = async (page: Page) => {
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

  await page.locator('#informant____relation').click()
  await page.getByText('Son', { exact: true }).click()
}

trackAndDeleteCreatedEvents()

test('1-4. Complete e-signet flow for the Informant, validate populated data and the Revoke button', async ({
  page
}) => {
  await beginAtInformantPage(page)

  await test.step('1. Complete e-signet flow', async () => {
    await authenticateWithESignet(page)

    /*
     * Expected result: shows a block with the "ID Authenticated" pill, the
     * authenticated verbiage and a Revoke button
     */
    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })
    await expect(
      page.getByText(
        'This identity has been successfully authenticated with the Farajaland’s National ID System. To make edits, please remove the authentication first.'
      )
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Revoke' })).toBeVisible()
  })

  await test.step('2. Verify correct data being placed according to e-signet', async () => {
    /*
     * Expected result: Name and Date of birth are inserted from the
     * e-signet response - there is no gender field on the informant page,
     * unlike a literal reading of the QA case's "Name, Date of birth and
     * Gender" line might suggest.
     */
    await expect(page.locator('#firstname')).toHaveValue('John')
    await expect(page.locator('#surname')).toHaveValue('Doe')
    await expect(page.locator('#informant____dob-dd')).toHaveValue('20')
    await expect(page.locator('#informant____dob-mm')).toHaveValue('02')
    await expect(page.locator('#informant____dob-yyyy')).toHaveValue('2001')
  })

  await test.step('3. Try to change auto-populated values after e-signet flow', async () => {
    await expect(page.locator('#firstname')).toBeDisabled()
    await expect(page.locator('#surname')).toBeDisabled()
    await expect(page.locator('#informant____nid')).toBeHidden()
  })

  await test.step('4. Click "Revoke"', async () => {
    await page.getByRole('button', { name: 'Revoke' }).click()

    await expect(
      page.getByRole('heading', { name: 'Revoke authenticated ID?' })
    ).toBeVisible()
    await expect(
      page.getByText(
        'By clicking ‘Continue,’ you’ll remove ID Authenticated status and unlock the fields for editing.'
      )
    ).toBeVisible()

    await page.locator('#cancel').click()
    await expect(page.getByText('ID Authenticated')).toBeVisible()

    await page.getByRole('button', { name: 'Revoke' }).click()
    await page.locator('#confirm').click()

    /*
     * Expected result: fields reset, QR-scan/e-signet buttons reappear
     */
    await expect(page.getByText('ID Authenticated')).toBeHidden()
    await expect(page.locator('#firstname')).toHaveValue('')
    await expect(
      page.getByRole('button', { name: 'Scan QR code' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Authenticate with National ID system'
      })
    ).toBeVisible()
  })
})

test('1-4. Complete e-signet flow for the Spouse page', async ({ page }) => {
  await beginAtInformantPage(page)
  await page.locator('#informant____email').fill('son@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText('Spouse details', { exact: true })
  ).toBeVisible()

  await test.step('1. Complete e-signet flow', async () => {
    await authenticateWithESignet(page)

    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })
    await expect(page.getByRole('button', { name: 'Revoke' })).toBeVisible()
  })

  await test.step('2. Verify correct data being placed according to e-signet', async () => {
    await expect(page.locator('#firstname')).toHaveValue('John')
    await expect(page.locator('#surname')).toHaveValue('Doe')
  })

  await test.step('3. Try to change auto-populated values after e-signet flow', async () => {
    await expect(page.locator('#firstname')).toBeDisabled()
    await expect(page.locator('#spouse____nid')).toBeHidden()
  })

  await test.step('4. Click "Revoke"', async () => {
    await page.getByRole('button', { name: 'Revoke' }).click()
    await page.locator('#confirm').click()

    await expect(page.getByText('ID Authenticated')).toBeHidden()
    await expect(page.locator('#firstname')).toHaveValue('')
  })
})

// @TODO: no confirmed, deterministic way to make the mosip-mock service
// return a failed e-signet lookup from Playwright yet - see birth's
// 10.validate-esignet-flow.spec.ts file-level note.
test.skip('5. Validate the functionality when authentication fails', async () => {})
