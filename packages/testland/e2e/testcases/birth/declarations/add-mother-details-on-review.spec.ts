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
  fillRegisterDialogRequiredFields,
  formatName,
  getRandomDate,
  goToSection,
  login,
  logout,
  switchEventTab,
  validateActionMenuButton,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureAssignedToUser, selectAction } from '../../../utils'
import { REQUIRED_VALIDATION_ERROR } from '../helpers'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('Add mother details on review', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName() + '-Peter',
        familyName: faker.person.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Other paramedical personnel',
    birthType: 'Quadruplet',
    placeOfBirth: 'Other',
    birthLocation: {
      country: 'Farajaland',
      province: 'Central',
      district: 'Ibombo',
      town: faker.location.city(),
      residentialArea: faker.location.county(),
      street: faker.location.street(),
      number: faker.location.buildingNumber(),
      postcodeOrZip: faker.location.zipCode()
    },
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      age: 25,
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      address: {
        country: 'Guam',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      },
      maritalStatus: 'Divorced',
      levelOfEducation: 'Tertiary'
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      maritalStatus: 'Divorced',
      levelOfEducation: 'Tertiary',
      address: {
        sameAsMother: false,
        country: 'Grenada',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
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

  test.describe('Declaration started by RO', async () => {
    test('Login as RO', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER_VILLAGE)
    })

    test('Initiate birth declaration', async () => {
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details', async () => {
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

      // Province and district are disabled because the user jurisdiction is limited to user's administrative area
      await expect(
        page.locator('#child____birthLocation____other-form-input #province')
      ).toBeDisabled()

      await expect(
        page.locator('#child____birthLocation____other-form-input #district')
      ).toBeDisabled()

      await page.locator('#town').fill(declaration.birthLocation.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.birthLocation.residentialArea)
      await page.locator('#street').fill(declaration.birthLocation.street)
      await page.locator('#number').fill(declaration.birthLocation.number)
      await page
        .locator('#zipCode')
        .fill(declaration.birthLocation.postcodeOrZip)

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

    test('Select Grandmother as informant', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Grandmother', { exact: true }).click()
      await page.getByText('Exact date of birth unknown').click()
      await page
        .locator('#informant____age')
        .fill(faker.number.int({ min: 18, max: 100 }).toString())

      await page.locator('#firstname').fill(faker.person.firstName())
      await page.locator('#surname').fill(faker.person.lastName())

      await page.locator('#informant____idType').click()
      await page.getByText('None', { exact: true }).click()
      await page.locator('#informant____email').fill(faker.internet.email())
      await continueForm(page)
    })

    test('Mark mothers details as not available', async () => {
      await page.getByLabel("Mother's details are not available").check()
      await page.locator('#mother____reason').fill(faker.lorem.sentence())

      await continueForm(page)
    })

    test('Fill fathers details', async () => {
      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.father.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.father.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.father.birthDate.yyyy)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()
    })

    test('Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('Fill up signature and comment', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('Declare', async () => {
      await triggerDeclarationAction(page, 'Declare')

      await page.getByText('Recent').click()

      await openRecordByTitle(page, formatName(declaration.child.name))
    })
  })

  test.describe('Declaration Review by Registrar', async () => {
    test('Navigate to the declaration Edit-action', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRAR_VILLAGE)

      await page.getByText('Pending registration').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await expect(page.getByTestId('status-value')).toHaveText('Declared')

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
      await selectAction(page, 'Edit')
      await expect(
        page.getByText(
          /You are editing a record declared by Velix Katongo \(Registration Officer at Klow Village Hospital\)/
        )
      ).toBeVisible()
    })

    test('Actions should be disabled with no edits made', async () => {
      await validateActionMenuButton(page, 'Declare with edits', false)
      await validateActionMenuButton(page, 'Register with edits', false)
    })

    test('Add mothers details', async () => {
      await page.getByTestId('change-button-mother.detailsNotAvailable').click()
      await page.getByText("Mother's details are not available").click()

      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#mother____age')
        .fill(declaration.mother.age.toString())

      await page.locator('#mother____idType').click()
      await page.getByText('None', { exact: true }).click()
    })

    test('Go back to review, expect to not see any validation errors', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
      await expect(page.getByText(REQUIRED_VALIDATION_ERROR)).not.toBeVisible()
    })

    test('Actions should be enabled with edits made', async () => {
      await validateActionMenuButton(page, 'Declare with edits')
      await validateActionMenuButton(page, 'Register with edits')
    })

    const comment = 'Mamas info added yo'

    test('Register with edits', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await page.getByText('Register with edits', { exact: true }).click()

      const responses = [
        'event.actions.edit',
        'event.actions.declare',
        'event.actions.register'
      ].map((url) =>
        page.waitForResponse((res) => res.url().includes(url) && res.ok())
      )

      await page.locator('#comments').fill(comment)
      await fillRegisterDialogRequiredFields(page)

      await page.getByRole('button', { name: 'Confirm' }).click()

      await Promise.all(responses)
    })

    test('Assert event is registered', async () => {
      await page.getByText('Pending certification').click()
      await openRecordByTitle(page, formatName(declaration.child.name))
      await expect(page.getByTestId('status-value')).toHaveText('Registered')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
    })

    test('Assert record form', async () => {
      await switchEventTab(page, 'Record')

      await expect(page.getByTestId('mother.name-value')).toHaveText(
        declaration.mother.name.firstNames +
          ' ' +
          declaration.mother.name.familyName
      )
      await expect(page.getByTestId('mother.age-value')).toHaveText(
        declaration.mother.age.toString()
      )
      await expect(page.getByTestId('mother.idType-value')).toHaveText(
        'None'
      )
    })

    test('Assert audit trail', async () => {
      await switchEventTab(page, 'Summary')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
      await switchEventTab(page, 'Audit')
      await page.getByRole('button', { name: 'Edited', exact: true }).click()

      await expect(
        page.getByText(
          "Mother's name" + '-' + formatName(declaration.mother.name)
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Age of mother (at the time of event)' +
            '-' +
            declaration.mother.age.toString()
        )
      ).toBeVisible()

      await expect(
        page.getByText('Nationality' + '-' + 'Farajaland')
      ).toBeVisible()

      await expect(page.getByText('Type of ID' + '-' + 'None')).toBeVisible()

      await page.locator('#close-dialog').click()

      await page
        .getByRole('button', { name: 'Registered', exact: true })
        .click()

      await expect(page.getByText(comment)).toBeVisible()

      await page.locator('#close-dialog').click()
    })
  })
})
