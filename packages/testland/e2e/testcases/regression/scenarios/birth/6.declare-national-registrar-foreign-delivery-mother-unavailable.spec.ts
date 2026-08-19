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
// Regression test data - Birth, Declaration Number 6:
// Sent by a National Registrar, delivery at an "Other" location in a
// different country (full address fields), Sister informant with the full
// extra-fields flow, a simple Farajaland residence. Mother's details are
// not available; father's details are available with a National ID.
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
import {
  generateSurnameWithApostrophe,
  selectCountry,
  selectDropdownOption
} from './helpers'

test('6. Complete birth declaration by a National Registrar - foreign "Other" delivery location, Sister informant, mother\'s details not available', async ({
  page
}) => {
  // The child's foreign address alone fills 7 fields, on top of the usual
  // form steps - give this more headroom than the 90s default.
  test.setTimeout(150_000)

  const childFirstName = faker.person.firstName('male')
  // Apostrophe prefix exercises the app's apostrophe-in-name validation
  // (only a plain ASCII apostrophe is accepted, not a curly quote)
  const childSurname = generateSurnameWithApostrophe()
  const informantFirstName = faker.person.firstName('female')
  const informantSurname = faker.person.lastName('female')
  const fatherFirstName = faker.person.firstName('male')
  const fatherSurname = faker.person.lastName('male')

  const childDob = getRandomDate(0, 200)
  const informantAge = faker.number.int({ min: 20, max: 60 })
  const fatherDob = getRandomDate(22, 200)

  const childWeight = '3.1'

  const childState = faker.location.state()
  const childDistrict2 = faker.location.county()
  const childTown = faker.location.city()
  const childAddressLine1 = faker.location.county()
  const childAddressLine2 = faker.location.street()
  const childAddressLine3 = faker.location.buildingNumber()
  const childZipCode = faker.location.zipCode()

  const informantEmail = faker.internet.email()

  const motherReason = 'Mother is untraceable.'

  const fatherNid = faker.string.numeric(10)

  await test.step('Log in as the National Registrar and start a birth declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
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

    // Delivery abroad - switch away from the Farajaland default and fill
    // every field ("fill up all fields").
    await selectCountry(page, 'Nigeria')

    await page.locator('#state').fill(childState)
    await page.locator('#district2').fill(childDistrict2)
    await page.locator('#cityOrTown').fill(childTown)
    await page.locator('#addressLine1').fill(childAddressLine1)
    await page.locator('#addressLine2').fill(childAddressLine2)
    await page.locator('#addressLine3').fill(childAddressLine3)
    await page.locator('#postcodeOrZip').fill(childZipCode)

    await page.locator('#child____attendantAtBirth').click()
    await selectDropdownOption(page, 'Traditional birth attendant')

    await page.locator('#child____birthType').click()
    await selectDropdownOption(page, 'Single')

    await page.locator('#child____weightAtBirth').fill(childWeight)

    await continueForm(page)
  })

  await test.step("Fill the informant's details (Sister)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Sister')
    await page.locator('#informant____email').fill(informantEmail)

    // Sister is not Mother/Father, so the informant page shows its own extra
    // fields: name, DOB, nationality, ID, and a full residential address
    // (birth's informant page has no "same as child" toggle).
    await page.locator('#firstname').fill(informantFirstName)
    await page.locator('#surname').fill(informantSurname)

    await page.getByLabel('Exact date of birth unknown').check()
    await page.locator('#informant____age').fill(informantAge.toString())

    await page.locator('#informant____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#informant____idType').click()
    await selectDropdownOption(page, 'None')

    // Usual place of residence isn't specified - a simple Farajaland
    // address.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

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
    await fillDate(page, fatherDob)

    await page.locator('#father____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#father____idType').click()
    await selectDropdownOption(page, 'National ID')
    await page.locator('#father____nid').fill(fatherNid)

    // Mother's details aren't available, so there's no "same as mother's
    // residence" toggle this time - the address field shows directly.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await page.locator('#father____maritalStatus').click()
    await selectDropdownOption(page, 'Separated')

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
    await expectRowValue(page, 'child.placeOfBirth', 'Other')
    await expectRowValue(page, 'child.birthLocation.other', 'Nigeria')
    await expectRowValue(page, 'child.birthLocation.other', childState)
    await expectRowValue(page, 'child.birthLocation.other', childDistrict2)
    await expectRowValue(page, 'child.birthLocation.other', childTown)
    await expectRowValue(page, 'child.birthLocation.other', childAddressLine1)
    await expectRowValue(page, 'child.birthLocation.other', childAddressLine2)
    await expectRowValue(page, 'child.birthLocation.other', childAddressLine3)
    await expectRowValue(page, 'child.birthLocation.other', childZipCode)
    await expectRowValue(
      page,
      'child.attendantAtBirth',
      'Traditional birth attendant'
    )
    await expectRowValue(page, 'child.birthType', 'Single')
    await expectRowValue(page, 'child.weightAtBirth', childWeight)

    await expectRowValue(page, 'informant.relation', 'Sister')
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
    await expectRowValue(page, 'informant.nationality', 'Farajaland')
    await expectRowValue(page, 'informant.idType', 'None')
    await expectRowValue(page, 'informant.address', 'Klow')

    await expectRowValue(page, 'mother.detailsNotAvailable', 'Yes')
    await expectRowValue(page, 'mother.reason', motherReason)

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
    await expectRowValue(page, 'father.idType', 'National ID')
    await expectRowValue(page, 'father.nid', fatherNid)
    await expectRowValue(page, 'father.maritalStatus', 'Separated')
    await expectRowValue(page, 'father.educationalAttainment', 'No schooling')
    await expectRowValue(page, 'father.address', 'Klow')
  })
})
