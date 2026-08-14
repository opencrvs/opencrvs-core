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
import { goToSection, login } from '../../../../helpers'
import { selectLocationOption } from '../helpers'
import { openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validation of e-signet flow for informants/mother/father details
 * page". Extends the existing coverage in
 * packages/testland/e2e/testcases/form-state/esignet-link-button.spec.ts
 * (authenticate only) with the Revoke flow.
 *
 * Note: only Name and Date of birth are actually wired to the e-Signet
 * response for a person field (see connectToMOSIPIdReader's `valuePath:
 * 'data.name' | 'data.birthDate'` usages in
 * packages/testland/src/events/mosip.ts and mother.ts/father.ts/informant.ts)
 * - there is no gender field on these pages, unlike what a literal reading
 * of the QA case's "Name, Date of birth and Gender will be populated" line
 * might suggest for child.gender.
 */

async function authenticateInformantWithESignet(page: Page) {
  await page
    .getByRole('link', { name: 'Authenticate with National ID system' })
    .click()

  // Only tested against mosip-mock so far - see esignet-link-button.spec.ts
  await expect(page).toHaveURL(/authorize/)
  await page.locator('#id-input').fill('1234567892')
  await page.locator('#authenticate').click()
  await expect(page).not.toHaveURL(/authorize/)
}

const beginAtInformantPageAsGrandfather = async (page: Page) => {
  await login(page)
  await openBirthDeclaration(page)
  // Child name + Grandfather informant combination from the birth
  // sample-data sheet's sample 3 (tests an underscore in the name).
  await page.locator('#firstname').fill('John_Peter')
  await page.locator('#surname').fill('Smith')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Grandfather', { exact: true }).click()
}

trackAndDeleteCreatedEvents()

test('Complete e-signet flow, validate populated data and the Revoke button', async ({
  page
}) => {
  await beginAtInformantPageAsGrandfather(page)

  await test.step('1. Complete e-signet flow', async () => {
    await authenticateInformantWithESignet(page)

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
     * e-signet response
     */
    await expect(page.locator('#firstname')).toHaveValue('John')
    await expect(page.locator('#surname')).toHaveValue('Doe')
    await expect(page.locator('#informant____dob-dd')).toHaveValue('20')
    await expect(page.locator('#informant____dob-mm')).toHaveValue('02')
    await expect(page.locator('#informant____dob-yyyy')).toHaveValue('2001')
  })

  await test.step('3. Try to change auto-populated values after e-signet flow', async () => {
    /*
     * Expected result: all the prepopulated data is disabled for edit, and
     * the National ID field is unavailable while authenticated
     */
    await expect(page.locator('#firstname')).toBeDisabled()
    await expect(page.locator('#surname')).toBeDisabled()
    await expect(page.locator('#informant____dob-dd')).toBeDisabled()
    await expect(page.locator('#informant____dob-mm')).toBeDisabled()
    await expect(page.locator('#informant____dob-yyyy')).toBeDisabled()
    await expect(page.locator('#informant____nid')).toBeHidden()
  })

  await test.step('4. Click "Revoke"', async () => {
    await page.getByRole('button', { name: 'Revoke' }).click()

    /*
     * Expected result: "Revoke authenticated ID?" modal with the
     * unlock-for-editing verbiage, Cancel and Continue buttons
     */
    await expect(
      page.getByRole('heading', { name: 'Revoke authenticated ID?' })
    ).toBeVisible()
    await expect(
      page.getByText(
        'By clicking ‘Continue,’ you’ll remove ID Authenticated status and unlock the fields for editing.'
      )
    ).toBeVisible()

    await page.locator('#cancel').click()

    /*
     * Expected result: closes the modal, the record stays authenticated
     */
    await expect(
      page.getByRole('heading', { name: 'Revoke authenticated ID?' })
    ).toBeHidden()
    await expect(page.getByText('ID Authenticated')).toBeVisible()

    await page.getByRole('button', { name: 'Revoke' }).click()
    await page.locator('#confirm').click()

    /*
     * Expected result: all populated fields are reset, the "ID
     * Authenticated" pill disappears, and the QR-scan/e-signet buttons
     * reappear
     */
    await expect(page.getByText('ID Authenticated')).toBeHidden()
    await expect(page.locator('#firstname')).toHaveValue('')
    await expect(page.locator('#firstname')).toBeEditable()
    await expect(
      page.getByRole('button', { name: 'Scan QR code' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Authenticate with National ID system'
      })
    ).toBeVisible()
  })

  await test.step('5. The informant details page still reaches review after re-authenticating', async () => {
    await authenticateInformantWithESignet(page)
    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })

    await page.locator('#informant____nationality').click()
    await page
      .locator('.react-select__option')
      .getByText('Farajaland', { exact: true })
      .click()

    /*
     * Type of ID / National ID are hidden while ID-authenticated (same as
     * confirmed in step 3 for #informant____nid) - re-authenticating in
     * this step keeps them hidden, so there's nothing to fill here.
     */
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await page.locator('#informant____email').fill('grandfather@opencrvs.dev')

    await goToSection(page, 'review')
    await expect(page).toHaveURL(/\/review/)
  })
})

// @TODO: no confirmed, deterministic way to make the mosip-mock service
// return a failed e-signet lookup from Playwright yet (the only existing
// coverage, esignet-link-button.spec.ts, exercises the success path with a
// known-good mock identity). Revisit once a failing mock identity or
// network-level fault injection is available.
test.skip('6. Validate the functionality when authentication fails', async () => {})
