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
import path from 'path'
import { test, expect } from '@playwright/test'
import {
  getToken,
  login,
  searchFromSearchBar,
  switchEventTab
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import {
  createDeclaration,
  type Declaration
} from '@e2e/support/test-data/birth-declaration-with-mother-father'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  waitForCorrectionAction
} from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { ASSETS_DIR } from '@e2e/support/paths'
import { createClient } from '@opencrvs/toolkit/api'
import { aggregateActionDeclarations } from '@opencrvs/toolkit/events'

// The mock e-signet server auto-authenticates this NID.
const MOCK_NID = '1234567898'

async function getEventById(eventId: string, token: string) {
  const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)
  return client.event.get.query({ eventId })
}

test('Correcting a birth with a verified parent ID creates the child UIN (#13734)', async ({
  page
}) => {
  let token: string
  let declaration: Declaration
  let eventId: string
  let recordUrl = ''
  let childNid = ''

  await test.step('Register a birth with an unverified father via API (no child UIN)', async () => {
    token = await getToken(CREDENTIALS.REGISTRAR)

    // Father present but not identity-verified, so MOSIP does not create a
    // child UIN at registration time. `addressSameAs: 'YES'` reuses the mother's
    // address so the father's address fields are not required.
    const res = await createDeclaration(token, {
      'father.detailsNotAvailable': false,
      'father.addressSameAs': 'YES'
    })

    declaration = res.declaration
    eventId = res.eventId
  })

  await test.step('Login as Local Registrar and open the registered record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Pending certification' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    recordUrl = page.url()

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Start a correction and complete the onboarding steps', async () => {
    await selectAction(page, 'Correct')

    await page.locator('#requester____type').click()
    await page.getByText('Informant (Mother)', { exact: true }).click()

    await page.locator('#reason____option').click()
    await page
      .getByText('Myself or an agent made a mistake (Clerical error)', {
        exact: true
      })
      .click()

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()

    const inputFile = page.locator(
      'input[name="documents____supportingDocs"][type="file"]'
    )
    await page.getByTestId('select__documents____supportingDocs').click()
    await page.getByText('Affidavit', { exact: true }).click()
    await inputFile.setInputFiles(path.join(ASSETS_DIR, 'image.png'))
    await page.getByRole('button', { name: 'Continue' }).click()

    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())
    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(page, `/events/request-correction/${eventId}/review`)
  })

  await test.step("Verify the father's ID via e-signet", async () => {
    // Open the father page from the correction review and authenticate the ID.
    await page.getByTestId('change-button-father.name').click()
    await page.getByRole('button', { name: 'Revoke' }).click()
    await page.getByTestId('confirm').click()

    await page.locator('#father____verify').click()
    await expect(page).toHaveURL(/authorize/)
    await page.locator('#id-input').fill('1234567900')
    await page.locator('#authenticate').click()
    await expect(page).not.toHaveURL(/authorize/)

    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step("Verify the mother's ID via e-signet", async () => {
    // Open the mother page from the correction review and authenticate the ID.
    await page.getByTestId('change-button-mother.name').click()
    await page.getByRole('button', { name: 'Revoke' }).click()
    await page.getByTestId('confirm').click()

    await page.locator('#mother____verify').click()
    await expect(page).toHaveURL(/authorize/)
    await page.locator('#id-input').fill('1234567898')
    await page.locator('#authenticate').click()
    await expect(page).not.toHaveURL(/authorize/)

    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Submit the direct correction', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(page, `/events/request-correction/${eventId}/summary`)

    await page.getByRole('button', { name: 'Correct' }).click()
    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })
  })

  await test.step('MOSIP confirms the correction and creates the child UIN', async () => {
    await expect
      .poll(
        async () => {
          const event = await getEventById(eventId, token)
          const nid = aggregateActionDeclarations(event)['child.nid']
          return typeof nid === 'string' && /^\d{10}$/.test(nid)
        },
        { timeout: 60_000, intervals: [1000, 2000, 5000] }
      )
      .toBe(true)

    const event = await getEventById(eventId, token)
    childNid = aggregateActionDeclarations(event)['child.nid'] as string
  })

  await test.step('Record audit shows "Waiting for external validation" and the child UIN', async () => {
    await page.getByRole('button', { name: 'Assign record' }).click()

    // Verify the child UIN is visible in the record summary
    await expect(page.getByTestId('child.nid-value')).toContainText(childNid)

    // Verify the "Waiting for external validation" action is visible in the audit tab
    await switchEventTab(page, 'Audit')
    await expect(
      page.getByRole('button', {
        name: 'Waiting for external validation',
        exact: true
      })
    ).toBeVisible()
  })
})
