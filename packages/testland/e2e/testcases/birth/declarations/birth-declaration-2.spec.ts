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
  continueForm,
  drawSignature,
  formatDateObjectTo_dMMMMyyyy,
  formatName,
  getRandomDate,
  goToSection,
  login,
  switchEventTab,
  expectRowValue,
  validateActionMenuButton,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { validateAddress } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test.describe.serial('2. Birth declaration case - 2', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      gender: 'Female',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Nurse',
    birthType: 'Twin',
    placeOfBirth: 'Other',
    birthLocation: {
      country: 'Farajaland',
      province: 'Central',
      district: 'Ibombo',
      village: 'Klow'
    },
    informantType: 'Father',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      age: 21,
      nationality: 'Fiji',
      identifier: {
        id: faker.string.numeric(12),
        type: 'Passport'
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        village: 'Xhosa',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      },
      maritalStatus: 'Married',
      levelOfEducation: 'Primary'
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      age: 25,
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(8),
        type: 'Passport'
      },
      maritalStatus: 'Married',
      levelOfEducation: 'Primary',
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Zobwe',
        village: 'Chuma',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('2.1 Declaration started by CL', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.COMMUNITY_LEADER)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('2.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()

      await page.locator('#child____attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()

      await page.locator('#child____birthType').click()
      await page
        .getByText(declaration.birthType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test('2.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test("2.1.3 Fill mother's details", async () => {
      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#mother____age')
        .fill(declaration.mother.age.toString())

      await page.locator('#mother____nationality').click()
      await page
        .getByText(declaration.mother.nationality, { exact: true })
        .click()

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____passport')
        .fill(declaration.mother.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()
      await page.locator('#village').click()
      await page
        .getByText(declaration.mother.address.village, { exact: true })
        .click()

      await page.locator('#town').fill(declaration.mother.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.mother.address.residentialArea)
      await page.locator('#street').fill(declaration.mother.address.street)
      await page.locator('#number').fill(declaration.mother.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.mother.address.postcodeOrZip)

      await page.locator('#mother____maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await page.locator('#mother____educationalAttainment').click()
      await page
        .getByText(declaration.mother.levelOfEducation, { exact: true })
        .click()

      await continueForm(page)
    })

    test("2.1.4 Fill father's details", async () => {
      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#father____age')
        .fill(declaration.father.age.toString())

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____passport')
        .fill(declaration.father.identifier.id)

      await page.getByLabel('No', { exact: true }).check()

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.father.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.father.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.father.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.father.address.district, { exact: true })
        .click()
      await page.locator('#village').click()
      await page
        .getByText(declaration.father.address.village, { exact: true })
        .click()
      await page.locator('#town').fill(declaration.father.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.father.address.residentialArea)
      await page.locator('#street').fill(declaration.father.address.street)
      await page.locator('#number').fill(declaration.father.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.father.address.postcodeOrZip)

      await page.locator('#father____maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.locator('#father____educationalAttainment').click()
      await page
        .getByText(declaration.father.levelOfEducation, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('2.1.5 Go To Review', async () => {
      await goToSection(page, 'review')
    })

    test('2.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('child.name-value')).toHaveText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.getByTestId('child.gender-value')).toHaveText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.getByTestId('child.dob-value')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('child.placeOfBirth-value')).toHaveText(
        declaration.placeOfBirth
      )

      await expectRowValue(
        page,
        'child.birthLocation.other',
        `${declaration.birthLocation.country}${declaration.birthLocation.province}${declaration.birthLocation.district}${declaration.birthLocation.village}`
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(page.getByTestId('child.attendantAtBirth-value')).toHaveText(
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.getByTestId('child.birthType-value')).toHaveText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.getByTestId('informant.relation-value')).toHaveText(
        declaration.informantType
      )
      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.getByTestId('informant.email-value')).toHaveText(
        declaration.informantEmail
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('mother.name-value')).toHaveText(
        declaration.mother.name.firstNames +
          ' ' +
          declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's age
       */
      // @TODO: this should pass, but 'years' postfix is not yet implemented on V2
      // await expect(
      //   page.getByTestId(
      //   'mother.age-value')).toHaveText(
      //   joinValuesWith([declaration.mother.age, 'years'])
      // )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.getByTestId('mother.nationality-value')).toHaveText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(page.getByTestId('mother.maritalStatus-value')).toHaveText(
        declaration.mother.maritalStatus
      )

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(
        page.getByTestId('mother.educationalAttainment-value')
      ).toHaveText(declaration.mother.levelOfEducation)

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.getByTestId('mother.idType-value')).toHaveText(
        declaration.mother.identifier.type
      )

      await expect(page.getByTestId('mother.passport-value')).toHaveText(
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await validateAddress(
        page,
        declaration.mother.address,
        'mother.address-value'
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('father.name-value')).toHaveText(
        declaration.father.name.firstNames +
          ' ' +
          declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      // @TODO: this should pass, but 'years' postfix is not yet implemented on V2
      // await expect(
      //   page.getByTestId(
      //   'father.age-value')).toHaveText(
      //   joinValuesWith([declaration.father.age, 'years'])
      // )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.getByTestId('father.nationality-value')).toHaveText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expect(page.getByTestId('father.idType-value')).toHaveText(
        declaration.father.identifier.type
      )

      await expect(page.getByTestId('father.passport-value')).toHaveText(
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(page.getByTestId('father.maritalStatus-value')).toHaveText(
        declaration.father.maritalStatus
      )

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(
        page.getByTestId('father.educationalAttainment-value')
      ).toHaveText(declaration.father.levelOfEducation)

      /*
       * Expected result: should include
       * - Father's address
       */
      await validateAddress(
        page,
        declaration.father.address,
        'father.address-value'
      )
    })

    test('2.1.6.1 Validate declare action not available before filling in signature and comment', async () => {
      await validateActionMenuButton(page, 'Declare', false)
    })

    test('2.1.7 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('2.1.8 Declare', async () => {
      await triggerDeclarationAction(page, 'Declare')

      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('2.2 Declaration Review by RO', async () => {
    test('2.2.1 Navigate to the declaration "Record" -tab', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByText('Pending validation').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await switchEventTab(page, 'Record')
    })
    test('2.2.2 Verify information on "Record" tab', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expectRowValue(
        page,
        'child.name',
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expectRowValue(page, 'child.gender', declaration.child.gender)

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expectRowValue(
        page,
        'child.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       */
      await expectRowValue(page, 'child.placeOfBirth', declaration.placeOfBirth)
      /*
       * Expected result: should include
       * - Child's Place of birth details
       */
      await expectRowValue(
        page,
        'child.birthLocation.other',
        `${declaration.birthLocation.country}${declaration.birthLocation.province}${declaration.birthLocation.district}${declaration.birthLocation.village}`
      )
      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expectRowValue(
        page,
        'child.attendantAtBirth',
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expectRowValue(page, 'child.birthType', declaration.birthType)

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expectRowValue(
        page,
        'informant.relation',
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expectRowValue(page, 'informant.email', declaration.informantEmail)

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expectRowValue(
        page,
        'mother.name',
        declaration.mother.name.firstNames
      )

      // @TODO: this should pass, but 'years' postfix is not yet implemented on V2
      /*
       * Expected result: should include
       * - Mother's age
       */
      // await expectRowValue(
      //   page,
      //   'mother.age',
      //   joinValuesWith([declaration.mother.age, 'years'])
      // )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expectRowValue(
        page,
        'mother.nationality',
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expectRowValue(
        page,
        'mother.maritalStatus',
        declaration.mother.maritalStatus
      )

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expectRowValue(
        page,
        'mother.educationalAttainment',
        declaration.mother.levelOfEducation
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       */
      await expectRowValue(
        page,
        'mother.idType',
        declaration.mother.identifier.type
      )

      /*
       * Expected result: should include
       * - Mother's Id Number
       */
      await expectRowValue(
        page,
        'mother.passport',
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await expectRowValue(
        page,
        'mother.address',
        declaration.mother.address.country
      )
      await expectRowValue(
        page,
        'mother.address',
        declaration.mother.address.district
      )
      await expectRowValue(
        page,
        'mother.address',
        declaration.mother.address.province
      )
      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expectRowValue(
        page,
        'father.name',
        declaration.father.name.firstNames +
          ' ' +
          declaration.father.name.familyName
      )

      // @TODO: this should pass, but 'years' postfix is not yet implemented on V2
      /*
       * Expected result: should include
       * - Father's date of birth
       */
      // await expectRowValue(
      //   page,
      //   'father.age',
      //   joinValuesWith([declaration.father.age, 'years'])
      // )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expectRowValue(
        page,
        'father.nationality',
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       */
      await expectRowValue(
        page,
        'father.idType',
        declaration.father.identifier.type
      )

      /*
       * Expected result: should include
       * - Father's Id Number
       */
      await expectRowValue(
        page,
        'father.passport',
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expectRowValue(
        page,
        'father.maritalStatus',
        declaration.father.maritalStatus
      )

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expectRowValue(
        page,
        'father.educationalAttainment',
        declaration.father.levelOfEducation
      )

      /*
       * Expected result: should include
       * - Father's address
       */
      await expectRowValue(
        page,
        'father.address',
        declaration.father.address.country
      )
      await expectRowValue(
        page,
        'father.address',
        declaration.father.address.district
      )
      await expectRowValue(
        page,
        'father.address',
        declaration.father.address.province
      )
    })
  })
})
