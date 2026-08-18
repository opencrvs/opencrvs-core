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
// Regression test data - Birth, Declaration Number 7:
// Sent by a Hospital Official as an incomplete NOTIFY (not a full DECLARE),
// delivery at a Health Institution, Legal Guardian informant with the full
// extra-fields flow. Mother's details are available (date of birth
// intentionally left blank); father's are not. The sheet also calls for a
// supporting document, but NOTIFY is a pre-declaration action (see
// ActionType.ts) - the review page for this submission never renders an
// "Upload supporting documents" section at all (confirmed live: Child,
// Informant, Mother, Father and Annotations are the only sections listed),
// so there is no document step to use here.
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  login,
  continueForm,
  goToSection,
  drawSignature,
  triggerDeclarationAction,
  formatName,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  expectRowValue,
  switchEventTab
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { navigateToWorkqueue, selectLocationOption } from '../../../../utils'
import { openBirthDeclaration, fillDate } from '../../../birth/helpers'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { selectDropdownOption } from './helpers'

test("7. Notify a birth as a Hospital Official - Health Institution delivery, Legal guardian informant, mother's DOB intentionally blank, father unavailable", async ({
  page
}) => {
  const childFirstName = 'Anna'
  // Unique suffix avoids colliding with any stray same-titled record left
  // behind by a previous run of this test.
  const childSurname = `Brown${faker.string.alphanumeric(6)}`
  const informantFirstName = faker.person.firstName('female')
  const informantSurname = faker.person.lastName('female')
  const motherFirstName = faker.person.firstName('female')
  const motherSurname = faker.person.lastName('female')

  const childDob = getRandomDate(0, 200)
  const informantDob = getRandomDate(18, 3650)

  const childWeight = '3.4'
  // The facility list is scoped to the declaring user's own jurisdiction -
  // this Hospital Official's office only offers this facility.
  const childFacility = 'Ibombo District Hospital'

  const informantEmail = faker.internet.email()
  const informantNid = faker.string.numeric(10)

  const motherNid = faker.string.numeric(10)

  const fatherReason = 'Father is unknown.'

  await test.step('Log in as the Hospital Official and start a birth declaration', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL_OTHER)
    await openBirthDeclaration(page)
  })

  await test.step("Fill the child's details", async () => {
    await page.locator('#firstname').fill(childFirstName)
    await page.locator('#surname').fill(childSurname)
    await page.locator('#child____gender').click()
    await selectDropdownOption(page, 'Female')
    await fillDate(page, childDob)

    await page.locator('#child____placeOfBirth').click()
    await selectDropdownOption(page, 'Health Institution')
    await page
      .locator('#child____birthLocation')
      .fill(childFacility.slice(0, 3))
    await page.getByText(childFacility, { exact: true }).click()

    await page.locator('#child____attendantAtBirth').click()
    await selectDropdownOption(page, 'None')

    await page.locator('#child____birthType').click()
    await selectDropdownOption(page, 'Single')

    await page.locator('#child____weightAtBirth').fill(childWeight)

    await continueForm(page)
  })

  await test.step("Fill the informant's details (Legal guardian)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Legal guardian')
    await page.locator('#informant____email').fill(informantEmail)

    // Legal guardian is not Mother/Father, so the informant page shows its
    // own extra fields: name, DOB, nationality, ID, and a full residential
    // address (birth's informant page has no "same as child" toggle).
    await page.locator('#firstname').fill(informantFirstName)
    await page.locator('#surname').fill(informantSurname)
    await fillDate(page, informantDob)

    await page.locator('#informant____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#informant____idType').click()
    await selectDropdownOption(page, 'National ID')
    await page.locator('#informant____nid').fill(informantNid)

    // Usual place of residence: simple Farajaland address.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await continueForm(page)
  })

  await test.step("Fill the mother's details, leaving date of birth blank", async () => {
    await page.locator('#firstname').fill(motherFirstName)
    await page.locator('#surname').fill(motherSurname)

    // Date of birth is intentionally left blank for this declaration - a
    // NOTIFY (not a full DECLARE) doesn't enforce completeness the same way.
    await page.locator('#mother____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#mother____idType').click()
    await selectDropdownOption(page, 'National ID')
    await page.locator('#mother____nid').fill(motherNid)

    // Usual place of residence: simple Farajaland address.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await page.locator('#mother____maritalStatus').click()
    await selectDropdownOption(page, 'Separated')

    await page.locator('#mother____educationalAttainment').click()
    await selectDropdownOption(page, 'Primary')

    await goToSection(page, 'father')
  })

  await test.step("Father's details are not available", async () => {
    await page.getByLabel("Father's details are not available").check()
    await page.locator('#father____reason').fill(fatherReason)

    await goToSection(page, 'review')
  })

  await test.step('Add the review comment and signature, then notify', async () => {
    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await triggerDeclarationAction(page, 'Notify')
  })

  const childName = formatName({
    firstNames: childFirstName,
    familyName: childSurname
  })

  await test.step('Open the declaration from the Recent workqueue', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, childName)
  })

  await test.step('The declaration status is Notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await test.step('The record matches the data that was filled in', async () => {
    await switchEventTab(page, 'Record')

    await expectRowValue(page, 'child.name', childName)
    await expectRowValue(page, 'child.gender', 'Female')
    await expectRowValue(
      page,
      'child.dob',
      formatDateObjectTo_dMMMMyyyy(childDob)
    )
    await expectRowValue(page, 'child.placeOfBirth', 'Health Institution')
    await expectRowValue(page, 'child.birthLocation', childFacility)
    await expectRowValue(page, 'child.attendantAtBirth', 'None')
    await expectRowValue(page, 'child.birthType', 'Single')
    await expectRowValue(page, 'child.weightAtBirth', childWeight)

    await expectRowValue(page, 'informant.relation', 'Legal guardian')
    await expectRowValue(page, 'informant.email', informantEmail)
    await expectRowValue(
      page,
      'informant.name',
      formatName({
        firstNames: informantFirstName,
        familyName: informantSurname
      })
    )
    await expectRowValue(
      page,
      'informant.dob',
      formatDateObjectTo_dMMMMyyyy(informantDob)
    )
    await expectRowValue(page, 'informant.nationality', 'Farajaland')
    await expectRowValue(page, 'informant.idType', 'National ID')
    await expectRowValue(page, 'informant.nid', informantNid)
    await expectRowValue(page, 'informant.address', 'Klow')

    await expectRowValue(
      page,
      'mother.name',
      formatName({ firstNames: motherFirstName, familyName: motherSurname })
    )
    await expectRowValue(page, 'mother.nationality', 'Farajaland')
    await expectRowValue(page, 'mother.idType', 'National ID')
    await expectRowValue(page, 'mother.nid', motherNid)
    await expectRowValue(page, 'mother.maritalStatus', 'Separated')
    await expectRowValue(page, 'mother.educationalAttainment', 'Primary')
    await expectRowValue(page, 'mother.address', 'Klow')

    await expectRowValue(page, 'father.detailsNotAvailable', 'Yes')
    await expectRowValue(page, 'father.reason', fatherReason)
  })
})
