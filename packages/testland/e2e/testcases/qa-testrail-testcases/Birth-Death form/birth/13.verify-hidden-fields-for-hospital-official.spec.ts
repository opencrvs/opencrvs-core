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
import { login, triggerDeclarationAction } from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { ensureAssignedToUser, navigateToWorkqueue, selectAction } from '../../../../utils'
import {
  REQUIRED_VALIDATION_ERROR,
  formatV2ChildName,
  openBirthDeclaration
} from '../../../birth/helpers'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Verify Hidden fields and pages for specific users" (Hospital
 * Official / role id HOSPITAL_CLERK).
 *
 * Correction to the QA doc's own prose: reading
 * packages/testland/src/events/birth/forms/pages/informant.ts, the field
 * hidden for HOSPITAL_CLERK is `informant.phoneNo` (line ~561-566,
 * `conditional: not(user.hasRole('HOSPITAL_CLERK'))`) - `informant.email`
 * has no such conditional and is always shown/required. The QA doc's
 * "Birth form shouldn't have 'Email' field for HO" does not match the
 * current code; this spec asserts the real behavior (phone number hidden,
 * email still present) instead of the QA doc's wording.
 *
 * Other confirmed HOSPITAL_CLERK-only hides:
 * - child.placeOfBirth: only "Health Institution" is selectable (child.ts,
 *   PRIVATE_HOME/OTHER options hidden for this role)
 * - mother.dob is hidden (mother.ts) - father.dob has no such conditional
 * - the entire documents page is hidden (documents.ts:100)
 */

// This test Notifies the record, which - unlike a plain draft - can never
// be deleted again (packages/events/src/service/events/events.ts:172-193,
// "Once an event is declared or notified, it can not be deleted anymore" -
// an intentional audit-trail guarantee, not a bug). A hardcoded name here
// would collide with an undeletable leftover from any prior run of this
// same test once it reaches "Notify", so a fresh random name is used
// instead of the sample-data sheet's edge-case names (this test isn't
// exercising name-character validation anyway - see
// 2.validate-childs-details-page.spec.ts for that).
const declarationDetails = {
  child: {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
}

trackAndDeleteCreatedEvents()

test('1. Validate hidden fields for Hospital Official and the notified record view', async ({
  page
}) => {
  await test.step('Login as Hospital Official and start a birth declaration', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL_OTHER)
    await openBirthDeclaration(page)

    await page.locator('#firstname').fill(declarationDetails.child.firstname)
    await page.locator('#surname').fill(declarationDetails.child.surname)
    await page.locator('#child____gender').click()
    await page.getByText('Male', { exact: true }).click()
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill(String(new Date().getFullYear()))
  })

  await test.step('Only "Health Institution" is offered as place of birth', async () => {
    await page.locator('#child____placeOfBirth').click()

    /*
     * Expected result: "Residential address" and "Other" are hidden for
     * a Hospital Official
     */
    await expect(
      page.getByText('Health Institution', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText('Residential address', { exact: true })
    ).toBeHidden()
    await expect(page.getByText('Other', { exact: true })).toBeHidden()

    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#searchable-select-child____birthLocation input')
      .fill('ib')
    await page.getByText('Ibombo District Hospital').click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('"Phone number" is hidden on the Informant\'s details page, "Email" remains', async () => {
    await expect(page.getByText("Informant's details")).toBeVisible()

    /*
     * Expected result (actual, verified behavior - see the file-level
     * note): the Phone number field is not shown; Email is still shown
     */
    await expect(page.locator('#informant____phoneNo')).toBeHidden()
    await expect(page.locator('#informant____email')).toBeVisible()

    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page
      .locator('#informant____email')
      .fill('hospital-official@opencrvs.dev')
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('"Date of birth" is hidden on the Mother\'s details page', async () => {
    await expect(
      page.getByText("Mother's details", { exact: true })
    ).toBeVisible()

    /*
     * Expected result: Date of birth is not shown to a Hospital Official
     * on the mother's details page
     */
    await expect(page.getByPlaceholder('dd')).toBeHidden()

    await page.locator('#firstname').fill('Aisha')
    await page.locator('#surname').fill('Islam')
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('The "Upload supporting documents" page is skipped entirely', async () => {
    await expect(
      page.getByText("Father's details", { exact: true })
    ).toBeVisible()

    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: navigates straight to Review, the documents page
     * is not shown for a Hospital Official
     */
    await expect(page).toHaveURL(/\/review/)
    await expect(
      page.getByText('Upload supporting documents', { exact: true })
    ).toBeHidden()
  })

  await test.step('Notify the record', async () => {
    await page.locator('#review____comment').fill('Notified by hospital.')
    await triggerDeclarationAction(page, 'Notify')
  })

  // The remaining steps continue in this same test (rather than a
  // separate top-level test()) because they depend on the record just
  // notified above - two independent tests would race under this
  // project's `fullyParallel: true` config, with no guarantee test 2
  // runs after test 1. Switching roles mid-test via a second login()
  // call on the same `page` mirrors the established role-handoff pattern
  // in e.g. death/8-validate-declaration-review-page.spec.ts.
  await test.step('Registrar finds the record in the Notifications workqueue and assigns it', async () => {
    const name = formatV2ChildName({ 'child.name': declarationDetails.child })

    await login(page, CREDENTIALS.REGISTRAR)
    await navigateToWorkqueue(page, 'Notifications')
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Editing the record shows the Phone number empty and no documents attached', async () => {
    await selectAction(page, 'Edit')

    /*
     * Expected result: user finds all required fields filled, except the
     * fields that were hidden from the Hospital Official
     */
    await expect(page.getByTestId('row-value-informant.phoneNo')).toBeEmpty()
    await expect(
      page.getByTestId('row-value-informant.email')
    ).toContainText('hospital-official@opencrvs.dev')
    /*
     * mother.dob is `required: true` in the schema
     * (packages/testland/src/events/birth/forms/pages/mother.ts) - since
     * it was hidden from and never filled by the Hospital Official, the
     * Registrar's review row shows the "Required" validation error, not
     * a truly empty cell.
     */
    await expect(
      page
        .getByTestId('row-value-mother.dob')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()

    /*
     * Expected result: no supporting documents are attached - the
     * Hospital Official never saw the documents page at all
     */
    await expect(
      page.getByRole('img', { name: 'Supporting Document' })
    ).toBeHidden()
  })
})
