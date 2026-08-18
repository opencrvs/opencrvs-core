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
// Regression test data - Birth, Declaration Number 2:
// Complete declaration by a Community Leader, delivery at the family's
// residential address in a Farajaland urban area (full address fields),
// Father is the informant, mother and father have different residences,
// Age used for mother/father's DOB.
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

test('2. Complete birth declaration by a Community Leader - urban residential delivery, Father informant, parents at different residences', async ({
  page
}) => {
  const childFirstName = faker.person.firstName('female')
  // Unique suffix avoids colliding with any stray same-titled record left
  // behind by a previous run of this test (see declaration 1's note).
  const childSurname = faker.person.lastName()
  const motherFirstName = faker.person.firstName('female')
  const motherSurname = faker.person.lastName('female')
  const fatherFirstName = faker.person.firstName('male')
  const fatherSurname = faker.person.lastName('male')

  const childDob = getRandomDate(0, 200)
  const motherAge = faker.number.int({ min: 20, max: 40 })
  const fatherAge = faker.number.int({ min: 25, max: 45 })

  const informantEmail = faker.internet.email()
  const motherPassport = faker.string.numeric(9)
  const fatherPassport = faker.string.numeric(9)

  const childTown = faker.location.city()
  const childResidentialArea = faker.location.county()
  const childStreet = faker.location.street()
  const childNumber = faker.location.buildingNumber()
  const childZipCode = faker.location.zipCode()

  const fatherTown = faker.location.city()
  const fatherResidentialArea = faker.location.county()
  const fatherStreet = faker.location.street()
  const fatherNumber = faker.location.buildingNumber()
  const fatherZipCode = faker.location.zipCode()

  await test.step('Log in as the Community Leader and start a birth declaration', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
    await openBirthDeclaration(page)
  })

  await test.step("Fill the child's details", async () => {
    await page.locator('#firstname').fill(childFirstName)
    await page.locator('#surname').fill(childSurname)
    await page.locator('#child____gender').click()
    await selectDropdownOption(page, 'Female')
    await fillDate(page, childDob)

    await page.locator('#child____placeOfBirth').click()
    await selectDropdownOption(page, 'Residential address')

    // Farajaland-urban "fill up all fields".
    await page.locator('#town').fill(childTown)
    await page.locator('#residentialArea').fill(childResidentialArea)
    await page.locator('#street').fill(childStreet)
    await page.locator('#number').fill(childNumber)
    await page.locator('#zipCode').fill(childZipCode)

    await page.locator('#child____attendantAtBirth').click()
    await selectDropdownOption(page, 'Nurse')

    await page.locator('#child____birthType').click()
    await selectDropdownOption(page, 'Twin')

    // Weight at birth is intentionally left blank for this declaration.

    await continueForm(page)
  })

  await test.step("Fill the informant's details (Father)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Father')
    await page.locator('#informant____email').fill(informantEmail)
    await continueForm(page)
  })

  await test.step("Fill the mother's details", async () => {
    await page.locator('#firstname').fill(motherFirstName)
    await page.locator('#surname').fill(motherSurname)

    await page.getByLabel('Exact date of birth unknown').check()
    await page.locator('#mother____age').fill(motherAge.toString())

    await page.locator('#mother____nationality').click()
    await selectDropdownOption(page, 'Fiji')

    await page.locator('#mother____idType').click()
    await selectDropdownOption(page, 'Passport')
    await page.locator('#mother____passport').fill(motherPassport)

    // Mother's own residence (Farajaland, Central, Ibombo, Klow) -
    // different from the father's, per the declaration notes.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await page.locator('#mother____maritalStatus').click()
    await selectDropdownOption(page, 'Married')

    await page.locator('#mother____educationalAttainment').click()
    await selectDropdownOption(page, 'Primary')

    await continueForm(page)
  })

  await test.step("Fill the father's details", async () => {
    await page.locator('#firstname').fill(fatherFirstName)
    await page.locator('#surname').fill(fatherSurname)

    await page.getByLabel('Exact date of birth unknown').check()
    await page.locator('#father____age').fill(fatherAge.toString())

    await page.locator('#father____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#father____idType').click()
    await selectDropdownOption(page, 'Passport')
    await page.locator('#father____passport').fill(fatherPassport)

    // Not the same as mother's - a separate, fully-detailed urban address.
    await page.locator('#father____addressSameAs_NO').check()

    await page.locator('#province').click()
    await selectLocationOption(page, 'Sulaka')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Irundu')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Xhosa')

    await page.locator('#town').fill(fatherTown)
    await page.locator('#residentialArea').fill(fatherResidentialArea)
    await page.locator('#street').fill(fatherStreet)
    await page.locator('#number').fill(fatherNumber)
    await page.locator('#zipCode').fill(fatherZipCode)

    await page.locator('#father____maritalStatus').click()
    await selectDropdownOption(page, 'Married')

    await page.locator('#father____educationalAttainment').click()
    await selectDropdownOption(page, 'Primary')

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
    await expectRowValue(page, 'child.gender', 'Female')
    await expectRowValue(
      page,
      'child.dob',
      formatDateObjectTo_dMMMMyyyy(childDob)
    )
    await expectRowValue(page, 'child.placeOfBirth', 'Residential address')
    await expectRowValue(page, 'child.birthLocation.privateHome', 'Klow')
    await expectRowValue(page, 'child.birthLocation.privateHome', childTown)
    await expectRowValue(
      page,
      'child.birthLocation.privateHome',
      childResidentialArea
    )
    await expectRowValue(page, 'child.birthLocation.privateHome', childStreet)
    await expectRowValue(page, 'child.birthLocation.privateHome', childNumber)
    await expectRowValue(page, 'child.birthLocation.privateHome', childZipCode)
    await expectRowValue(page, 'child.attendantAtBirth', 'Nurse')
    await expectRowValue(page, 'child.birthType', 'Twin')

    await expectRowValue(page, 'informant.relation', 'Father')
    await expectRowValue(page, 'informant.email', informantEmail)

    await expectRowValue(
      page,
      'mother.name',
      formatName({ firstNames: motherFirstName, familyName: motherSurname })
    )
    await expectRowValue(page, 'mother.nationality', 'Fiji')
    await expectRowValue(page, 'mother.idType', 'Passport')
    await expectRowValue(page, 'mother.passport', motherPassport)
    await expectRowValue(page, 'mother.maritalStatus', 'Married')
    await expectRowValue(page, 'mother.educationalAttainment', 'Primary')
    await expectRowValue(page, 'mother.address', 'Klow')

    await expectRowValue(
      page,
      'father.name',
      formatName({ firstNames: fatherFirstName, familyName: fatherSurname })
    )
    await expectRowValue(page, 'father.nationality', 'Farajaland')
    await expectRowValue(page, 'father.idType', 'Passport')
    await expectRowValue(page, 'father.passport', fatherPassport)
    await expectRowValue(page, 'father.maritalStatus', 'Married')
    await expectRowValue(page, 'father.educationalAttainment', 'Primary')
    // Father's is the "fill up all fields" address for this declaration -
    // check every component we entered, not just the village.
    await expectRowValue(page, 'father.address', 'Sulaka')
    await expectRowValue(page, 'father.address', 'Irundu')
    await expectRowValue(page, 'father.address', 'Xhosa')
    await expectRowValue(page, 'father.address', fatherTown)
    await expectRowValue(page, 'father.address', fatherResidentialArea)
    await expectRowValue(page, 'father.address', fatherStreet)
    await expectRowValue(page, 'father.address', fatherNumber)
    await expectRowValue(page, 'father.address', fatherZipCode)
  })
})
