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
import { faker } from '@faker-js/faker'
import {
  drawSignature,
  goToSection,
  login,
  triggerDeclarationAction,
  uploadImage
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { ensureAssignedToUser } from '../../../../utils'
import { selectLocationOption } from '../helpers'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Declaration Review page". A separate, extensive
 * non-qa-testrail spec already exists at
 * packages/testland/e2e/testcases/death/8-validate-declaration-review-page.spec.ts
 * (1653 lines, covers the full HO->HA->RO->Registrar attest/review chain) -
 * this spec focuses on the QA doc's own listed sub-steps (document viewer,
 * comments box, action menu, and performing Register through to Pending
 * Certification) without duplicating that role-chain depth.
 *
 * This test Registers the record, which - unlike a plain draft - can never
 * be deleted again (packages/events/src/service/events/events.ts:172-193,
 * "Once an event is declared or notified, it can not be deleted anymore" -
 * an intentional audit-trail guarantee, not a bug). A hardcoded deceased
 * name would collide with an undeletable leftover from any prior run of
 * this same test once it reaches "Register" (openRecordByTitle's lookup
 * isn't `exact`, so two same-named records both match and Playwright
 * refuses to click an ambiguous element) - so a fresh random name is used
 * instead.
 */

const DECEASED_NAME = {
  firstname: faker.person.firstName(),
  surname: faker.person.lastName()
}

const fillDeathDeclarationAndReachReview = async (page: Page) => {
  await login(page, CREDENTIALS.REGISTRAR)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#firstname').fill(DECEASED_NAME.firstname)
  await page.locator('#surname').fill(DECEASED_NAME.surname)
  await page.locator('#deceased____gender').click()
  await page.getByText('Male', { exact: true }).click()
  await page.getByPlaceholder('dd').fill('01')
  await page.getByPlaceholder('mm').fill('01')
  await page.getByPlaceholder('yyyy').fill('1960')
  await page.locator('#deceased____idType').click()
  await page.getByText('National ID', { exact: true }).click()
  await page.locator('#deceased____nid').fill('1234567890')
  await page.locator('#province').click()
  await selectLocationOption(page, 'Central')
  await page.locator('#district').click()
  await selectLocationOption(page, 'Ibombo')
  /*
   * Village deliberately left unselected - "Validate required-field and
   * address error messages" below demonstrates the resulting "Invalid
   * input" row, then fixes it via "Change all" before Register.
   */
  await page.locator('#village').click()
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
  await page.locator('#firstname').fill('James')
  await page.locator('#surname').fill('Doppler')
  await page.getByPlaceholder('dd').fill('01')
  await page.getByPlaceholder('mm').fill('01')
  await page.getByPlaceholder('yyyy').fill('1990')
  await page.locator('#informant____nationality').click()
  await page
    .locator('.react-select__option')
    .getByText('Farajaland', { exact: true })
    .click()
  await page.getByLabel('Yes', { exact: true }).check()
  await page.locator('#informant____idType').click()
  await page.getByText('National ID', { exact: true }).click()
  await page.locator('#informant____nid').fill('0987654321')
  /*
   * Email deliberately left blank - see "Validate required-field and
   * address error messages" below, which fixes it before Register.
   */
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByText("Spouse's details are not available").click()
  await page.locator('#spouse____reason').fill('Deceased was unmarried.')
  await page.getByRole('button', { name: 'Continue' }).click()

  await goToSection(page, 'review')
}

trackAndDeleteCreatedEvents()

