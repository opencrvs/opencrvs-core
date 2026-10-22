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
  goToSection,
  login,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test('Submit and verify incomplete birth declaration', async ({ page }) => {
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      }
    },

    placeOfBirth: 'Health Institution'
  }

  await test.step('Declaration started by HO', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await test.step('Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
    })

    await test.step('Go to review and send for review', async () => {
      await goToSection(page, 'review')
      await triggerDeclarationAction(page, 'Notify')
    })

    await test.step('Verify summary page', async () => {
      await page.getByText('Recent').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await expect(page.getByText('Notified', { exact: true })).toBeVisible()
      await expect(page.locator('#content-name')).toContainText(
        formatName(declaration.child.name)
      )
      await expect(page.getByTestId('status-value')).toContainText('Notified')
      await expect(page.getByTestId('event-value')).toContainText('Birth')
      // Secured fields this user may not see: the row stays, the value does not.
      await expect(page.getByTestId('child.dob-value')).toHaveAttribute(
        'data-testclass',
        'redacted'
      )
      await expect(page.getByTestId('registrationNumber-value')).toContainText(
        'No registration number'
      )
      await expect(page.getByTestId('informant.contact-value')).toHaveAttribute(
        'data-testclass',
        'redacted'
      )
      await expect(page.getByTestId('assignedTo-value')).toContainText(
        'Not assigned'
      )

      // Not on the summary at all for a notified record — no row, not a redacted one.
      await expect(page.getByTestId('child.birthLocation-value')).toBeHidden()
    })
  })
})
