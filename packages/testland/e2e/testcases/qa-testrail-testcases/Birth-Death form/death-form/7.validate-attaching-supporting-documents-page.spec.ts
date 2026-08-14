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
  goToSection,
  login,
  uploadImage,
  uploadImageToSection
} from '../../../../helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Attaching supporting documents page"
 * (packages/testland/src/events/death/forms/pages/documents.ts).
 *
 * Correction to the QA doc: the "Proof of death" option is labelled
 * "Certified copy of burial receipt", not bare "Burial receipt". Also, the
 * "Proof of cause of death" dropdown only offers Verbal autopsy report /
 * Medically Certified Cause of Death / Other - it does NOT include
 * "Physician" or "Lay reported" even though those are two of the four
 * `sourceCauseDeath` values on the Event details page.
 */

const beginAtDocumentsPage = async (page: Page) => {
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
  await page.getByText('Cause of death has been established').click()
  await page.locator('#eventDetails____sourceCauseDeath').click()
  await page.getByText('Lay reported', { exact: true }).click()
  await page.locator('#eventDetails____description').fill('Fell ill.')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Son', { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByText("Spouse's details are not available").click()
  await page.locator('#spouse____reason').fill('Deceased was unmarried.')
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText('Upload supporting documents', { exact: true })
  ).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('Validate Attaching supporting documents page', async ({ page }) => {
  await beginAtDocumentsPage(page)

  await test.step('1-2. Navigate to the page and validate the available options', async () => {
    for (const section of ['documents____proofOfDeceased', 'documents____proofOfInformant']) {
      await page
        .locator(`#${section}`)
        .getByText('Select', { exact: true })
        .click()
      for (const option of [
        'National ID',
        'Passport',
        'Birth Certificate',
        'Other'
      ]) {
        await expect(
          page.locator(`#${section}`).getByText(option, { exact: true })
        ).toBeVisible()
      }
      await page.keyboard.press('Escape')
    }

    await page
      .locator('#documents____proofOfDeath')
      .getByText('Select', { exact: true })
      .click()
    for (const option of [
      'Attested letter of death',
      'Police certificate of death',
      'Hospital certificate of death',
      "Coroner's report",
      'Certified copy of burial receipt',
      'Other'
    ]) {
      await expect(
        page
          .locator('#documents____proofOfDeath')
          .getByText(option, { exact: true })
      ).toBeVisible()
    }
    await page.keyboard.press('Escape')

    /*
     * Expected result ("Proof of cause of death" hides when "Has a cause
     * of death been established?" is No): here it's established=true
     * (Lay reported, set up above), so the section is visible
     */
    /*
     * The dropdown container and its (currently disabled) upload button
     * share the same id, so scope to the first match to avoid a
     * strict-mode violation.
     */
    await expect(
      page.locator('#documents____proofOfCauseOfDeath').first()
    ).toBeVisible()
    await page
      .locator('#documents____proofOfCauseOfDeath')
      .getByText('Select', { exact: true })
      .click()
    for (const option of [
      'Verbal autopsy report',
      'Medically Certified Cause of Death',
      'Other'
    ]) {
      await expect(
        page
          .locator('#documents____proofOfCauseOfDeath')
          .getByText(option, { exact: true })
      ).toBeVisible()
    }
    await page.keyboard.press('Escape')
  })

  await test.step('3-4. Validate the file-uploading system', async () => {
    await uploadImageToSection({
      page,
      sectionLocator: page.locator('#documents____proofOfDeceased'),
      sectionTitle: 'Birth Certificate',
      buttonLocator: page.locator(
        'button[name="documents____proofOfDeceased"]'
      )
    })

    /*
     * Expected result: the trash/delete icon is available after upload
     */
    await expect(
      page.locator('#document_BIRTH_CERTIFICATE_link')
    ).toContainText('Birth Certificate')
    await expect(page.getByLabel('Delete attachment')).toBeVisible()

    await page.getByLabel('Delete attachment').click()

    /*
     * Expected result: clicking the trash icon removes the attachment
     */
    await expect(
      page.locator('#document_BIRTH_CERTIFICATE_link')
    ).toBeHidden()
  })

  await test.step('5-6. Uploading a document type hides it from the dropdown afterwards', async () => {
    await uploadImageToSection({
      page,
      sectionLocator: page.locator('#documents____proofOfInformant'),
      sectionTitle: 'National ID',
      buttonLocator: page.locator(
        'button[name="documents____proofOfInformant"]'
      )
    })

    await page
      .locator('#documents____proofOfInformant')
      .getByText('Select', { exact: true })
      .click()

    /*
     * Expected result: "National ID" is no longer offered, since it has
     * already been uploaded
     */
    await expect(
      page
        .locator('#documents____proofOfInformant')
        .getByText('National ID', { exact: true })
    ).toBeHidden()
    await expect(
      page
        .locator('#documents____proofOfInformant')
        .getByText('Passport', { exact: true })
    ).toBeVisible()
    await page.keyboard.press('Escape')
  })

  await test.step('7. An unsupported file type is rejected', async () => {
    await uploadImageToSection({
      page,
      sectionLocator: page.locator('#documents____proofOfDeath'),
      sectionTitle: 'Attested letter of death',
      buttonLocator: page.locator('button[name="documents____proofOfDeath"]')
    })

    /*
     * The above uploads a valid image; now retry with an invalid type on
     * Proof of deceased's ID to trigger the file-type validation error.
     * Its own type selector was reset back to "Select" when its earlier
     * upload (step 3-4) was deleted, so the upload button is disabled
     * until a type is chosen again.
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
      page.locator('button[name="documents____proofOfDeceased"]'),
      './e2e/testcases/qa-testrail-testcases/Birth-Death form/assets/invalid-type.txt'
    )

    /*
     * Expected result: "File format not supported. Please attach jpeg,
     * png, jpg, pdf (max 5mb)"
     */
    await expect(
      page.getByText(
        'File format not supported. Please attach jpeg, png, jpg, pdf (max 5mb)'
      )
    ).toBeVisible()
  })

  await test.step('8. A file over 5mb is rejected', async () => {
    /*
     * "Other" is still selected on Proof of deceased's ID from the
     * previous (rejected) upload attempt, so its upload button stays
     * enabled.
     */
    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfDeceased"]'),
      './e2e/testcases/qa-testrail-testcases/Birth-Death form/assets/6MB-oversized.png'
    )

    /*
     * Expected result: "File size must be less than 5mb"
     */
    await expect(
      page.getByText('File size must be less than 5mb')
    ).toBeVisible()
  })

  await test.step('9. "Continue" navigates to the Review page', async () => {
    await goToSection(page, 'review')

    /*
     * Expected result: user is redirected to the "Declaration review"
     * page
     */
    await expect(page).toHaveURL(/\/review/)
  })
})

