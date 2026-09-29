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

import { expect, test } from '@playwright/test'
import { getToken, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { createDeclaration } from '@e2e/support/test-data/death-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { faker } from '@faker-js/faker'

test('Rejecting a death declaration clears the Validated flag', async ({
  browser
}) => {
  // Declaring as an RO adds the "Validated" flag to the death record.
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const { declaration } = await createDeclaration(
    token,
    undefined,
    ActionType.DECLARE
  )
  const deceasedName = `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`

  const page = await browser.newPage()

  await test.step('The declared record carries the Validated flag', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, deceasedName)

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toContainText('Validated')
  })

  await test.step('Registrar rejects the declaration (Send For Update)', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR, { timeout: 15_000 })
    await selectAction(page, 'Reject')
    await page.getByTestId('reject-reason').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Send For Update' }).click()
  })

  await test.step('Rejected record shows Rejected but no longer Validated', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await page.getByText('Pending updates').click()
    await openRecordByTitle(page, deceasedName)

    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await expect(page.getByTestId('flags-value')).not.toContainText('Validated')
  })

  await test.step('Validate action is available to the RO again', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    // With the Validated flag cleared, the RO is offered the Validate action.
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await expect(
      page.locator('#action-Dropdown-Content').getByText('Validate', {
        exact: true
      })
    ).toBeVisible()
  })
})
