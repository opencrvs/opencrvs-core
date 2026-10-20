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
  formatName,
  getRandomDate,
  getToken,
  login,
  triggerDeclarationAction,
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
import { ActionType } from '@opencrvs/toolkit/events'

test('Change informant on review', async ({ page }) => {
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName() + '-Peter',
        familyName: faker.person.lastName()
      }
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      identifier: {
        type: 'None'
      }
    }
  }

  await test.step('Declaration by RO (via API): mother as informant, father details not available', async () => {
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER_VILLAGE)
    await createDeclaration(
      token,
      await getDeclaration({
        token,
        informantRelation: 'MOTHER',
        partialDeclaration: {
          'child.name': {
            firstname: declaration.child.name.firstNames,
            surname: declaration.child.name.familyName
          }
        }
      }),
      ActionType.DECLARE
    )
  })

  await test.step('Declaration Review by Registrar', async () => {
    await test.step('Navigate to the declaration Edit-action', async () => {
      await login(page, CREDENTIALS.REGISTRAR_VILLAGE)

      await page.getByRole('button', { name: 'Pending registration' }).click()

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

    await test.step('Change informant to father', async () => {
      await page.getByTestId('change-button-informant.relation').click()

      await page.locator('#informant____relation').click()
      await page.getByText('Father', { exact: true }).click()
      await page.locator('#informant____email').fill(faker.internet.email())
    })

    await test.step('Go back to review, expect to see validation errors for father information', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()

      await expect(page.getByTestId('father.name-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
      await expect(page.getByTestId('father.dob-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
      await expect(page.getByTestId('father.idType-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      await validateActionMenuButton(page, 'Register with edits', false)
      await validateActionMenuButton(page, 'Declare with edits', false)
    })

    await test.step('Fill in father details', async () => {
      await page.getByTestId('change-button-father.name').click()

      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.father.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.father.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.father.birthDate.yyyy)

      await page.getByTestId('select__father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()
    })

    await test.step('Go back to review, expect to not see any validation errors', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
      await expect(page.getByText(REQUIRED_VALIDATION_ERROR)).not.toBeVisible()
      await validateActionMenuButton(page, 'Register with edits')
      await validateActionMenuButton(page, 'Declare with edits')
    })

    await test.step('Register with edits', async () => {
      await triggerDeclarationAction(page, 'Register with edits')
    })

    await test.step('Assert event is registered', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()

      await openRecordByTitle(page, formatName(declaration.child.name))
      await expect(page.getByTestId('status-value')).toHaveText('Registered')
    })

    await test.step('Assert record form', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
      await switchEventTab(page, 'Record')
      await expect(page.getByTestId('father.name-value')).toHaveText(
        declaration.father.name.firstNames +
          ' ' +
          declaration.father.name.familyName
      )
    })

    await test.step('Assert audit trail', async () => {
      await switchEventTab(page, 'Summary')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
      await switchEventTab(page, 'Audit')
      await page.getByRole('button', { name: 'Edited', exact: true }).click()

      await page.locator('#close-dialog').click()

      await page
        .getByRole('button', { name: 'Registered', exact: true })
        .click()
    })
  })
})
