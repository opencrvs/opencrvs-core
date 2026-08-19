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
// Regression test data - Birth, Declaration Number 1:
// Complete declaration by a Community Leader, delivery at the family's
// residential address, both parents' details available, both residing at
// the same (Farajaland) address, Date used for mother/father's DOB.
import { expect, test, type Page } from '@playwright/test'
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
import { openBirthDeclaration, fillDate } from '../../../birth/helpers'
import { navigateToWorkqueue, selectLocationOption } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/**
 * react-select options render as plain divs with no `option` role, and the
 * field's already-selected value can match the same text once the dropdown
 * is open (several of these fields come pre-filled with the same default
 * we're selecting) - so scope the click to the open option list itself
 * rather than a page-wide text match.
 */
async function selectDropdownOption(page: Page, value: string) {
  await page
    .locator('.react-select__option')
    .getByText(value, { exact: true })
    .click()
}

test('1. Complete birth declaration by a Community Leader - residential delivery, both parents present, same residence', async ({
  page
}) => {
  const childFirstName = 'Jack'
  // TODO: revert to the sheet's exact 'Collen' once the environment's stray
  // duplicate "Jack Collen" records (from earlier debug runs) are cleaned up -
  // openRecordByTitle can otherwise open the wrong same-titled record.
  const childSurname = `Collen${faker.string.alphanumeric(5)}`
  const motherFirstName = faker.person.firstName('female')
  const motherSurname = faker.person.lastName('female')
  const fatherFirstName = faker.person.firstName('male')
  const fatherSurname = faker.person.lastName('male')

  const childDob = getRandomDate(0, 200)
  const motherDob = getRandomDate(20, 200)
  const fatherDob = getRandomDate(22, 200)

  const informantEmail = faker.internet.email()
  const motherNid = faker.string.numeric(10)
  const fatherNid = faker.string.numeric(10)

  await test.step('Log in as the Community Leader and start a birth declaration', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
    await openBirthDeclaration(page)
  })

  await test.step("Fill the child's details", async () => {
    await page.locator('#firstname').fill(childFirstName)
    await page.locator('#surname').fill(childSurname)
    await page.locator('#child____gender').click()
    await selectDropdownOption(page, 'Male')
    await fillDate(page, childDob)

    await page.locator('#child____placeOfBirth').click()
    await selectDropdownOption(page, 'Residential address')

    // Village is pre-filled and disabled when the declaring user's own
    // office is anchored at village level (a Community Leader's own office
    // is at that level) - only pick it when it's left open for selection.
    const villageInput = page.locator('#village')
    if (!(await villageInput.isDisabled())) {
      await villageInput.click()
      await selectLocationOption(page, 'Klow')
    }

    await page.locator('#child____attendantAtBirth').click()
    await selectDropdownOption(page, 'Physician')

    await page.locator('#child____birthType').click()
    await selectDropdownOption(page, 'Single')

    await page.locator('#child____weightAtBirth').fill('2.4')

    await continueForm(page)
  })

  await test.step("Fill the informant's details (Mother)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Mother')
    await page.locator('#informant____email').fill(informantEmail)
    await continueForm(page)
  })

  await test.step("Fill the mother's details", async () => {
    await page.locator('#firstname').fill(motherFirstName)
    await page.locator('#surname').fill(motherSurname)
    await fillDate(page, motherDob)

    await page.locator('#mother____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#mother____idType').click()
    await selectDropdownOption(page, 'National ID')
    await page.locator('#mother____nid').fill(motherNid)

    // Same residence as the child's own place of birth (Klow, Ibombo, Central).
    // province/district/village are the location-search widget family (same
    // as village) - their options render with id="locationOption*", not the
    // plain react-select markup selectDropdownOption targets.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await page.locator('#mother____maritalStatus').click()
    await selectDropdownOption(page, 'Single')

    await page.locator('#mother____educationalAttainment').click()
    await selectDropdownOption(page, 'No schooling')

    await continueForm(page)
  })

  await test.step("Fill the father's details", async () => {
    await page.locator('#firstname').fill(fatherFirstName)
    await page.locator('#surname').fill(fatherSurname)
    await fillDate(page, fatherDob)

    await page.locator('#father____nationality').click()
    await selectDropdownOption(page, 'Gabon')

    await page.locator('#father____idType').click()
    await selectDropdownOption(page, 'National ID')
    await page.locator('#father____nid').fill(fatherNid)

    await page.locator('#father____addressSameAs_YES').click()

    await page.locator('#father____maritalStatus').click()
    await selectDropdownOption(page, 'Single')

    await page.locator('#father____educationalAttainment').click()
    await selectDropdownOption(page, 'No schooling')

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Add the review comment and signature, then declare', async () => {
    await goToSection(page, 'review')

    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await triggerDeclarationAction(page, 'Declare')
  })

  const childName = formatName({
    firstNames: childFirstName,
    familyName: childSurname
  })

  await test.step('Open the declaration from the Recent workqueue', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, childName)
  })

  await test.step('The declaration status is Declared, with no flags', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toHaveText('No flags')
  })

  await test.step('The record matches the data that was filled in', async () => {
    await switchEventTab(page, 'Record')

    await expectRowValue(page, 'child.name', childName)
    await expectRowValue(page, 'child.gender', 'Male')
    await expectRowValue(
      page,
      'child.dob',
      formatDateObjectTo_dMMMMyyyy(childDob)
    )
    await expectRowValue(page, 'child.placeOfBirth', 'Residential address')
    await expectRowValue(page, 'child.birthLocation.privateHome', 'Klow')
    await expectRowValue(page, 'child.attendantAtBirth', 'Physician')
    await expectRowValue(page, 'child.birthType', 'Single')
    await expectRowValue(page, 'child.weightAtBirth', '2.4')

    await expectRowValue(page, 'informant.relation', 'Mother')
    await expectRowValue(page, 'informant.email', informantEmail)

    await expectRowValue(
      page,
      'mother.name',
      formatName({ firstNames: motherFirstName, familyName: motherSurname })
    )
    await expectRowValue(page, 'mother.nationality', 'Farajaland')
    await expectRowValue(page, 'mother.idType', 'National ID')
    await expectRowValue(page, 'mother.nid', motherNid)
    await expectRowValue(page, 'mother.maritalStatus', 'Single')
    await expectRowValue(page, 'mother.educationalAttainment', 'No schooling')
    await expectRowValue(page, 'mother.address', 'Klow')

    await expectRowValue(
      page,
      'father.name',
      formatName({ firstNames: fatherFirstName, familyName: fatherSurname })
    )
    await expectRowValue(page, 'father.nationality', 'Gabon')
    await expectRowValue(page, 'father.idType', 'National ID')
    await expectRowValue(page, 'father.nid', fatherNid)
    await expectRowValue(page, 'father.maritalStatus', 'Single')
    await expectRowValue(page, 'father.educationalAttainment', 'No schooling')
    // Father's address was set via "Same as Mother's" - the record shows a
    // confirmation row instead of repeating the full address.
    await expectRowValue(page, 'father.addressSameAs', 'Yes')
  })
})
