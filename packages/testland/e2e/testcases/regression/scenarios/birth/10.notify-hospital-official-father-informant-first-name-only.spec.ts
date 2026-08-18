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
// Regression test data - Birth, Declaration Number 10:
// Sent by a Hospital Official as an incomplete NOTIFY, only the child's
// first name is filled in (surname left blank), Father informant with
// father's own details available, mother's details are not available.
// Mirror of Declaration 9.
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  login,
  continueForm,
  goToSection,
  drawSignature,
  triggerDeclarationAction,
  formatName,
  expectRowValue,
  switchEventTab
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { navigateToWorkqueue, selectLocationOption } from '../../../../utils'
import { openBirthDeclaration } from '../../../birth/helpers'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { selectDropdownOption } from './helpers'

test("10. Notify a birth as a Hospital Official - child's first name only (no surname), Father informant, mother's details not available", async ({
  page
}) => {
  // Unique suffix avoids colliding with any stray same-titled record left
  // behind by a previous run of this test - the surname's usual suffix
  // isn't available here since there is no surname, so it goes on the
  // first name instead.
  const childFirstName = `${faker.person.firstName()}${faker.string.alphanumeric(6)}`
  const fatherFirstName = faker.person.firstName('male')
  const fatherSurname = faker.person.lastName('male')

  const informantEmail = faker.internet.email()
  const fatherNid = faker.string.numeric(10)

  const motherReason = 'Mother is untraceable.'

  await test.step('Log in as the Hospital Official and start a birth declaration', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL_OTHER)
    await openBirthDeclaration(page)
  })

  await test.step("Fill only the child's first name, leaving the rest of the page blank", async () => {
    await page.locator('#firstname').fill(childFirstName)
    await continueForm(page)
  })

  await test.step("Fill the informant's details (Father)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Father')
    await page.locator('#informant____email').fill(informantEmail)
    await continueForm(page)
  })

  await test.step("Mother's details are not available", async () => {
    await page.getByLabel("Mother's details are not available").check()
    await page.locator('#mother____reason').fill(motherReason)

    await continueForm(page)
  })

  await test.step("Fill the father's details", async () => {
    await page.locator('#firstname').fill(fatherFirstName)
    await page.locator('#surname').fill(fatherSurname)
    // Date of birth doesn't render at all for this role (unlike address,
    // which does) - a secured field that's genuinely inaccessible here,
    // not just left blank by choice.

    await page.locator('#father____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#father____idType').click()
    await selectDropdownOption(page, 'National ID')
    await page.locator('#father____nid').fill(fatherNid)

    // Usual place of residence isn't specified in the sheet - a simple
    // Farajaland address.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await page.locator('#father____maritalStatus').click()
    await selectDropdownOption(page, 'Married')

    await page.locator('#father____educationalAttainment').click()
    await selectDropdownOption(page, 'Tertiary')

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Add the review comment and signature, then notify', async () => {
    await goToSection(page, 'review')

    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await triggerDeclarationAction(page, 'Notify')
  })

  const childName = formatName({ firstNames: childFirstName })

  await test.step('Open the declaration from the Recent workqueue', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, childName)
  })

  await test.step('The declaration status is Notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await test.step('The record matches the data that was filled in', async () => {
    await switchEventTab(page, 'Record')

    // NAME is a composite field (firstname + surname) - the record treats a
    // missing subfield as an incomplete name overall and shows "Required"
    // instead of the partial value, even though the workqueue's own title
    // (used to find this record above) still renders the first name alone.
    await expectRowValue(page, 'child.name', 'Required')

    await expectRowValue(page, 'informant.relation', 'Father')
    await expectRowValue(page, 'informant.email', informantEmail)

    await expectRowValue(page, 'mother.detailsNotAvailable', 'Yes')
    await expectRowValue(page, 'mother.reason', motherReason)

    await expectRowValue(
      page,
      'father.name',
      formatName({ firstNames: fatherFirstName, familyName: fatherSurname })
    )
    await expectRowValue(page, 'father.nationality', 'Farajaland')
    await expectRowValue(page, 'father.idType', 'National ID')
    await expectRowValue(page, 'father.nid', fatherNid)
    await expectRowValue(page, 'father.maritalStatus', 'Married')
    await expectRowValue(page, 'father.educationalAttainment', 'Tertiary')
    await expectRowValue(page, 'father.address', 'Klow')
  })
})
