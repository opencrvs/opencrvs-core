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
// Regression test data - Birth, Declaration Number 3:
// Sent by a Registration Officer, Grandfather informant with the full
// extra-fields flow, mother/father/informant all identified by an existing
// Birth Registration Number, delivery at a rural Farajaland residential
// address (full address fields), mother and informant reside abroad,
// father's residence is different from mother's (also full fields),
// supporting documents provided for every section.
import { expect, test, type Page } from '@playwright/test'
import path from 'path'
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
  switchEventTab,
  uploadImage
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { openBirthDeclaration, fillDate } from '../../../birth/helpers'
import { navigateToWorkqueue, selectLocationOption } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import {
  selectCountry,
  selectDropdownOption,
  uploadImageToSectionWithFile
} from './helpers'
import { fetchBirthRegistrationNumberForTesting } from '../../helper'

const imageUploadSectionTitles = [
  'National ID',
  'Passport',
  'Birth Certificate',
  'Other'
]

// Shared across the whole testland package - every upload in this
// declaration reuses this one real (~528KB) file rather than a set of
// per-purpose local assets. __dirname-relative so this doesn't break if
// Playwright is ever invoked from a different working directory.
const SHARED_ASSET = path.join(__dirname, '../../../../assets/528KB-random.png')

async function uploadAllTypesForSection(page: Page, sectionId: string) {
  for (const sectionTitle of imageUploadSectionTitles) {
    await uploadImageToSectionWithFile({
      page,
      sectionLocator: page.locator(`#${sectionId}`),
      sectionTitle,
      buttonLocator: page.locator(`button[name="${sectionId}"]`),
      image: SHARED_ASSET
    })
  }
}

