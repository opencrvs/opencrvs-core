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
import {
  getToken,
  login,
  searchFromSearchBar,
  switchEventTab
} from '@e2e/support/helpers'
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
import {
  assertRecordInWorkqueue,
  formatV2ChildName
} from '@e2e/support/birth/helpers'

const REVOKE_SUPPORTING_COPY =
  'The registration is withdrawn and any certificate issued from it stops being valid.'
const REINSTATE_SUPPORTING_COPY =
  'This will restore a previously revoked registration to active status.'
const REVOKE_REASON = 'Revoking record for testing purposes.'
const REINSTATE_REASON = 'Reinstating record for testing purposes.'

test('Revoke and reinstate record', async ({ browser }) => {
  const page = await browser.newPage()
  // Checks the workqueues of the record's office while the Registrar General stays logged in on `page`
  const officerPage = await browser.newPage()
  let declaration: Declaration
  let childName: string

  const expectInWorkqueues = async (
    pendingCertification: boolean,
    revoked: boolean
  ) => {
    await officerPage.getByRole('button', { name: 'Assigned to you' }).click()
    await assertRecordInWorkqueue({
      page: officerPage,
      name: childName,
      workqueues: [
        { title: 'Pending certification', exists: pendingCertification },
        { title: 'Revoked', exists: revoked }
      ]
    })
  }

  await test.step('Setup declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    declaration = (await createDeclaration(token)).declaration
    childName = formatV2ChildName(declaration)
  })

  await test.step('Registered record is pending certification', async () => {
    await login(officerPage, CREDENTIALS.REGISTRATION_OFFICER)
    await expectInWorkqueues(true, false)
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

    await expect(page.getByText(REVOKE_SUPPORTING_COPY)).toBeVisible()
    await expect(page.getByText(REINSTATE_SUPPORTING_COPY)).toHaveCount(0)

    await expect(page.getByRole('button', { name: 'Revoke' })).toBeDisabled()

    await page.locator('#reason').fill(REVOKE_REASON)

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

  await test.step('Revoked record is no longer pending certification', async () => {
    await expectInWorkqueues(false, true)
  })

  await test.step('Reinstate record', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Reinstate registration')

    await expect(page.getByText(REINSTATE_SUPPORTING_COPY)).toBeVisible()
    await expect(page.getByText(REVOKE_SUPPORTING_COPY)).toHaveCount(0)

    await expect(page.getByRole('button', { name: 'Reinstate' })).toBeDisabled()

    await page.locator('#reason').fill(REINSTATE_REASON)

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

  await test.step('Reinstated record is pending certification again, since revoke kept its flags', async () => {
    await expectInWorkqueues(true, false)
  })

  await test.step('Audit history shows the reasons of the revoke and reinstate actions', async () => {
    // The audit history needs the full record, which is downloaded on assignment
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await switchEventTab(page, 'Audit')

    await page
      .getByRole('button', { name: 'Registration revoked', exact: true })
      .click()
    await expect(page.getByText(REVOKE_REASON)).toBeVisible()
    await page.getByTestId('close-dialog').click()

    await page
      .getByRole('button', { name: 'Registration reinstated', exact: true })
      .click()
    await expect(page.getByText(REINSTATE_REASON)).toBeVisible()
    await page.getByTestId('close-dialog').click()
  })
})
