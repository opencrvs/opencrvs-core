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
  formatDateObjectTo_dMMMMyyyy,
  formatName,
  goToSection,
  login,
  logout,
  switchEventTab
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { REQUIRED_VALIDATION_ERROR } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { ensureAssignedToUser } from '@e2e/support/utils'
import {
  fillNotificationChildPage,
  fillNotificationMotherPage,
  generateBirthNotificationInputs,
  notifyFromReview,
  startBirthNotification
} from '@e2e/support/birth/notify'

/** Fields that are required on the birth notification form. */
const REQUIRED_NOTIFICATION_FIELDS = [
  'child.dob',
  'child.birthType',
  'child.attendantAtBirth',
  'child.gender',
  'child.placeOfBirth',
  'mother.name',
  'mother.dob',
  'informant.email'
]

test('Incomplete birth notification', async ({ page }) => {
  const inputs = generateBirthNotificationInputs()

  await test.step('1. Hospital official starts a notification with only the child name', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await startBirthNotification(page)

    await page.locator('#firstname').fill(inputs.child.name.firstNames)
    await page.locator('#surname').fill(inputs.child.name.familyName)

    await goToSection(page, 'review')
  })

  await test.step('2. Review page requires the missing notification fields', async () => {
    await expect(page.getByTestId('child.name-value')).toHaveText(
      formatName(inputs.child.name)
    )

    for (const fieldId of REQUIRED_NOTIFICATION_FIELDS) {
      await expect(page.getByTestId(`${fieldId}-value`)).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    }

    // Declaration-only fields are not part of the notification
    await expect(page.getByTestId('informant.relation-value')).toBeHidden()
    await expect(page.getByTestId('father.name-value')).toBeHidden()
  })

  await test.step('3. Notify is disabled while the notification is incomplete', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()

    // Disabled dropdown items are marked with tabindex="-1", `disabled` on an <li> has no ARIA semantics
    await expect(
      page
        .locator('#action-Dropdown-Content li')
        .filter({ hasText: /^Notify$/ })
    ).toHaveAttribute('tabindex', '-1')

    await page.keyboard.press('Escape')
  })

  await test.step('4. Complete the notification and notify', async () => {
    // Opens the child page of the notification form
    await page.getByTestId('change-button-child.dob').click()

    await fillNotificationChildPage(page, inputs)
    await fillNotificationMotherPage(page, inputs)
    await goToSection(page, 'review')

    for (const fieldId of REQUIRED_NOTIFICATION_FIELDS) {
      await expect(page.getByTestId(`${fieldId}-value`)).not.toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    }

    await notifyFromReview(page)

    await page.getByText('Recent').click()
    await expect(
      page.getByRole('button', { name: formatName(inputs.child.name) })
    ).toBeVisible()
  })

  await test.step('5. Registration officer sees the notified values and the missing declaration fields', async () => {
    await logout(page)
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formatName(inputs.child.name))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await switchEventTab(page, 'Record')

    await expect(page.getByTestId('child.name-value')).toHaveText(
      formatName(inputs.child.name)
    )
    await expect(page.getByTestId('child.dob-value')).toHaveText(
      formatDateObjectTo_dMMMMyyyy(inputs.child.birthDate)
    )
    await expect(page.getByTestId('child.birthType-value')).toHaveText(
      inputs.birthType
    )
    await expect(page.getByTestId('child.attendantAtBirth-value')).toHaveText(
      inputs.attendantAtBirth
    )
    await expect(page.getByTestId('child.weightAtBirth-value')).toContainText(
      inputs.weightAtBirth.toString()
    )
    await expect(page.getByTestId('mother.name-value')).toHaveText(
      formatName(inputs.mother.name)
    )
    await expect(page.getByTestId('mother.idType-value')).toHaveText(
      inputs.mother.identifier.type
    )
    await expect(page.getByTestId('mother.nid-value')).toHaveText(
      inputs.mother.identifier.id
    )
    await expect(page.getByTestId('informant.email-value')).toHaveText(
      inputs.informantEmail
    )

    // Left for the declaration
    await expect(page.getByTestId('informant.relation-value')).toContainText(
      REQUIRED_VALIDATION_ERROR
    )
  })
})
