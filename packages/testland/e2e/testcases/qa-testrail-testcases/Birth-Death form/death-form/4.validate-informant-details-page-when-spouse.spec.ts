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
 * QA case: "Validate the informant details page when informant is Spouse" -
 * when the informant IS the spouse, none of informant's own person-fields
 * (name/dob/nationality/idType/etc.) render on the informant page - only
 * relation/phone/email - because that identity is captured on the Spouse
 * page instead (packages/testland/src/events/death/forms/pages/informant.ts,
 * `informantOtherThanSpouse` gate).
 */

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

  await expect(page.getByText("Informant's details")).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('Validate the informant details page when informant is Spouse', async ({
  page
}) => {
  await beginAtInformantPage(page)

  await test.step('1. Validate "Informant details" page contents and select Spouse', async () => {
    await expect(page.getByText('Informant Type')).toBeVisible()
    await expect(page.getByText('Phone number')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()

    /*
     * Note: per-page "Continue" does not block on empty required fields -
     * it navigates straight through instead of showing inline errors.
     * Required-field validation for this page is covered separately via
     * the Review page (see e.g. 2.validate-deceaseds-details-page.spec.ts).
     */
    await page.locator('#informant____relation').click()
    await page.getByText('Spouse', { exact: true }).click()

    /*
     * Expected result: should not add any other field
     */
    await expect(page.locator('#firstname')).toBeHidden()
    await expect(page.locator('#informant____nationality')).toBeHidden()
    await expect(page.locator('#informant____idType')).toBeHidden()
  })

  await test.step('2. Validate the "Phone number" field', async () => {
    await test.step('Leave the field as null and continue', async () => {
      await page.locator('#informant____phoneNo').fill('')
      await page.getByRole('heading', { name: 'Death' }).click()

      /*
       * Expected result: optional field, no validation error
       */
      await expect(page.locator('#informant____phoneNo_error')).toBeHidden()
    })

    await test.step('Enter a number not starting with 0', async () => {
      await page.locator('#informant____phoneNo').fill('1234567890')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(page.locator('#informant____phoneNo_error')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    await test.step('Enter a number with the wrong length', async () => {
      await page.locator('#informant____phoneNo').fill('07123')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(page.locator('#informant____phoneNo_error')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    await test.step('Enter a valid 10 digit number starting with 0', async () => {
      await page.locator('#informant____phoneNo').fill('0712345678')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(page.locator('#informant____phoneNo_error')).toBeHidden()
    })
  })

  await test.step('3. Validate the "Email" field', async () => {
    await test.step('Enter an invalid email address', async () => {
      await page.locator('#informant____email').fill('not-an-email')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(page.locator('#informant____email_error')).toBeVisible()
    })

    await test.step('Enter a valid email address', async () => {
      await page.locator('#informant____email').fill('spouse@opencrvs.dev')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(page.locator('#informant____email_error')).toBeHidden()
    })
  })

  await test.step('4. Click "Continue"', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should navigate to the Spouse details page
     */
    await expect(
      page.getByText('Spouse details', { exact: true })
    ).toBeVisible()
  })
})