test('3. Complete birth declaration by a Registration Officer - rural residential delivery, Grandfather informant, BRN identity, documents provided', async ({
  page
}) => {
  // 13 real (~528KB each) document uploads plus a BRN pre-registration API
  // call push this well past the default 90s budget.
  test.setTimeout(240_000)

  // The sheet says: "John_Peter"
  const childFirstName = `${faker.person.firstName()}_${faker.person.firstName()}`
  const childSurname = faker.person.lastName()
  const informantFirstName = faker.person.firstName('male')
  const informantSurname = faker.person.lastName('male')
  const motherFirstName = faker.person.firstName('female')
  const motherSurname = faker.person.lastName('female')
  const fatherFirstName = faker.person.firstName('male')
  const fatherSurname = faker.person.lastName('male')

  const childDob = getRandomDate(0, 200)
  const informantDob = getRandomDate(55, 3650)
  const motherDob = getRandomDate(20, 200)
  const fatherAge = faker.number.int({ min: 30, max: 60 })

  const childWeight = '3.2'

  const childTown = faker.location.city()
  const childResidentialArea = faker.location.county()
  const childStreet = faker.location.street()
  const childNumber = faker.location.buildingNumber()
  const childZipCode = faker.location.zipCode()

  const informantEmail = faker.internet.email()
  const informantNid = faker.string.numeric(10)

  const motherState = faker.location.state()
  const motherDistrict = faker.location.county()
  const motherTown = faker.location.city()
  const motherAddressLine1 = faker.location.county()
  const motherAddressLine2 = faker.location.street()
  const motherAddressLine3 = faker.location.buildingNumber()
  const motherZipCode = faker.location.zipCode()

  const fatherTown = faker.location.city()
  const fatherResidentialArea = faker.location.county()
  const fatherStreet = faker.location.street()
  const fatherNumber = faker.location.buildingNumber()
  const fatherZipCode = faker.location.zipCode()

  let brn: string

  await test.step('Register a birth record via the API to use its registration number as a BRN', async () => {
    brn = await fetchBirthRegistrationNumberForTesting()
  })

  await test.step('Log in as the Registration Officer and start a birth declaration', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openBirthDeclaration(page)
  })

  await test.step("Fill the child's details", async () => {
    await page.locator('#firstname').fill(childFirstName)
    await page.locator('#surname').fill(childSurname)
    await page.locator('#child____gender').click()
    await selectDropdownOption(page, 'Unknown')
    await fillDate(page, childDob)

    await page.locator('#child____placeOfBirth').click()
    await selectDropdownOption(page, 'Residential address')

    // Farajaland-rural "fill up all fields".
    await page.locator('#town').fill(childTown)
    await page.locator('#residentialArea').fill(childResidentialArea)
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')
    await page.locator('#street').fill(childStreet)
    await page.locator('#number').fill(childNumber)
    await page.locator('#zipCode').fill(childZipCode)

    await page.locator('#child____attendantAtBirth').click()
    await selectDropdownOption(page, 'Midwife')

    await page.locator('#child____birthType').click()
    await selectDropdownOption(page, 'Triplet')

    await page.locator('#child____weightAtBirth').fill(childWeight)

    await continueForm(page)
  })

  await test.step("Fill the informant's details (Grandfather)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Grandfather')
    await page.locator('#informant____email').fill(informantEmail)

    // Grandfather is not Mother/Father, so the informant page shows its own
    // extra fields: name, DOB, nationality, ID, and a full residential
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

  await test.step("Fill the mother's details", async () => {
    await page.locator('#firstname').fill(motherFirstName)
    await page.locator('#surname').fill(motherSurname)
    await fillDate(page, motherDob)

    await page.locator('#mother____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#mother____idType').click()
    await selectDropdownOption(page, 'Birth Registration Number')
    await page.locator('#mother____brn').fill(brn)

    // Usual place of residence: other than Farajaland (different country
    // from the informant's, per the declaration notes).
    await selectCountry(page, 'Djibouti')

    await page.locator('#state').fill(motherState)
    await page.locator('#district2').fill(motherDistrict)
    await page.locator('#cityOrTown').fill(motherTown)
    await page.locator('#addressLine1').fill(motherAddressLine1)
    await page.locator('#addressLine2').fill(motherAddressLine2)
    await page.locator('#addressLine3').fill(motherAddressLine3)
    await page.locator('#postcodeOrZip').fill(motherZipCode)

    await page.locator('#mother____maritalStatus').click()
    await selectDropdownOption(page, 'Widowed')

    await page.locator('#mother____educationalAttainment').click()
    await selectDropdownOption(page, 'Secondary')

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
    await selectDropdownOption(page, 'Birth Registration Number')
    await page.locator('#father____brn').fill(brn)

    // Not the same as mother's - a separate, fully-detailed rural address.
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
    await selectDropdownOption(page, 'Widowed')

    await page.locator('#father____educationalAttainment').click()
    await selectDropdownOption(page, 'Secondary')

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Upload supporting documents for every section', async () => {
    await goToSection(page, 'documents')

    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]'),
      SHARED_ASSET
    )

    await uploadAllTypesForSection(page, 'documents____proofOfMother')
    await uploadAllTypesForSection(page, 'documents____proofOfFather')
    await uploadAllTypesForSection(page, 'documents____proofOfInformant')

    await goToSection(page, 'review')
  })

  await test.step('Add the review comment and signature, then declare', async () => {
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

    // The Record tab renders every uploaded document, and this declaration
    // uploads 13 real (~528KB each) images, so give it longer than the
    // default timeout to finish loading before asserting on it.
    await expect(page.getByTestId('child.name-value')).toBeVisible({
      timeout: 60_000
    })

    await expectRowValue(page, 'child.name', childName)
    await expectRowValue(page, 'child.gender', 'Unknown')
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
    await expectRowValue(page, 'child.attendantAtBirth', 'Midwife')
    await expectRowValue(page, 'child.birthType', 'Triplet')
    await expectRowValue(page, 'child.weightAtBirth', childWeight)

    await expectRowValue(page, 'informant.relation', 'Grandfather')
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
    await expectRowValue(page, 'mother.idType', 'Birth Registration Number')
    await expectRowValue(page, 'mother.brn', brn)
    await expectRowValue(page, 'mother.maritalStatus', 'Widowed')
    await expectRowValue(page, 'mother.educationalAttainment', 'Secondary')
    await expectRowValue(page, 'mother.address', 'Djibouti')
    await expectRowValue(page, 'mother.address', motherState)
    await expectRowValue(page, 'mother.address', motherDistrict)
    await expectRowValue(page, 'mother.address', motherTown)
    await expectRowValue(page, 'mother.address', motherAddressLine1)
    await expectRowValue(page, 'mother.address', motherAddressLine2)
    await expectRowValue(page, 'mother.address', motherAddressLine3)
    await expectRowValue(page, 'mother.address', motherZipCode)

    await expectRowValue(
      page,
      'father.name',
      formatName({ firstNames: fatherFirstName, familyName: fatherSurname })
    )
    await expectRowValue(page, 'father.age', fatherAge.toString())
    await expectRowValue(page, 'father.nationality', 'Farajaland')
    await expectRowValue(page, 'father.idType', 'Birth Registration Number')
    await expectRowValue(page, 'father.brn', brn)
    await expectRowValue(page, 'father.maritalStatus', 'Widowed')
    await expectRowValue(page, 'father.educationalAttainment', 'Secondary')
    // Father's is a "fill up all fields" address, different from mother's.
    await expectRowValue(page, 'father.address', 'Sulaka')
    await expectRowValue(page, 'father.address', 'Irundu')
    await expectRowValue(page, 'father.address', 'Xhosa')
    await expectRowValue(page, 'father.address', fatherTown)
    await expectRowValue(page, 'father.address', fatherResidentialArea)
    await expectRowValue(page, 'father.address', fatherStreet)
    await expectRowValue(page, 'father.address', fatherNumber)
    await expectRowValue(page, 'father.address', fatherZipCode)
  })

  await test.step('All the uploaded supporting documents appear in the document viewer', async () => {
    // The Record tab's document viewer (#select_document) lists one option
    // per uploaded file, labelled "{field label} ({type label})" - switching
    // through every one confirms it's both listed and actually selectable,
    // not just that its type label happens to render somewhere on the page.
    const documentSelect = page.locator('#select_document')
    const combobox = documentSelect.getByRole('combobox')

    const documentLabels = [
      'Proof of birth (Notification of birth)',
      ...imageUploadSectionTitles.map(
        (type) => `Proof of mother's ID (${type})`
      ),
      ...imageUploadSectionTitles.map(
        (type) => `Proof of father's ID (${type})`
      ),
      ...imageUploadSectionTitles.map(
        (type) => `Proof of informant's ID (${type})`
      )
    ]

    for (const label of documentLabels) {
      await combobox.click()
      await page.getByRole('option', { name: label, exact: true }).click()
      await expect(documentSelect).toContainText(label)
    }
  })
})
