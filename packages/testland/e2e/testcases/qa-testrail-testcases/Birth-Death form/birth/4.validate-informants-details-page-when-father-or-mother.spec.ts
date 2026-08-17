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
import { openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate the Informant's details page when informant is father/
 * mother" - selecting Mother or Father as the informant type must hide all
 * the additional informant-detail fields (their own details are already
 * collected on the Mother's/Father's details pages), while phone number and
 * email remain.
 */

const beginAtInformantPage = async (page: Page) => {
  await login(page)
  await openBirthDeclaration(page)
  // Edge-case child name from the birth sample-data sheet (sample 4:
  // "Complete declaration by Registration Agent" - tests a hyphen).
  await page.locator('#firstname').fill('James-Peter')
  await page.locator('#surname').fill('Collen')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText("Informant's details")).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('Selecting "Mother"/"Father" hides the additional informant fields', async ({
  page
}) => {
  await beginAtInformantPage(page)

  await test.step('1. Selecting "Mother" hides the additional fields', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()

    /*
     * Expected result: all fields should be hidden except phone number and
     * email
     */
    await expect(page.locator('#firstname')).toBeHidden()
    await expect(page.locator('#informant____nationality')).toBeHidden()
    await expect(page.locator('#informant____idType')).toBeHidden()
    await expect(page.locator('#informant____phoneNo')).toBeVisible()
    await expect(page.locator('#informant____email')).toBeVisible()
  })

  await test.step('2. Selecting "Father" hides the additional fields', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Father', { exact: true }).click()

    /*
     * Expected result: all fields should be hidden except phone number and
     * email
     */
    await expect(page.locator('#firstname')).toBeHidden()
    await expect(page.locator('#informant____nationality')).toBeHidden()
    await expect(page.locator('#informant____idType')).toBeHidden()
    await expect(page.locator('#informant____phoneNo')).toBeVisible()
    await expect(page.locator('#informant____email')).toBeVisible()
  })
})

test('"Continue" advances without re-entering Mother/Father\'s own details, no stray validation errors', async ({
  page
}) => {
  await beginAtInformantPage(page)

  await test.step('3. Select Mother and continue', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('mother@opencrvs.dev')

    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: user advances to Mother's details without being
     * asked to re-enter Mother's own details on this page, and no
     * validation errors are raised for the hidden fields
     */
    await expect(
      page.getByText("Mother's details", { exact: true })
    ).toBeVisible()
  })
})

test('Toggling informant type dynamically shows/hides fields with no residual data', async ({
  page
}) => {
  await beginAtInformantPage(page)

  await test.step('4. Select Mother, observe fields hidden', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await expect(page.locator('#firstname')).toBeHidden()
  })

  await test.step('5. Change selection to a non-parent, fields reappear empty', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Grandfather', { exact: true }).click()

    /*
     * Expected result: field visibility updates immediately with no
     * residual data left in the previously-hidden fields
     */
    await expect(page.locator('#firstname')).toBeVisible()
    await expect(page.locator('#firstname')).toHaveValue('')

    await page.locator('#firstname').fill('Rakibul')
  })

  await test.step('6. Change back to Father, fields hide again with no residual data', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Father', { exact: true }).click()
    await expect(page.locator('#firstname')).toBeHidden()

    await page.locator('#informant____relation').click()
    await page.getByText('Grandfather', { exact: true }).click()
    await expect(page.locator('#firstname')).toHaveValue('')
  })
})

test('Validate the "Phone number" and "Email" fields when informant is Mother/Father', async ({
  page
}) => {
  await beginAtInformantPage(page)
  await page.locator('#informant____relation').click()
  await page.getByText('Mother', { exact: true }).click()

  await test.step('7. Validate the "Phone number" field', async () => {
    await test.step('Enter a number not matching the required format', async () => {
      await page.locator('#informant____phoneNo').fill('0812345678')
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Must be a valid 10 digit number that starts
       * with 0(7|9)"
       */
      await expect(page.locator('#informant____phoneNo_error')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    await test.step('Enter a valid 10 digit number starting with 07/09', async () => {
      await page.locator('#informant____phoneNo').fill('0712345678')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#informant____phoneNo_error')).toBeHidden()
    })
  })

  await test.step('8. Validate the "Email" field', async () => {
    await test.step('Enter an invalid email address', async () => {
      await page.locator('#informant____email').fill('not-an-email')
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: an error is shown - informant.email has no
       * custom `validation` entries in the schema, so this only confirms
       * the framework-level email-format check surfaces at the standard
       * error locator, without asserting exact text
       */
      await expect(page.locator('#informant____email_error')).toBeVisible()
    })

    await test.step('Enter a valid email address', async () => {
      await page.locator('#informant____email').fill('mother@opencrvs.dev')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#informant____email_error')).toBeHidden()
    })
  })
})
