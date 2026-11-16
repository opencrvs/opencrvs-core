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
import { getToken, login, searchFromSearchBar } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

test('Revoke and reinstate record', async ({ browser }) => {
  const page = await browser.newPage()
  let declaration: Declaration
  let childName: string

  await test.step('Setup declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    declaration = (await createDeclaration(token)).declaration
    childName = formatV2ChildName(declaration)
  })

  await test.step('Login as Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  await test.step('Navigate to the declaration overview page', async () => {
    await searchFromSearchBar(page, childName)
  })

  await test.step('Revoke record', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Revoke registration')

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    await page.locator('#reason').fill('Revoking record for testing purposes.')

    const revokeResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await page.getByRole('button', { name: 'Confirm' }).click()
    await revokeResponse
  })

  await test.step('Assert "Revoked" -flag is present', async () => {
    await searchFromSearchBar(page, childName)
    await expect(page.getByText('Revoked')).toBeVisible()
  })

  await test.step('Reinstate record', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Reinstate registration')
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    await page
      .locator('#reason')
      .fill('Reinstating record for testing purposes.')

    const reinstateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await page.getByRole('button', { name: 'Confirm' }).click()
    await reinstateResponse
  })
})