/*
 * Unlike birth's documents (proofOfMother/proofOfFather/proofOfInformant),
 * none of proofOfDeceased/proofOfInformant/proofOfDeath in
 * packages/testland/src/events/death/forms/pages/documents.ts carry a
 * conditional tied to the informant's relation - the only relation-based
 * conditional in the whole death form is the Spouse's own
 * "details are not available" checkbox (spouse.ts's requireSpouseDetails).
 */
test("The supporting documents section has no conditional tied to the informant's relation, even when the informant is the Spouse", async ({
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
  await page.getByText('Cause of death has been established').click()
  await page.locator('#eventDetails____sourceCauseDeath').click()
  await page.getByText('Lay reported', { exact: true }).click()
  await page.locator('#eventDetails____description').fill('Fell ill.')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Spouse', { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  /*
   * Expected result: the "Spouse's details are not available" checkbox
   * is hidden - the informant IS the spouse, so their own answers cover
   * the spouse's details.
   */
  await expect(
    page.getByText("Spouse's details are not available")
  ).toBeHidden()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText('Upload supporting documents', { exact: true })
  ).toBeVisible()

  /*
   * Expected result: every document slot is still offered exactly as it
   * would be for any other informant relation - none of them are gated
   * on informant.relation.
   */
  for (const section of [
    'documents____proofOfDeceased',
    'documents____proofOfInformant'
  ]) {
    await page
      .locator(`#${section}`)
      .getByText('Select', { exact: true })
      .click()
    await expect(
      page.locator(`#${section}`).getByText('National ID', { exact: true })
    ).toBeVisible()
    await page.keyboard.press('Escape')
  }
  await expect(page.locator('#documents____proofOfDeath').first()).toBeVisible()
})
