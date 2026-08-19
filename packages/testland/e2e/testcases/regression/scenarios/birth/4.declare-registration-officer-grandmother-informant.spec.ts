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
// Regression test data - Birth, Declaration Number 4:
// Sent by a Registration Officer, delivery at an "Other" urban Farajaland
// location (full address fields), Grandmother informant with the full
// extra-fields flow (age-based DOB, foreign nationality, Passport ID,
// simple Farajaland residence), mother and father both have no ID type,
// father's residence is different from mother's - a simple address abroad.
// No supporting documents required for this declaration.
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
import { openBirthDeclaration, fillDate } from '../../../birth/helpers'
import { navigateToWorkqueue, selectLocationOption } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { selectCountry, selectDropdownOption } from './helpers'

test('4. Complete birth declaration by a Registration Officer - "Other" urban delivery location, Grandmother informant, no ID for either parent', async ({
  page
}) => {
  const childFirstName = `${faker.person.firstName('male')}-${faker.person.firstName('male')}`
  const childSurname = faker.person.lastName()
  const informantFirstName = faker.person.firstName('female')
  const informantSurname = faker.person.lastName('female')
  const motherFirstName = faker.person.firstName('female')
  const motherSurname = faker.person.lastName('female')
  const fatherFirstName = faker.person.firstName('male')
  const fatherSurname = faker.person.lastName('male')

  const childDob = getRandomDate(0, 200)
  const informantAge = faker.number.int({ min: 60, max: 85 })
  const motherAge = faker.number.int({ min: 20, max: 45 })
  const fatherDob = getRandomDate(22, 200)

  const childWeight = '3.5'

  const childTown = faker.location.city()
  const childResidentialArea = faker.location.county()
  const childStreet = faker.location.street()
  const childNumber = faker.location.buildingNumber()
  const childZipCode = faker.location.zipCode()

  const informantEmail = faker.internet.email()
  const informantPassport = faker.string.numeric(9)

  const fatherState = faker.location.state()
  const fatherDistrict2 = faker.location.county()

  await test.step('Log in as the Registration Officer and start a birth declaration', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openBirthDeclaration(page)
  })

  await test.step("Fill the child's details", async () => {
    await page.locator('#firstname').fill(childFirstName)
    await page.locator('#surname').fill(childSurname)
    await page.locator('#child____gender').click()
    await selectDropdownOption(page, 'Male')
    await fillDate(page, childDob)

    await page.locator('#child____placeOfBirth').click()
    await selectDropdownOption(page, 'Other')

    // Farajaland-urban "fill up all fields".
    await page.locator('#town').fill(childTown)
    await page.locator('#residentialArea').fill(childResidentialArea)
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')
    await page.locator('#street').fill(childStreet)
    await page.locator('#number').fill(childNumber)
    await page.locator('#zipCode').fill(childZipCode)

    await page.locator('#child____attendantAtBirth').click()
    await selectDropdownOption(page, 'Other paramedical personnel')

    await page.locator('#child____birthType').click()
    await selectDropdownOption(page, 'Quadruplet')

    await page.locator('#child____weightAtBirth').fill(childWeight)

    await continueForm(page)
  })

  await test.step("Fill the informant's details (Grandmother)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Grandmother')
    await page.locator('#informant____email').fill(informantEmail)

    // Grandmother is not Mother/Father, so the informant page shows its own
    // extra fields: name, DOB, nationality, ID, and a full residential
    // address (birth's informant page has no "same as child" toggle).
    await page.locator('#firstname').fill(informantFirstName)
    await page.locator('#surname').fill(informantSurname)

    await page.getByLabel('Exact date of birth unknown').check()
    await page.locator('#informant____age').fill(informantAge.toString())

    await page.locator('#informant____nationality').click()
    await selectDropdownOption(page, 'Gabon')

    await page.locator('#informant____idType').click()
    await selectDropdownOption(page, 'Passport')
    await page.locator('#informant____passport').fill(informantPassport)

    // Usual place of residence: Farajaland (simple, no full address fields).
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await continueForm(page)
  })

  await test.step("Fill the mother's details", async () => {
    await page.locator('#firstname').fill(motherFirstName)
    await page.locator('#surname').fill(motherSurname)

    await page.getByLabel('Exact date of birth unknown').check()
    await page.locator('#mother____age').fill(motherAge.toString())

    await page.locator('#mother____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#mother____idType').click()
    await selectDropdownOption(page, 'None')

    // Usual place of residence: simple Farajaland address.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await page.locator('#mother____maritalStatus').click()
    await selectDropdownOption(page, 'Divorced')

    await page.locator('#mother____educationalAttainment').click()
    await selectDropdownOption(page, 'Tertiary')

    await continueForm(page)
  })

  await test.step("Fill the father's details", async () => {
    await page.locator('#firstname').fill(fatherFirstName)
    await page.locator('#surname').fill(fatherSurname)
    await fillDate(page, fatherDob)

    await page.locator('#father____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#father____idType').click()
    await selectDropdownOption(page, 'None')

    // Not the same as mother's - a simple address abroad (only the two
    // required international fields, no "fill up all fields" this time).
    await page.locator('#father____addressSameAs_NO').check()

    await selectCountry(page, 'Djibouti')

    await page.locator('#state').fill(fatherState)
    await page.locator('#district2').fill(fatherDistrict2)

    await page.locator('#father____maritalStatus').click()
    await selectDropdownOption(page, 'Divorced')

    await page.locator('#father____educationalAttainment').click()
    await selectDropdownOption(page, 'Tertiary')

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
    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
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
    await expectRowValue(page, 'child.placeOfBirth', 'Other')
    await expectRowValue(page, 'child.birthLocation.other', 'Klow')
    await expectRowValue(page, 'child.birthLocation.other', childTown)
    await expectRowValue(
      page,
      'child.birthLocation.other',
      childResidentialArea
    )
    await expectRowValue(page, 'child.birthLocation.other', childStreet)
    await expectRowValue(page, 'child.birthLocation.other', childNumber)
    await expectRowValue(page, 'child.birthLocation.other', childZipCode)
    await expectRowValue(
      page,
      'child.attendantAtBirth',
      'Other paramedical personnel'
    )
    await expectRowValue(page, 'child.birthType', 'Quadruplet')
    await expectRowValue(page, 'child.weightAtBirth', childWeight)

    await expectRowValue(page, 'informant.relation', 'Grandmother')
    await expectRowValue(page, 'informant.email', informantEmail)
    await expectRowValue(
      page,
      'informant.name',
      formatName({
        firstNames: informantFirstName,
        familyName: informantSurname
      })
    )
    await expectRowValue(page, 'informant.age', informantAge.toString())
    await expectRowValue(page, 'informant.nationality', 'Gabon')
    await expectRowValue(page, 'informant.idType', 'Passport')
    await expectRowValue(page, 'informant.passport', informantPassport)
    await expectRowValue(page, 'informant.address', 'Klow')

    await expectRowValue(
      page,
      'mother.name',
      formatName({ firstNames: motherFirstName, familyName: motherSurname })
    )
    await expectRowValue(page, 'mother.age', motherAge.toString())
    await expectRowValue(page, 'mother.nationality', 'Farajaland')
    await expectRowValue(page, 'mother.idType', 'None')
    await expectRowValue(page, 'mother.maritalStatus', 'Divorced')
    await expectRowValue(page, 'mother.educationalAttainment', 'Tertiary')
    await expectRowValue(page, 'mother.address', 'Klow')

    await expectRowValue(
      page,
      'father.name',
      formatName({ firstNames: fatherFirstName, familyName: fatherSurname })
    )
    await expectRowValue(
      page,
      'father.dob',
      formatDateObjectTo_dMMMMyyyy(fatherDob)
    )
    await expectRowValue(page, 'father.nationality', 'Farajaland')
    await expectRowValue(page, 'father.idType', 'None')
    await expectRowValue(page, 'father.maritalStatus', 'Divorced')
    await expectRowValue(page, 'father.educationalAttainment', 'Tertiary')
    await expectRowValue(page, 'father.address', 'Djibouti')
    await expectRowValue(page, 'father.address', fatherState)
    await expectRowValue(page, 'father.address', fatherDistrict2)
  })
})