test('Validate Declaration Review page', async ({ page }) => {
  await fillDeathDeclarationAndReachReview(page)

  await test.step('1. Navigate to the Declaration preview page', async () => {
    /*
     * Expected result: user finds all the information added previously
     * in different pages, with a "Change" link for every field
     */
    await expect(page.getByTestId('deceased.name-value')).toContainText(
      `${DECEASED_NAME.firstname} ${DECEASED_NAME.surname}`
    )
    await expect(page.getByTestId('change-button-deceased.name')).toBeVisible()

    /*
     * Expected result: the page header names the declaration by the
     * deceased's name
     */
    await expect(
      page.getByText(
        `Death declaration for ${DECEASED_NAME.firstname} ${DECEASED_NAME.surname}`
      )
    ).toBeVisible()
  })

  await test.step('Validate required-field and address error messages', async () => {
    /*
     * Expected result: an unfilled required field shows "Required"; an
     * ADDRESS field left incomplete (province/district selected, but no
     * village) shows "Invalid input" instead of a value
     */
    await expect(
      page.getByTestId('informant.email-value').getByText('Required')
    ).toBeVisible()
    await expect(
      page.getByTestId('deceased.address-value').getByText('Invalid input')
    ).toBeVisible()
  })

  await test.step('2. Click a "Change" link', async () => {
    await page.getByTestId('change-button-deceased.gender').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#deceased____gender').click()
    await page.getByText('Unknown', { exact: true }).click()

    /*
     * Expected result: "Go to review" returns to the review page with
     * the updated value
     */
    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByTestId('deceased.gender-value')).toContainText(
      'Unknown'
    )

    /*
     * Restore a definite sex - this test still needs to Register the
     * declaration later, and "Unknown" was only set above to prove the
     * Change flow works, not to be the final value.
     */
    await page.getByTestId('change-button-deceased.gender').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#deceased____gender').click()
    await page.getByText('Male', { exact: true }).click()
    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Validate the "Change all" button', async () => {
    /*
     * Also fixes the village left unselected above - this section still
     * needs to reach Register later.
     */
    await page
      .getByTestId('accordion-Accordion_deceased')
      .getByRole('button', { name: 'Change all' })
      .click()
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: navigates to the Deceased's details page with
     * every field open for editing, not just the one field a plain
     * "Change" link would jump to
     */
    await expect(
      page.getByText("Deceased's details", { exact: true })
    ).toBeVisible()
    await expect(page.locator('#deceased____nid')).toHaveValue('1234567890')

    await page.locator('#village').click()
    await selectLocationOption(page, 'Olani')
    await page.getByRole('button', { name: 'Go to review' }).click()

    await expect(
      page.getByTestId('deceased.address-value')
    ).not.toContainText('Invalid input')

    /*
     * Fix the other deliberate gap (informant's email) via a plain
     * "Change" link, so Register isn't blocked later.
     */
    await page.getByTestId('change-button-informant.email').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#informant____email').fill('son@opencrvs.dev')
    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Validate the Hide/Show toggle', async () => {
    await page
      .getByTestId('accordion-Accordion_deceased')
      .getByRole('button', { name: 'Hide' })
      .click()

    /*
     * Expected result: the section's rows are hidden
     */
    await expect(page.getByTestId('deceased.name-value')).toBeHidden()

    await page
      .getByTestId('accordion-Accordion_deceased')
      .getByRole('button', { name: 'Show' })
      .click()

    /*
     * Expected result: the rows reappear
     */
    await expect(page.getByTestId('deceased.name-value')).toBeVisible()
  })

  await test.step('4. Validate the supporting document viewer', async () => {
    await test.step('Click the link when no supporting document has been attached', async () => {
      /*
       * Expected result: no document was uploaded, so the section has no
       * rows yet - "Change all" is the only way back to the Supporting
       * documents page (the section heading itself isn't a link).
       */
      await page
        .getByTestId('accordion-Accordion_documents')
        .getByRole('button', { name: 'Change all' })
        .click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(
        page.getByText('Upload supporting documents', { exact: true })
      ).toBeVisible()
      await expect(page).toHaveURL(/\/documents/)
    })

    await test.step('Upload multiple documents then switch between them in the viewer dropdown', async () => {
      /*
       * documents.proofOfDeceased and .proofOfInformant are both
       * FILE_WITH_OPTIONS - a type must be selected before their upload
       * button is enabled.
       */
      await page
        .locator('#documents____proofOfDeceased')
        .getByText('Select', { exact: true })
        .click()
      await page
        .locator('#documents____proofOfDeceased')
        .getByText('Other', { exact: true })
        .click()
      await uploadImage(
        page,
        page.locator('button[name="documents____proofOfDeceased"]')
      )

      await page
        .locator('#documents____proofOfInformant')
        .getByText('Select', { exact: true })
        .click()
      await page
        .locator('#documents____proofOfInformant')
        .getByText('National ID', { exact: true })
        .click()
      await uploadImage(
        page,
        page.locator('button[name="documents____proofOfInformant"]')
      )

      await page.getByRole('button', { name: 'Continue' }).click()

      /*
       * Expected result: both documents are selectable, and the viewer
       * updates to reflect whichever one is currently selected
       */
      /*
       * The dropdown's currently-selected option renders twice while open
       * (the closed single-value badge plus the highlighted option in the
       * list) - scope to .react-select__option to avoid a strict-mode
       * violation, matching the same fix used for the location/nationality
       * pickers elsewhere in this folder.
       */
      await expect(page.locator('#select_document')).toBeVisible()
      await page.locator('#select_document').click()
      await expect(
        page
          .locator('.react-select__option')
          .getByText("Proof of deceased's ID (Other)", { exact: true })
      ).toBeVisible()
      await expect(
        page
          .locator('.react-select__option')
          .getByText("Proof of informant's ID (National ID)", {
            exact: true
          })
      ).toBeVisible()

      await page
        .locator('.react-select__option')
        .getByText("Proof of deceased's ID (Other)", { exact: true })
        .click()
      await expect(
        page.getByRole('img', { name: 'Supporting Document' })
      ).toBeVisible()
      await expect(page.locator('#select_document')).toContainText(
        "Proof of deceased's ID (Other)"
      )

      await page.locator('#select_document').click()
      await page
        .locator('.react-select__option')
        .getByText("Proof of informant's ID (National ID)", { exact: true })
        .click()
      await expect(
        page.getByRole('img', { name: 'Supporting Document' })
      ).toBeVisible()
      await expect(page.locator('#select_document')).toContainText(
        "Proof of informant's ID (National ID)"
      )
    })
  })

  await test.step('5. Validate the additional comments box', async () => {
    await page.locator('#review____comment').fill('Reviewed and confirmed.')

    await expect(page.locator('#review____comment')).toHaveValue(
      'Reviewed and confirmed.'
    )
  })

  await test.step('6. Validate the Action menu', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()

    /*
     * Expected result: shows the available actions per the user's scope
     */
    await expect(page.getByText('Register', { exact: true })).toBeVisible()
    await expect(page.getByText('Save & Exit', { exact: true })).toBeVisible()
    await expect(page.getByText('Delete declaration')).toBeVisible()
    await page.getByRole('button', { name: 'Action', exact: true }).click()
  })

  await test.step('7-8. Register the declaration and confirm it reaches Pending Certification', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    /*
     * Expected result: a confirmation pop-up appears with Cancel and
     * Register buttons
     */
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page.getByText('Register', { exact: true }).click()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Register', exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()

    await triggerDeclarationAction(page, 'Register')

    /*
     * Expected result: the record appears in "Pending certification"
     */
    const name = `${DECEASED_NAME.firstname} ${DECEASED_NAME.surname}`
    await page.getByText('Pending certification').click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })
})
