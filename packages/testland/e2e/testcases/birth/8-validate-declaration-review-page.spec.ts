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
  drawSignature,
  continueForm,
  getRandomDate,
  goToSection,
  formatName,
  login,
  formatDateObjectTo_dMMMMyyyy,
  expectRowValueWithChangeButton,
  expectRowValue,
  triggerDeclarationAction
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { fillDate, generateBirthInputs } from './helpers'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test.describe.serial('8. Validate declaration review page', () => {
  let page: Page

  const declaration = generateBirthInputs({
    includeOptionalFields: true,
    placeOfBirth: 'Other'
  })

  const comment = faker.lorem.sentence()

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('8.1 Community leader actions', async () => {
    test.describe('8.1.0 Fill up birth registration form', async () => {
      test('8.1.0.1 Fill child details', async () => {
        await page.locator('#firstname').fill(declaration.child.name.firstNames)
        await page.locator('#surname').fill(declaration.child.name.familyName)
        await page.locator('#child____gender').click()
        await page.getByText(declaration.child.gender, { exact: true }).click()

        await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.child.birthDate.yyyy)

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

        await page
          .locator('#child____weightAtBirth')
          .fill(declaration.weightAtBirth.toString())

        await continueForm(page)
      })

      test('8.1.0.2 Fill informant details', async () => {
        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informantType, {
            exact: true
          })
          .click()

        await page
          .locator('#informant____email')
          .fill(declaration.informantEmail)

        await continueForm(page)
      })

      test("8.1.0.3 Fill mother's details", async () => {
        await page
          .locator('#firstname')
          .fill(declaration.mother.name.firstNames)
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

        await continueForm(page)
      })

      test("8.1.0.4 Fill father's details", async () => {
        await page
          .locator('#firstname')
          .fill(declaration.father.name.firstNames)
        await page.locator('#surname').fill(declaration.father.name.familyName)

        await fillDate(page, declaration.father.birthDate)

        await page.locator('#father____nationality').click()
        await page
          .getByText(declaration.father.nationality, { exact: true })
          .click()

        await page.locator('#father____idType').click()
        await page
          .getByText(declaration.father.identifier.type, { exact: true })
          .click()

        await page
          .locator('#father____nid')
          .fill(declaration.father.identifier.id)

        await page.locator('#father____addressSameAs_YES').click()
        await continueForm(page)
      })
    })

    test.describe('8.1.1 Navigate to declaration review page', async () => {
      test('8.1.1.1 Verify information added on previous pages', async () => {
        await goToSection(page, 'review')

        /*
         * Expected result: should include
         * - Child's First Name
         * - Child's Family Name
         * - Change button
         */

        await expectRowValueWithChangeButton(
          page,
          'child.name',
          declaration.child.name.firstNames +
            ' ' +
            declaration.child.name.familyName
        )

        /*
         * Expected result: should include
         * - Child's Gender
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'child.gender',
          declaration.child.gender
        )

        /*
         * Expected result: should include
         * - Child's date of birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'child.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
        )

        /*
         * Expected result: should include
         * - Child's Place of birth type
         * - Child's Place of birth details
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'child.placeOfBirth',
          declaration.placeOfBirth
        )

        await expectRowValueWithChangeButton(
          page,
          'child.birthLocation.other',
          `${declaration.birthLocation.country}${declaration.birthLocation.province}${declaration.birthLocation.district}${declaration.birthLocation.village}`
        )

        /*
         * Expected result: should include
         * - Child's Attendant at birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'child.attendantAtBirth',
          declaration.attendantAtBirth
        )

        /*
         * Expected result: should include
         * - Child's Birth type
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'child.birthType',
          declaration.birthType
        )

        /*
         * Expected result: should include
         * - Child's Weight at birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'child.weightAtBirth',
          declaration.weightAtBirth.toString()
        )

        /*
         * Expected result: should include
         * - Informant's relation to child
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'informant.relation',
          declaration.informantType
        )
        /*
         * Expected result: should include
         * - Informant's Email
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'informant.email',
          declaration.informantEmail
        )

        /*
         * Expected result: should include
         * - Mother's First Name
         * - Mother's Family Name
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'mother.name',
          declaration.mother.name.firstNames +
            ' ' +
            declaration.mother.name.familyName
        )

        /*
         * Expected result: should include
         * - Mother's date of birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'mother.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
        )

        /*
         * Expected result: should include
         * - Mother's Nationality
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'mother.nationality',
          declaration.mother.nationality
        )
        /*
         * Expected result: should include
         * - Mother's Type of Id
         * - Mother's Id Number
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'mother.idType',
          declaration.mother.identifier.type
        )
        await expectRowValueWithChangeButton(
          page,
          'mother.nid',
          declaration.mother.identifier.id
        )

        /*
         * Expected result: should include
         * - Mother's address
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'mother.address',
          declaration.mother.address.country
        )
        await expectRowValueWithChangeButton(
          page,
          'mother.address',
          declaration.mother.address.district
        )
        await expectRowValueWithChangeButton(
          page,
          'mother.address',
          declaration.mother.address.province
        )

        /*
         * Expected result: should include
         * - Father's First Name
         * - Father's Family Name
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'father.name',
          declaration.father.name.firstNames +
            ' ' +
            declaration.father.name.familyName
        )

        /*
         * Expected result: should include
         * - Father's date of birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'father.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
        )

        /*
         * Expected result: should include
         * - Father's Nationality
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'father.nationality',
          declaration.father.nationality
        )
        /*
         * Expected result: should include
         * - Father's Type of Id
         * - Father's Id Number
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'father.idType',
          declaration.father.identifier.type
        )
        await expectRowValueWithChangeButton(
          page,
          'father.nid',
          declaration.father.identifier.id
        )

        /*
         * Expected result: should include
         * - Father's address
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'father.addressSameAs',
          'Yes'
        )
      })
    })

    test.describe('8.1.2 Click any "Change" link', async () => {
      test("8.1.2.1 Change child's name", async () => {
        await page.getByTestId('change-button-child.name').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.child.name = {
          firstNames: faker.person.firstName('male'),
          familyName: faker.person.lastName('male')
        }
        await page.locator('#firstname').fill(declaration.child.name.firstNames)
        await page.locator('#surname').fill(declaration.child.name.familyName)

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change child's name
         */
        await expect(page.getByTestId('child.name-value')).toContainText(
          declaration.child.name.firstNames +
            ' ' +
            declaration.child.name.familyName
        )
      })

      test("8.1.2.2 Change child's gender", async () => {
        await page.getByTestId('change-button-child.gender').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.child.gender = 'Female'

        await page.locator('#child____gender').click()
        await page.getByText(declaration.child.gender, { exact: true }).click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change child's gender
         */
        await expect(page.getByTestId('child.gender-value')).toContainText(
          declaration.child.gender
        )
      })

      test("8.1.2.3 Change child's birthday", async () => {
        await page.getByTestId('change-button-child.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.child.birthDate = getRandomDate(0, 200)
        await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.child.birthDate.yyyy)

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change child's birthday
         */
        await expect(page.getByTestId('child.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
        )
      })

      test('8.1.2.5 Change attendant at birth', async () => {
        await page.getByTestId('change-button-child.attendantAtBirth').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.attendantAtBirth = 'Midwife'
        await page.locator('#child____attendantAtBirth').click()
        await page
          .getByText(declaration.attendantAtBirth, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change attendant at birth
         */
        await expect(
          page.getByTestId('child.attendantAtBirth-value')
        ).toContainText(declaration.attendantAtBirth)
      })

      test('8.1.2.6 Change type of birth', async () => {
        await page.getByTestId('change-button-child.birthType').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.birthType = 'Twin'
        await page.locator('#child____birthType').click()
        await page
          .getByText(declaration.birthType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change type of birth
         */
        await expect(
          page.getByTestId('child.birthType-value')
        ).toContainText(declaration.birthType)
      })

      test("8.1.2.7 Change child's weight at birth", async () => {
        await page.getByTestId('change-button-child.weightAtBirth').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.weightAtBirth = 2.7
        await page
          .locator('#child____weightAtBirth')
          .fill(declaration.weightAtBirth.toString())
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change weight at birth
         */
        await expect(
          page.getByTestId('child.weightAtBirth-value')
        ).toContainText(declaration.weightAtBirth.toString())
      })

      test('8.1.2.8 Change informant type', async () => {
        await page.getByTestId('change-button-informant.relation').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.informantType = 'Father'
        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informantType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change informant type
         */
        await expect(
          page.getByTestId('informant.relation-value')
        ).toContainText(declaration.informantType)
      })

      test('8.1.2.9 Change registration email', async () => {
        await page.getByTestId('change-button-informant.email').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.informantEmail =
          declaration.father.name.firstNames.toLowerCase() +
          '.' +
          declaration.father.name.familyName.toLowerCase() +
          (Math.random() * 1000).toFixed(0) +
          '@opencrvs.dev'
        await page
          .locator('#informant____email')
          .fill(declaration.informantEmail)
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change registration email
         */
        await expect(
          page.getByTestId('informant.email-value')
        ).toContainText(declaration.informantEmail)
      })

      test("8.1.2.10 Change mother's name", async () => {
        await page.getByTestId('change-button-mother.name').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.name.firstNames = faker.person.firstName('female')
        declaration.mother.name.familyName = faker.person.lastName('female')
        await page
          .locator('#firstname')
          .fill(declaration.mother.name.firstNames)
        await page.locator('#surname').fill(declaration.mother.name.familyName)
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change mother's name
         */
        await expect(page.getByTestId('mother.name-value')).toContainText(
          declaration.mother.name.firstNames
        )
      })

      test("8.1.2.11 Change mother's birthday", async () => {
        await page.getByTestId('change-button-mother.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.birthDate = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.mother.birthDate.yyyy)

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change mother's birthday
         */
        await expect(page.getByTestId('mother.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
        )
      })

      test("8.1.2.12 Change mother's nationality", async () => {
        await page.getByTestId('change-button-mother.nationality').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.nationality = 'Holy See'
        await page.locator('#mother____nationality').click()
        await page
          .getByText(declaration.mother.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change mother's nationality
         */
        await expect(
          page.getByTestId('mother.nationality-value')
        ).toContainText(declaration.mother.nationality)
      })

      test("8.1.2.13 & 8.1.2.14 Change mother's ID type and id number", async () => {
        await page.getByTestId('change-button-mother.idType').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.identifier.type = 'Passport'
        await page.locator('#mother____idType').click()
        await page
          .getByText(declaration.mother.identifier.type, {
            exact: true
          })
          .click()

        declaration.mother.identifier.id = faker.string.numeric(10)
        await page
          .locator('#mother____passport')
          .fill(declaration.mother.identifier.id)
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change mother's ID type
         */
        await expect(page.getByTestId('mother.idType-value')).toContainText(
          declaration.mother.identifier.type
        )
        await expect(
          page.getByTestId('mother.passport-value')
        ).toContainText(declaration.mother.identifier.id)
      })

      test("8.1.2.15 Change mother's address", async () => {
        await page.getByTestId('change-button-mother.address').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.address.district = 'Afue'
        declaration.mother.address.village = 'Imani'
        await page.locator('#district').click()
        await page
          .getByText(declaration.mother.address.district, { exact: true })
          .click()
        await page.locator('#village').click()
        await page
          .getByText(declaration.mother.address.village, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change mother's address
         */
        await expect(
          page.getByTestId('mother.address-value')
        ).toContainText(declaration.mother.address.district)
        await expect(
          page.getByTestId('mother.address-value')
        ).toContainText(declaration.mother.address.province)
      })

      test("8.1.2.16 Change father's name", async () => {
        await page.getByTestId('change-button-father.name').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.name.firstNames = faker.person.firstName('male')
        declaration.father.name.familyName = faker.person.lastName('male')
        await page
          .locator('#firstname')
          .fill(declaration.father.name.firstNames)
        await page.locator('#surname').fill(declaration.father.name.familyName)
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change father's name
         */
        await expect(page.getByTestId('father.name-value')).toContainText(
          declaration.father.name.firstNames
        )
      })

      test("8.1.2.17 Change father's birthday", async () => {
        await page.getByTestId('change-button-father.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.birthDate = getRandomDate(21, 200)
        await fillDate(page, declaration.father.birthDate)

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change father's birthday
         */
        await expect(page.getByTestId('father.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
        )
      })

      test("8.1.2.18 Change father's nationality", async () => {
        await page.getByTestId('change-button-father.nationality').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.nationality = 'Holy See'
        await page.locator('#father____nationality').click()
        await page
          .getByText(declaration.father.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change father's nationality
         */
        await expect(
          page.getByTestId('father.nationality-value')
        ).toContainText(declaration.father.nationality)
      })

      test("8.1.2.19 Change father's ID type", async () => {
        await page.getByTestId('change-button-father.idType').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.identifier.type = 'Passport'
        await page.locator('#father____idType').click()
        await page
          .getByText(declaration.father.identifier.type, {
            exact: true
          })
          .click()

        declaration.father.identifier.id = faker.string.numeric(10)
        await page
          .locator('#father____passport')
          .fill(declaration.father.identifier.id)
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change father's ID type and ID number
         */
        await expect(page.getByTestId('father.idType-value')).toContainText(
          declaration.father.identifier.type
        )
        await expect(
          page.getByTestId('father.passport-value')
        ).toContainText(declaration.father.identifier.id)
      })
    })

    test.describe('8.1.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.1.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.1.5 Validate the declaration send button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.1.6 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(comment)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('8.1.7 Declare', async () => {
      await triggerDeclarationAction(page, 'Declare')
    })
  })

  test.describe('8.2 Registration Officer actions', async () => {
    test('8.2.1 Navigate to the declaration preview page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Pending validation').click()

      await openRecordByTitle(page, formatName(declaration.child.name))
    })
    test('8.2.2 Validate', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

      await triggerDeclarationAction(page, 'Validate')
    })

    test('8.2.3 Confirm the declaration is in Recent-workqueue', async () => {
      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('8.3 Registrar actions', async () => {
    test('8.3.1 Navigate to the declaration preview page', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await page.getByText('Pending registration').click()

      await openRecordByTitle(page, formatName(declaration.child.name))
    })

    test('8.3.1.1 Assert values', async () => {
      await page.getByRole('button', { name: 'Record', exact: true }).click()
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       * - Change button
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
       * - Change button
       */
      await expectRowValue(page, 'child.gender', declaration.child.gender)

      /*
       * Expected result: should include
       * - Child's date of birth
       * - Change button
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
       * - Change button
       */
      await expectRowValue(page, 'child.placeOfBirth', declaration.placeOfBirth)
      await expectRowValue(
        page,
        'child.birthLocation.other',
        `${declaration.birthLocation.country}${declaration.birthLocation.province}${declaration.birthLocation.district}${declaration.birthLocation.village}`
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       * - Change button
       */
      await expectRowValue(
        page,
        'child.attendantAtBirth',
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       * - Change button
       */
      await expectRowValue(page, 'child.birthType', declaration.birthType)

      /*
       * Expected result: should include
       * - Child's Weight at birth
       * - Change button
       */
      await expectRowValue(
        page,
        'child.weightAtBirth',
        declaration.weightAtBirth.toString()
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.relation',
        declaration.informantType
      )
      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValue(page, 'informant.email', declaration.informantEmail)

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       * - Change button
       */
      await expectRowValue(
        page,
        'mother.name',
        declaration.mother.name.firstNames
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       * - Change button
       */
      await expectRowValue(
        page,
        'mother.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       * - Change button
       */
      await expectRowValue(
        page,
        'mother.nationality',
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       * - Change button
       */
      await expectRowValue(
        page,
        'mother.idType',
        declaration.mother.identifier.type
      )
      await expectRowValue(
        page,
        'mother.passport',
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       * - Change button
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
       * - Change button
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
       * - Change button
       */
      await expectRowValue(
        page,
        'father.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       * - Change button
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
       * - Change button
       */
      await expectRowValue(
        page,
        'father.idType',
        declaration.father.identifier.type
      )
      await expectRowValue(
        page,
        'father.passport',
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's address
       * - Change button
       */
      await expectRowValue(page, 'father.addressSameAs', 'Yes')
    })

    test('8.3.1.2 Assign', async () => {
      await selectAction(page, 'Assign')
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
    })

    test('8.3.1.3 Register', async () => {
      await triggerDeclarationAction(page, 'Register')
    })

    test('8.3.8 Confirm the declaration is in "Pending certification" -workqueue', async () => {
      await page.getByText('Pending certification').click()
      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })
})
