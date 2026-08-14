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
import {
  continueForm,
  expectRowValueWithChangeButton,
  goToSection,
  login,
  uploadImage
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Review page". The existing
 * 8-validate-declaration-review-page.spec.ts already covers every "Change"
 * link exhaustively and the role hand-off after Declare/Register, so this
 * spec focuses on the QA sub-cases that file explicitly leaves unimplemented
 * (`test.skip('Skipped for now')` for supporting document, additional
 * comments and the Action menu) plus the review page's own exit (x) button.
 */

const fillBirthDeclarationAndReachReview = async (page: Page) => {
  /*
   * Not COMMUNITY_LEADER: that role can't select "Health Institution" as
   * place of birth (child.ts's placeOfBirth options hide it via
   * `not(user.hasRole('COMMUNITY_LEADER'))`), which this declaration
   * relies on. REGISTRATION_OFFICER shares COMMUNITY_LEADER's `record
   * .declare`-only scope (no `record.register`, so step 5 still expects
   * "Declare" rather than "Register" in the Action menu) and the same
   * Ibombo District Office jurisdiction as the default Registrar, without
   * COMMUNITY_LEADER's place-of-birth restriction.
   */
  await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  await openBirthDeclaration(page)

  // Edge-case child name from the birth sample-data sheet (sample 5:
  // "Complete declaration by Local Registrar" - tests an ordinal suffix).
  await page.locator('#firstname').fill('Richard the 3rd')
  await page.locator('#surname').fill('Doppler')
  await page.locator('#child____gender').click()
  await page.getByText('Male', { exact: true }).click()
  await page.getByPlaceholder('dd').fill('01')
  await page.getByPlaceholder('mm').fill('01')
  await page.getByPlaceholder('yyyy').fill(String(new Date().getFullYear()))
  await page.locator('#child____placeOfBirth').click()
  await page.getByText('Health Institution', { exact: true }).click()
  await page
    .locator('#searchable-select-child____birthLocation input')
    .fill('ib')
  await page.getByText('Ibombo District Hospital').click()
  await continueForm(page)

  await page.locator('#informant____relation').click()
  await page.getByText('Mother', { exact: true }).click()
  await page.locator('#informant____email').fill('mother@opencrvs.dev')
  await continueForm(page)

  await page.locator('#firstname').fill('Aisha')
  await page.locator('#surname').fill('Islam')
  await page.getByPlaceholder('dd').fill('01')
  await page.getByPlaceholder('mm').fill('01')
  await page.getByPlaceholder('yyyy').fill('1990')
  await continueForm(page)

  await page.locator('#father____addressSameAs_YES').click()
  await continueForm(page)
}

trackAndDeleteCreatedEvents()

test('Validate Review page', async ({ page }) => {
  await fillBirthDeclarationAndReachReview(page)
  await goToSection(page, 'review')

  await test.step('1. Navigate to the Declaration review page', async () => {
    /*
     * Expected result: user finds all the information added previously
     * in different pages, with a "Change" link for every field
     */
    await expectRowValueWithChangeButton(
      page,
      'child.name',
      'Richard the 3rd Doppler'
    )
    await expectRowValueWithChangeButton(page, 'child.gender', 'Male')

    /*
     * Expected result: the page header names the declaration by the
     * child's name
     */
    await expect(
      page.getByText('Birth declaration for Richard the 3rd Doppler')
    ).toBeVisible()
  })

  await test.step('Validate required-field and address error messages', async () => {
    /*
     * Expected result: an unfilled required field shows "Required"; an
     * ADDRESS field left incomplete (province/district selected, but no
     * village) shows "Invalid input" instead of a value - neither blocks
     * "Declare" (only Register enforces full validity, unlike this test's
     * role which only has record.declare scope).
     */
    await expect(
      page.getByTestId('father.name-value').getByText('Required')
    ).toBeVisible()
    await expect(
      page.getByTestId('mother.idType-value').getByText('Required')
    ).toBeVisible()
    await expect(
      page.getByTestId('mother.address-value').getByText('Invalid input')
    ).toBeVisible()
  })

  await test.step('2. Click a "Change" link', async () => {
    await page.getByTestId('change-button-child.gender').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()

    /*
     * Expected result: "Back to review" returns to the review page with
     * the updated value
     */
    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByTestId('child.gender-value')).toContainText(
      'Female'
    )
  })

  await test.step('Validate the "Change all" button', async () => {
    await page
      .getByTestId('accordion-Accordion_father')
      .getByRole('button', { name: 'Change all' })
      .click()
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: navigates to the Father's details page with every
     * field open for editing, not just the one field a plain "Change"
     * link would jump to
     */
    await expect(
      page.getByText("Father's details", { exact: true })
    ).toBeVisible()
    await expect(page.locator('#father____addressSameAs_YES')).toBeChecked()

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page).toHaveURL(/\/review/)
  })

  await test.step('Validate the Hide/Show toggle', async () => {
    await page
      .getByTestId('accordion-Accordion_child')
      .getByRole('button', { name: 'Hide' })
      .click()

    /*
     * Expected result: the section's rows are hidden
     */
    await expect(page.getByTestId('child.name-value')).toBeHidden()

    await page
      .getByTestId('accordion-Accordion_child')
      .getByRole('button', { name: 'Show' })
      .click()

    /*
     * Expected result: the rows reappear
     */
    await expect(page.getByTestId('child.name-value')).toBeVisible()
  })

  await test.step('3. Validate the document viewer', async () => {
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

      /*
       * Expected result: navigates to the Supporting documents page
       */
      await expect(
        page.getByText('Upload supporting documents', { exact: true })
      ).toBeVisible()
      await expect(page).toHaveURL(/\/documents/)
    })

    await test.step('Upload multiple documents then switch between them in the viewer dropdown', async () => {
      await uploadImage(
        page,
        page.locator('button[name="documents____proofOfBirth"]')
      )

      await page
        .locator('#documents____proofOfMother')
        .getByText('Select', { exact: true })
        .click()
      await page
        .locator('#documents____proofOfMother')
        .getByText('National ID', { exact: true })
        .click()
      await uploadImage(
        page,
        page.locator('button[name="documents____proofOfMother"]')
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
          .getByText('Proof of birth (Notification of birth)', {
            exact: true
          })
      ).toBeVisible()
      await expect(
        page
          .locator('.react-select__option')
          .getByText("Proof of mother's ID (National ID)", { exact: true })
      ).toBeVisible()

      await page
        .locator('.react-select__option')
        .getByText('Proof of birth (Notification of birth)', { exact: true })
        .click()
      await expect(
        page.getByRole('img', { name: 'Supporting Document' })
      ).toBeVisible()
      await expect(page.locator('#select_document')).toContainText(
        'Proof of birth (Notification of birth)'
      )

      await page.locator('#select_document').click()
      await page
        .locator('.react-select__option')
        .getByText("Proof of mother's ID (National ID)", { exact: true })
        .click()
      await expect(
        page.getByRole('img', { name: 'Supporting Document' })
      ).toBeVisible()
      await expect(page.locator('#select_document')).toContainText(
        "Proof of mother's ID (National ID)"
      )
    })
  })

  await test.step('4. Validate the additional comments box', async () => {
    await page.locator('#review____comment').fill('Reviewed and confirmed.')

    /*
     * Expected result: the user can add an additional comment to the
     * declaration
     */
    await expect(page.locator('#review____comment')).toHaveValue(
      'Reviewed and confirmed.'
    )
  })

  await test.step('5. Validate the Action menu', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()

    /*
     * Expected result: the action menu shows options according to the
     * user's scope and jurisdiction
     */
    await expect(page.getByText('Declare', { exact: true })).toBeVisible()
    await expect(page.getByText('Save & Exit', { exact: true })).toBeVisible()
    await expect(page.getByText('Delete declaration')).toBeVisible()
    await page.getByRole('button', { name: 'Action', exact: true }).click()
  })

  await test.step('6. Validate the cross (x) / Exit button', async () => {
    /*
     * getByTestId, not getByRole(name: 'Exit') - with the document viewer
     * open (from step 3), the header renders in a compact, icon-only mode
     * where the button has no accessible "Exit" text, only its stable
     * testid.
     */
    await page.getByTestId('exit-button').click()

    /*
     * Expected result: "Exit without saving changes?" modal with Cancel
     * and Confirm
     */
    await expect(
      page.getByRole('heading', { name: 'Exit without saving changes?' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()

    /*
     * Expected result: should close the modal
     */
    await expect(
      page.getByRole('heading', { name: 'Exit without saving changes?' })
    ).toBeHidden()

    await page.getByTestId('exit-button').click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    /*
     * Expected result: the review page is closed and the declaration is
     * not saved
     */
    await expect(
      page.getByTestId('search-result').getByText('Assigned to you')
    ).toBeVisible()
  })
})
