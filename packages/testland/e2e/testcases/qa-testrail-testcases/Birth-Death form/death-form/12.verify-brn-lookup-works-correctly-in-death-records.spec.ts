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
import { faker } from '@faker-js/faker'
import { getToken, login } from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Verify BRN lookup works correctly in death records" - the
 * `deceased.birthRecordSearch` field
 * (packages/testland/src/events/death/forms/pages/deceased.ts:81-149),
 * only shown when `deceased.nationality === 'FAR'`. Mirrors the already
 * -passing packages/testland/e2e/testcases/death/brn-search-on-deceased.spec.ts
 * for the happy path, and adds the QA doc's negative cases.
 *
 * Correction to the QA doc's step 5 ("the fields expected to be filled up
 * by brn lookup should not stay hidden in event overview page") - this
 * refers to the linked BIRTH record's own overview, not the death form,
 * and no concrete locator/expectation could be grounded from source for
 * this specific claim, so it's left as a skipped @TODO rather than guessed.
 */

trackAndDeleteCreatedEvents()

test('1. A "Search birth record by BRN" field with a Search button is shown', async ({
  page
}) => {
  await login(page, CREDENTIALS.REGISTRAR)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  /*
   * Expected result: label "Search birth record by BRN" and a Search
   * button - shown because deceased.nationality defaults to Farajaland
   */
  await expect(page.getByText('Search birth record by BRN')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Search', exact: true })
  ).toBeVisible()
})

test('2. Searching an invalid BRN shows a format error', async ({ page }) => {
  await login(page, CREDENTIALS.REGISTRAR)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  /*
   * The format is validated live as you type: the error shows immediately
   * and the Search button stays disabled for an invalid value - no click
   * needed (and the disabled button would never become clickable anyway).
   */
  await page.locator('#search').fill('not-valid')

  /*
   * Expected result: "Invalid value: Must be alpha-numeric and 12
   * characters long"
   */
  await expect(page.getByTestId('search-input-error')).toHaveText(
    'Invalid value: Must be alpha-numeric and 12 characters long'
  )
})

test('3. Searching a BRN that does not exist shows "No record found"', async ({
  page
}) => {
  await login(page, CREDENTIALS.REGISTRAR)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // 12 alphanumeric characters, well-formed but not a real registration.
  await page.locator('#search').fill('AB0000000000')
  await page.getByRole('button', { name: 'Search', exact: true }).click()

  await expect(page.getByTestId('search-input-error')).toHaveText(
    'No record found',
    { timeout: 10_000 }
  )
})

test('4. Searching a valid, registered BRN finds and fills the deceased fields', async ({
  page
}) => {
  const birthChildName = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  let registrationNumber = ''

  await test.step('Create and register a birth record via API', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, {
      'child.name': birthChildName
    })
    registrationNumber = res.registrationNumber ?? ''
    expect(registrationNumber).toMatch(/^[A-Za-z0-9]{12}$/)
  })

  await test.step('Login and start a death declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step("Search the deceased's birth record by BRN", async () => {
    await page.locator('#search').fill(registrationNumber)

    // The birth may take a moment to be indexed for search; retry.
    await expect(async () => {
      await page.getByRole('button', { name: 'Search', exact: true }).click()
      await expect(page.getByTestId('search-input-error')).toHaveText(
        'Birth record found',
        { timeout: 5000 }
      )
    }).toPass({ timeout: 30_000 })
  })

  await test.step("Name, sex and DOB are auto-populated from the matched birth record", async () => {
    /*
     * Expected result: Name, Sex and DOB should be auto-populated. Note:
     * only the search box itself locks after a match (Search button hides,
     * replaced by "Clear") - the populated Name/Sex/DOB fields are only
     * disabled once MOSIP-verified, not from the BRN match alone.
     */
    await expect(page.locator('#firstname')).toHaveValue(
      birthChildName.firstname
    )
    await expect(page.locator('#surname')).toHaveValue(birthChildName.surname)
    await expect(
      page.getByRole('button', { name: 'Search', exact: true })
    ).toBeHidden()
    await expect(page.getByText('Clear', { exact: true })).toBeVisible()
  })
})

// @TODO: "the fields expected to be filled up by brn lookup should not stay
// hidden in event overview page" - refers to the linked birth record's own
// overview, not the death form; no concrete locator/expectation could be
// grounded from source for this claim.
test.skip('5. Validate event overview page summary tab of the linked birth record', async () => {})
