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

import { login, getToken, triggerDeclarationAction } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { faker } from '@faker-js/faker'

test('Validating a rejected declaration clears the Rejected flag', async ({
  browser
}) => {
  test.setTimeout(180_000) // two logins plus reject/validate round-trips can exceed the default 90s under CI load
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const { declaration } = await createDeclaration(
    token,
    undefined,
    ActionType.DECLARE
  )
  const childName = formatV2ChildName(declaration)
  const page = await browser.newPage()

  await test.step('Registrar rejects the declaration (Send For Update)', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, childName)

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR, { timeout: 15_000 })
    await selectAction(page, 'Reject')
    await page.getByTestId('reject-reason').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Send For Update' }).click()
  })

  await test.step('Registration Officer finds it in "Pending updates"', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await page.getByText('Pending updates').click()
    await expect(page.getByRole('button', { name: childName })).toBeVisible()
  })

  await test.step('Open the record and perform the Validate action', async () => {
    await openRecordByTitle(page, childName)
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await triggerDeclarationAction(page, 'Validate')
  })

  await test.step('Record no longer appears in "Pending updates"', async () => {
    await navigateToWorkqueue(page, 'Pending updates')
    await expect(
      page.getByRole('button', { name: childName })
    ).not.toBeVisible()
  })

  await test.step('Only the "Validated" flag remains (Rejected flag cleared)', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, childName)

    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
  })
})
