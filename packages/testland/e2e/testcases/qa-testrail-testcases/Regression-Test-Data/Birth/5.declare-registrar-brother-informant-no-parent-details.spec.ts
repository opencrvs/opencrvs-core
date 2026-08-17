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
// Regression test data - Birth, Declaration Number 5:
// Sent by a Local Registrar, delivery at an "Other" rural Farajaland
// location (full address fields), Brother informant with the full
// extra-fields flow identified by an existing Birth Registration Number,
// residing abroad (simple address). Neither mother's nor father's details
// are available.
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  login,
  getToken,
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
import { createDeclaration as registerBirthForBrn } from '../../../test-data/birth-declaration'
import { selectDropdownOption } from './helpers'

test('5. Complete birth declaration by a Local Registrar - rural "Other" delivery location, Brother informant with BRN identity, neither parent\'s details available', async ({
  page
}) => {
  const childFirstName = 'Richard the 3rd'
  // Unique suffix avoids colliding with any stray same-titled record left
  // behind by a previous run of this test.
  const childSurname = `Doppler${faker.string.alphanumeric(6)}`
  const informantFirstName = faker.person.firstName('male')
  const informantSurname = faker.person.lastName('male')

  const childDob = getRandomDate(0, 200)
  const informantDob = getRandomDate(18, 3650)

  const childWeight = '2.9'

  const childTown = faker.location.city()
  const childResidentialArea = faker.location.county()
  const childStreet = faker.location.street()
  const childNumber = faker.location.buildingNumber()
  const childZipCode = faker.location.zipCode()

  const informantEmail = faker.internet.email()
  const informantState = faker.location.state()
  const informantDistrict = faker.location.county()

  const motherReason = 'Mother is deceased.'
  const fatherReason = 'Father is missing.'

  let brn: string

  await test.step('Register a birth record via the API to use its registration number as a BRN', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await registerBirthForBrn(token)
    expect(res.registrationNumber).toBeDefined()
    brn = res.registrationNumber!
  })

  await test.step('Log in as the Local Registrar and start a birth declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
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

    // Province/district are pre-filled and disabled, anchored to the
    // declaring user's own office - village is left open unless the
    // office itself is anchored at village level.
    const villageInput = page.locator('#village')
    if (!(await villageInput.isDisabled())) {
      await villageInput.click()
      await selectLocationOption(page, 'Klow')
    }

    // Farajaland-rural "fill up all fields".
    await page.locator('#town').fill(childTown)
    await page.locator('#residentialArea').fill(childResidentialArea)
    await page.locator('#street').fill(childStreet)
    await page.locator('#number').fill(childNumber)
    await page.locator('#zipCode').fill(childZipCode)

    await page.locator('#child____attendantAtBirth').click()
    await selectDropdownOption(page, 'Layperson')

    await page.locator('#child____birthType').click()
    await selectDropdownOption(page, 'Higher multiple delivery')

    await page.locator('#child____weightAtBirth').fill(childWeight)

    await continueForm(page)
  })

  await test.step("Fill the informant's details (Brother)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Brother')
    await page.locator('#informant____email').fill(informantEmail)

    // Brother is not Mother/Father, so the informant page shows its own
    // extra fields: name, DOB, nationality, ID, and a full residential
    // address (birth's informant page has no "same as child" toggle).
    await page.locator('#firstname').fill(informantFirstName)
    await page.locator('#surname').fill(informantSurname)
    await fillDate(page, informantDob)

    await page.locator('#informant____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#informant____idType').click()
    await selectDropdownOption(page, 'Birth Registration Number')
    await page.locator('#informant____brn').fill(brn)

    // Usual place of residence: other than Farajaland (simple - only the
    // two required international fields, no "fill up all fields" here).
    await page.locator('#country').click()
    await page.locator('#country input').fill('Ken')
    await page.locator('#country').getByText('Kenya', { exact: true }).click()

    await page.locator('#state').fill(informantState)
    await page.locator('#district2').fill(informantDistrict)

    await continueForm(page)
  })

  await test.step("Mother's details are not available", async () => {
    await page.getByLabel("Mother's details are not available").check()
    await page.locator('#mother____reason').fill(motherReason)

    await continueForm(page)
  })

  await test.step("Father's details are not available", async () => {
    await page.getByLabel("Father's details are not available").check()
    await page.locator('#father____reason').fill(fatherReason)

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
    await expectRowValue(page, 'child.attendantAtBirth', 'Layperson')
    await expectRowValue(page, 'child.birthType', 'Higher multiple delivery')
    await expectRowValue(page, 'child.weightAtBirth', childWeight)

    await expectRowValue(page, 'informant.relation', 'Brother')
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
    await expectRowValue(page, 'informant.idType', 'Birth Registration Number')
    await expectRowValue(page, 'informant.brn', brn)
    await expectRowValue(page, 'informant.address', 'Kenya')
    await expectRowValue(page, 'informant.address', informantState)
    await expectRowValue(page, 'informant.address', informantDistrict)

    await expectRowValue(page, 'mother.detailsNotAvailable', 'Yes')
    await expectRowValue(page, 'mother.reason', motherReason)

    await expectRowValue(page, 'father.detailsNotAvailable', 'Yes')
    await expectRowValue(page, 'father.reason', fatherReason)
  })
})
