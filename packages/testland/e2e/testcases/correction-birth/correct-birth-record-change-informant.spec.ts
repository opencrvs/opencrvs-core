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
import { expect, Locator, test, type Page } from '@playwright/test'
import {
  auditRecord,
  formatDateTo_dMMMMyyyy,
  getToken,
  login
} from '../../helpers'
import { faker } from '@faker-js/faker'
import {
  createDeclaration as createDeclarationV2,
  Declaration as DeclarationV2
} from '../test-data/birth-declaration-with-mother-father'
import { format, subDays, subYears } from 'date-fns'
import { CREDENTIALS } from '../../constants'
import { IdType } from '@countryconfig/events/utils'
import { random } from 'lodash'
import { formatV2ChildName, REQUIRED_VALIDATION_ERROR } from '../birth/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  waitForCorrectionAction
} from '../../utils'

test.describe.serial('Correct record - change informant type', () => {
  let declaration: DeclarationV2
  let trackingId = ''

  let eventId: string
  let page: Page

  const updatedFatherDetails = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male'),
    birthDate: format(subYears(new Date(), 30), 'yyyy-MM-dd'),
    age: random(20, 45),
    email: faker.internet.email(),
    nationality: 'Ethiopia',
    id: '9241628813',
    idType: IdType.PASSPORT,
    passport: '1911901024',
    address: {
      country: 'Farajaland',
      province: 'Sulaka',
      district: 'Irundu',
      village: 'Xhosa',
      town: faker.location.city(),
      residentialArea: faker.location.county(),
      street: faker.location.street(),
      number: faker.location.buildingNumber(),
      zipCode: faker.location.zipCode()
    },
    maritalStatus: 'Widowed',
    educationLevel: 'Primary'
  }

  const correctionFee = faker.number.int({ min: 1, max: 1000 }).toString()

  const visible = async (
    _page: Page | Locator = page,
    col1: string,
    col2?: string,
    col3?: string
  ) => {
    await expect(_page.getByText(col1, { exact: true })).toBeVisible()
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- conditional assertion
    col2 && (await expect(_page.getByText(col2, { exact: true })).toBeVisible())
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- conditional assertion
    col3 && (await expect(_page.getByText(col3, { exact: true })).toBeVisible())
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Shortcut declaration', async () => {
    let token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclarationV2(
      token,
      {
        'child.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName()
        },
        'child.gender': 'male',
        'child.dob': format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.attendantAtBirth': 'PHYSICIAN',
        'child.birthType': 'SINGLE',
        'child.weightAtBirth': 3,
        'informant.relation': 'MOTHER',
        'informant.phoneNo': '0911725897',
        'mother.name': {
          firstname: faker.person.firstName('female'),
          surname: faker.person.lastName('female')
        },
        'mother.dob': format(subYears(new Date(), 29), 'yyyy-MM-dd'),
        'mother.nationality': 'FAR',
        'mother.idType': 'NATIONAL_ID',
        'mother.nid': faker.string.numeric(10),
        'mother.maritalStatus': 'SINGLE',
        'mother.educationalAttainment': 'NO_SCHOOLING',
        'mother.occupation': 'Housewife',
        'mother.previousBirths': 0
      },
      'REGISTER',
      'PRIVATE_HOME'
    )

    trackingId = res.trackingId!
    eventId = res.eventId
    token = await getToken(CREDENTIALS.REGISTRAR)
    declaration = res.declaration
  })

  test('Ready to correct record > record audit', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await selectAction(page, 'Correct')
  })

  test('Correction requester: legal guardian', async () => {
    await page.locator('#requester____type').click()
    await page.getByText('Legal Guardian', { exact: true }).click()
    await page.locator('#reason____option').click()
    await page
      .getByText('Informant provided incorrect information (Material error)', {
        exact: true
      })
      .click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Verify identity', async () => {
    await page.getByRole('button', { name: 'Verified' }).click()
  })

  test('Upload supporting documents', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Correction fee', async () => {
    await page.locator('#fees____amount').fill(correctionFee)
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test.describe('Make correction', async () => {
    test('Change informant type', async () => {
      await page.getByTestId('change-button-informant.relation').click()
      await page.getByTestId('select__informant____relation').click()
      await page.getByText('Father', { exact: true }).click()

      await page
        .getByTestId('text__informant____email')
        .fill(updatedFatherDetails.email)
    })

    test('Continue to father page', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill in father details', async () => {
      await expect(
        page.getByText("Same as mother's usual place of residence?")
      ).toBeVisible()

      await page.locator('#firstname').fill(updatedFatherDetails.firstNames)
      await page.locator('#surname').fill(updatedFatherDetails.familyName)

      const birthDay = updatedFatherDetails.birthDate.split('-')

      await page.getByTestId('father____dob-dd').fill(birthDay[2])
      await page.getByTestId('father____dob-mm').fill(birthDay[1])
      await page.getByTestId('father____dob-yyyy').fill(birthDay[0])

      await page.locator('#father____nationality').click()
      await page.getByText(updatedFatherDetails.nationality).click()

      await page.locator('#father____idType').click()
      await page.getByText(updatedFatherDetails.idType).click()

      await page
        .locator('#father____passport')
        .fill(updatedFatherDetails.passport)

      await page
        .locator('#father____addressSameAs-form-input')
        .getByLabel('No')
        .click()

      await page
        .locator('#father____address-form-input')
        .locator('#province')
        .click()
      await page
        .locator('#father____address-form-input')
        .getByText(updatedFatherDetails.address.province)
        .click()

      await page
        .locator('#father____address-form-input')
        .locator('#district')
        .click()
      await page
        .locator('#father____address-form-input')
        .getByText(updatedFatherDetails.address.district)
        .click()

      await page
        .locator('#father____address-form-input')
        .locator('#village')
        .click()
      await page
        .locator('#father____address-form-input')
        .getByText(updatedFatherDetails.address.village)
        .click()

      await page
        .locator('#father____address-form-input')
        .locator('#town')
        .fill(updatedFatherDetails.address.town)

      await page
        .locator('#father____address-form-input')
        .locator('#residentialArea')
        .fill(updatedFatherDetails.address.residentialArea)

      await page
        .locator('#father____address-form-input')
        .locator('#street')
        .fill(updatedFatherDetails.address.street)

      await page
        .locator('#father____address-form-input')
        .locator('#number')
        .fill(updatedFatherDetails.address.number)

      await page
        .locator('#father____address-form-input')
        .locator('#zipCode')
        .fill(updatedFatherDetails.address.zipCode)
    })
  })

  test('Go back to review, expect to not see any validation errors', async () => {
    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByText(REQUIRED_VALIDATION_ERROR)).not.toBeVisible()
  })

  test('Correction summary', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByRole('button', { name: 'Correct record' })
    ).toBeEnabled()

    await visible(page, 'Requester', 'Legal Guardian')
    await visible(
      page,
      'Reason for correction',
      'Informant provided incorrect information (Material error)'
    )
    await visible(page, 'Fee total', `$${correctionFee}`)

    await visible(page, 'Correction(s)')

    await expect(
      page.getByText(
        `Father's name-${updatedFatherDetails.firstNames} ${updatedFatherDetails.familyName}`
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        `Date of birth-${formatDateTo_dMMMMyyyy(updatedFatherDetails.birthDate)}`
      )
    ).toBeVisible()

    await expect(
      page.getByText(`Nationality-${updatedFatherDetails.nationality}`)
    ).toBeVisible()

    await expect(page.getByText(`Type of ID-Passport`)).toBeVisible()

    await expect(
      page.getByText(`ID Number-${updatedFatherDetails.passport}`)
    ).toBeVisible()

    await expect(page.getByText(`Usual place of residence`)).toBeVisible()

    await Promise.all(
      [
        updatedFatherDetails.address.province,
        updatedFatherDetails.address.district,
        updatedFatherDetails.address.town,
        updatedFatherDetails.address.residentialArea,
        updatedFatherDetails.address.street,
        updatedFatherDetails.address.number,
        updatedFatherDetails.address.zipCode
      ].map((x) =>
        expect(
          page
            .locator('#listTable-corrections-table-father')
            .locator('#row_5')
            .getByText(x)
        ).toBeVisible()
      )
    )

    await page.getByRole('button', { name: 'Correct record' }).click()

    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })

    await expectInUrl(page, `/events/${eventId}`)

    await page.getByTestId('exit-event').click()
  })

  test('Validate history in record audit', async () => {
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Audit' }).click()

    await expect(
      page
        .locator('#listTable-task-history')
        .getByRole('button', { name: 'Record corrected' })
    ).toBeVisible()
  })
})
