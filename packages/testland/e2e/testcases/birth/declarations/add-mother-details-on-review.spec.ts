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
import { test, expect } from '@playwright/test'
import {
  fillRegisterDialogRequiredFields,
  formatName,
  getRandomDate,
  getToken,
  login,
  switchEventTab,
  validateActionMenuButton
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { REQUIRED_VALIDATION_ERROR } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  createDeclaration,
  getDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { ActionType, AddressType } from '@opencrvs/toolkit/events'

test('Add mother details on review', async ({ page }) => {
  test.setTimeout(240_000)

  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName() + '-Peter',
        familyName: faker.person.lastName()
      }
    },
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      age: 25
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200)
    }
  }

  await test.step('Declaration by RO (via API): grandmother as informant, mother details not available', async () => {
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER_VILLAGE)
    const base = await getDeclaration({ token, informantRelation: 'BROTHER' })
    const village = base['mother.address'].administrativeArea
    const {
      'mother.name': _motherName,
      'mother.dob': _motherDob,
      'mother.nationality': _motherNationality,
      'mother.idType': _motherIdType,
      'mother.nid': _motherNid,
      'mother.address': _motherAddress,
      'father.reason': _fatherReason,
      ...rest
    } = base

    await createDeclaration(
      token,
      {
        ...rest,
        'child.name': {
          firstname: declaration.child.name.firstNames,
          surname: declaration.child.name.familyName
        },
        'informant.relation': 'GRANDMOTHER',
        'mother.detailsNotAvailable': true,
        'mother.reason': faker.lorem.sentence(),
        'father.detailsNotAvailable': false,
        'father.name': {
          firstname: declaration.father.name.firstNames,
          surname: declaration.father.name.familyName
        },
        'father.dob': `${declaration.father.birthDate.yyyy}-${declaration.father.birthDate.mm}-${declaration.father.birthDate.dd}`,
        'father.nationality': 'FAR',
        'father.idType': 'NONE',
        'father.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: village
        }
      },
      ActionType.DECLARE
    )
  })

  await test.step('Declaration Review by Registrar', async () => {
    await test.step('Navigate to the declaration Edit-action', async () => {
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

    await test.step('Actions should be disabled with no edits made', async () => {
      await validateActionMenuButton(page, 'Declare with edits', false)
      await validateActionMenuButton(page, 'Register with edits', false)
    })

    await test.step('Add mothers details', async () => {
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

    await test.step('Go back to review, expect to not see any validation errors', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
      await expect(page.getByText(REQUIRED_VALIDATION_ERROR)).not.toBeVisible()
    })

    await test.step('Actions should be enabled with edits made', async () => {
      await validateActionMenuButton(page, 'Declare with edits')
      await validateActionMenuButton(page, 'Register with edits')
    })

    const comment = 'Mamas info added yo'

    await test.step('Register with edits', async () => {
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

    await test.step('Assert event is registered', async () => {
      await page.getByText('Pending certification').click()
      await openRecordByTitle(page, formatName(declaration.child.name))
      await expect(page.getByTestId('status-value')).toHaveText('Registered')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
    })

    await test.step('Assert record form', async () => {
      await switchEventTab(page, 'Record')

      await expect(page.getByTestId('mother.name-value')).toHaveText(
        declaration.mother.name.firstNames +
          ' ' +
          declaration.mother.name.familyName
      )
      await expect(page.getByTestId('mother.age-value')).toHaveText(
        declaration.mother.age.toString()
      )
      await expect(page.getByTestId('mother.idType-value')).toHaveText('None')
    })

    await test.step('Assert audit trail', async () => {
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
