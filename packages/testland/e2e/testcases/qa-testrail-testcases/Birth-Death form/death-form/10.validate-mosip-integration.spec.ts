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
 * QA case: "Validation of MOSIP integration for informants/ deceased/
 * spouse details page" - the QR_READER half of the `ID_READER` field.
 *
 * Correction to the QA doc: the deceased page passes `esignet: false` to
 * `getMOSIPIntegrationFields` (packages/testland/src/events/death/forms/pages/deceased.ts:153-156),
 * so it only offers the QR-scan button, not "Authenticate with National ID
 * system" - unlike the informant (when not Spouse) and spouse pages, which
 * both default `esignet: true`. See 11.validate-esignet-flow.spec.ts for
 * why the e-signet half of this same QA text doesn't apply to the deceased
 * page either.
 *
 * The camera-guidance copy and the lack of a Playwright-usable QR/camera
 * mock are already covered in birth's
 * 11.validate-mosip-qr-integration.spec.ts - not repeated here in full.
 */

trackAndDeleteCreatedEvents()

test('1. Validate the ID verification block on the Deceased\'s details page (QR only)', async ({
  page
}) => {
  await login(page)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  /*
   * Expected result: only "Scan QR Code" is offered - no e-signet button
   */
  await expect(
    page.getByRole('button', { name: 'Scan QR code' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', {
      name: 'Authenticate with National ID system'
    })
  ).toBeHidden()
})

test('2. Validate the ID verification block on the Informant\'s (other than Spouse) and Spouse pages', async ({
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

  await test.step('Informant type "Son" (other than Spouse) offers both buttons', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Son', { exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Scan QR code' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Authenticate with National ID system'
      })
    ).toBeVisible()

    await page.locator('#informant____email').fill('son@opencrvs.dev')
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Spouse page offers both buttons', async () => {
    await expect(
      page.getByText('Spouse details', { exact: true })
    ).toBeVisible()
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

test('3. "Scan QR Code" dialog opens and closes', async ({ page }) => {
  await login(page)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Scan QR code' }).click()

  /*
   * Expected result: the "Scan QR code" dialog opens with the camera
   * guidance copy (see birth's 11.validate-mosip-qr-integration.spec.ts for
   * the full, source-verified strings)
   */
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Scan QR code', level: 2 })
  ).toBeVisible()

  await page.getByTestId('close-dialog').click()
  await expect(page.getByRole('dialog')).toBeHidden()
})

// @TODO: no Playwright-usable camera/QR mock exists in packages/testland
// yet - see birth's 11.validate-mosip-qr-integration.spec.ts file-level note.
test.skip('4-6. Scan a valid/invalid QR code, verify auto-populated fields cannot be edited', async () => {})
