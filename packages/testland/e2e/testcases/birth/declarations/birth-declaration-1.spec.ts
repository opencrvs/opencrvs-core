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
  expectRowValue
, triggerDeclarationAction } from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { fillDate, validateAddress } from '../helpers'
import { ensureAssignedToUser } from '../../../utils'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('1. Birth declaration case - 1', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Physician',
    birthType: 'Single',
    weightAtBirth: 2.4,
    placeOfBirth: 'Health Institution',
    birthLocation: { facility: 'Klow Village Hospital' },
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
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
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling'
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling',
      address: {
        sameAsMother: true
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.1 Fill child details', async () => {
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
      await page
        .locator('#child____birthLocation')
        .fill(declaration.birthLocation.facility.slice(0, 3))
      await page.getByText(declaration.birthLocation.facility).click()

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

      await page
        .locator('#child____weightAtBirth')
        .fill(declaration.weightAtBirth.toString())

      await continueForm(page)
    })

    test('1.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test("1.1.3 Fill mother's details", async () => {
      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____nid')
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

    test("1.1.4 Fill father's details", async () => {
      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await fillDate(page, declaration.father.birthDate)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____nid')
        .fill(declaration.father.identifier.id)

      await page.locator('#father____nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.locator('#father____addressSameAs_YES').click()

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

    test('1.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('1.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toHaveText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toHaveText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('row-value-child.placeOfBirth')).toHaveText(
        declaration.placeOfBirth
      )
      await expect(
        page.getByTestId('row-value-child.birthLocation')
      ).toHaveText('Klow Village Hospital, Klow, Ibombo, Central, Farajaland')

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(
        page.getByTestId('row-value-child.attendantAtBirth')
      ).toHaveText(declaration.attendantAtBirth)

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.getByTestId('row-value-child.birthType')).toHaveText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Child's Weight at birth
       */
      await expect(
        page.getByTestId('row-value-child.weightAtBirth')
      ).toHaveText(declaration.weightAtBirth + 'Kilograms (kg)')

      /*
       * Expected result: should include
       * - Informant's relation to child
       */

      await expect(page.getByTestId('row-value-informant.relation')).toHaveText(
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toHaveText(
        declaration.informantEmail
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.name')).toHaveText(
        declaration.mother.name.firstNames +
          ' ' +
          declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.getByTestId('row-value-mother.nationality')).toHaveText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toHaveText(declaration.mother.maritalStatus)

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(
        page.getByTestId('row-value-mother.educationalAttainment')
      ).toHaveText(declaration.mother.levelOfEducation)

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.getByTestId('row-value-mother.idType')).toHaveText(
        declaration.mother.identifier.type
      )

      await expect(page.getByTestId('row-value-mother.nid')).toHaveText(
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await validateAddress(
        page,
        declaration.mother.address,
        'row-value-mother.address'
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toHaveText(
        declaration.father.name.firstNames +
          ' ' +
          declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.getByTestId('row-value-father.nationality')).toHaveText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expect(page.getByTestId('row-value-father.idType')).toHaveText(
        declaration.father.identifier.type
      )

      await expect(page.getByTestId('row-value-father.nid')).toHaveText(
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toHaveText(declaration.father.maritalStatus)

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(
        page.getByTestId('row-value-father.educationalAttainment')
      ).toHaveText(declaration.father.levelOfEducation)

      /*
       * Expected result: should include
       * - Father's address
       */
      await expect(
        page.getByTestId('row-value-father.addressSameAs')
      ).toHaveText('Yes')
    })
    test('1.1.7 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('1.1.8 Declare', async () => {
      await triggerDeclarationAction(page, 'Declare')

      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('1.2 Declaration Review by RO', async () => {
    test('1.2.1 Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByText('Pending validation').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

      await expect(page.getByTestId('assignedTo-value')).toHaveText(
        'Felix Katongo'
      )

      await switchEventTab(page, 'Audit')
      const assignmentAuditRow = page.locator('#row_4')
      await expect(assignmentAuditRow.getByText('Assigned')).toBeVisible()
      await expect(assignmentAuditRow.getByText('Felix Katongo')).toBeVisible()
      await expect(
        assignmentAuditRow.getByText(/Registration (Officer|Agent)/)
      ).toBeVisible()
    })

    test('1.2.2 Verify information on review page', async () => {
      await switchEventTab(page, 'Record')
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
       * - Child's Place of birth details
       */
      await expectRowValue(page, 'child.placeOfBirth', declaration.placeOfBirth)
      await expectRowValue(
        page,
        'child.birthLocation',
        'Klow Village Hospital, Klow, Ibombo, Central, Farajaland'
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
       * - Child's Weight at birth
       */
      await expectRowValue(
        page,
        'child.weightAtBirth',
        declaration.weightAtBirth.toString() + 'Kilograms (kg)'
      )

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

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expectRowValue(
        page,
        'mother.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

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
       * - Mother's Id Number
       */
      await expectRowValue(
        page,
        'mother.idType',
        declaration.mother.identifier.type
      )
      await expectRowValue(page, 'mother.nid', declaration.mother.identifier.id)

      /*
       * Expected result: should include
       * - Mother's address
       */
      await validateAddress(
        page,
        declaration.mother.address,
        'row-value-mother.address'
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

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expectRowValue(
        page,
        'father.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

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
       * - Father's Id Number
       */
      await expectRowValue(
        page,
        'father.idType',
        declaration.father.identifier.type
      )
      await expectRowValue(page, 'father.nid', declaration.father.identifier.id)

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
      await expectRowValue(page, 'father.addressSameAs', 'Yes')
    })
  })
})
