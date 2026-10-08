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
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  type
} from '@e2e/support/utils'
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

    await expect(page.getByRole('button', { name: 'Revoke' })).toBeDisabled()

    await page.locator('#reason').fill('Revoking record for testing purposes.')

    const revokeResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.revocation.revoke') &&
        response.ok()
    )

    await page.getByRole('button', { name: 'Revoke' }).click()
    await revokeResponse
  })

  await test.step('Assert the record has the "Revoked" status', async () => {
    await searchFromSearchBar(page, childName)
    await expect(page.locator('#summary').getByText('Revoked')).toBeVisible()
  })

  await test.step('Find the record in advanced search by the "Revoked" status', async () => {
    // The search bar is in the workqueue header, not on the record page
    await page.goto(CLIENT_URL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()

    await page.getByText('Registration details').click()
    await page.locator('#event____status').click()
    await page.getByText('Revoked', { exact: true }).click()

    await page.getByText('Child details').click()
    await type(page, '#firstname', declaration['child.name'].firstname)
    await type(page, '#surname', declaration['child.name'].surname)

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)
    await expectInUrl(page, 'event.status=REVOKED')
    await page.getByRole('button', { name: childName }).click()
  })

  await test.step('Reinstate record', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Reinstate registration')
    await expect(page.getByRole('button', { name: 'Reinstate' })).toBeDisabled()

    await page
      .locator('#reason')
      .fill('Reinstating record for testing purposes.')

    const reinstateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.revocation.reinstate') &&
        response.ok()
    )

    await page.getByRole('button', { name: 'Reinstate' }).click()
    await reinstateResponse
  })

  await test.step('Assert the record has the "Registered" status again', async () => {
    await searchFromSearchBar(page, childName)
    await expect(page.locator('#summary').getByText('Registered')).toBeVisible()
  })
})
