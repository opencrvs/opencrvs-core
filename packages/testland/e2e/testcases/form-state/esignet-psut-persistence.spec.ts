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
import { Page, expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import decode from 'jwt-decode'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import {
  continueForm,
  drawSignature,
  getToken,
  goToSection,
  login,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { openBirthDeclaration } from '@e2e/support/birth/helpers'

const MOCK_NID = '1234567898'
const EXPECTED_SUB = `12345678901234567890123456${MOCK_NID}`

async function openBirthDeclarationAndCaptureEventId(page: Page) {
  const createEventResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('event.create') &&
      response.request().method() === 'POST'
  )

  await openBirthDeclaration(page)

  const createEventResponse = await createEventResponsePromise
  const responseText = await createEventResponse.text()
  const eventId = responseText.match(/[0-9a-fA-F-]{36}/)?.[0]

  if (!eventId) {
    throw new Error('Could not capture eventId from event.create response')
  }

  return eventId
}

async function authenticateFatherWithESignet(page: Page, nid: string) {
  await page.locator('#father____verify').click()

  await expect(page).toHaveURL(/authorize/)
  await page.locator('#id-input').fill(nid)
  await page.locator('#authenticate').click()
  await expect(page).not.toHaveURL(/authorize/)
}

async function fillChildDetails(page: Page) {
  await page.locator('#firstname').fill('E2E PSUT Child')
  // Randomized to avoid duplicate-detection false positives across reruns,
  // since the rest of the child's identity fields below are fixed.
  await page
    .locator('#surname')
    .fill(`Persistence-${faker.string.alphanumeric(8)}`)

  await page.locator('#child____gender').click()
  await page.getByText('Female', { exact: true }).click()

  await page.getByPlaceholder('dd').fill('10')
  await page.getByPlaceholder('mm').fill('10')
  await page.getByPlaceholder('yyyy').fill('2025')

  await page.locator('#child____placeOfBirth').click()
  await page
    .getByText('Other', {
      exact: true
    })
    .click()

  await page.locator('#child____attendantAtBirth').click()
  await page.getByText('Physician', { exact: true }).click()

  await page.locator('#child____birthType').click()
  await page.getByText('Single', { exact: true }).click()

  await page.locator('#child____weightAtBirth').fill('2.5')
}

test.describe('E-Signet PSUT persistence', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Declare birth with father E-Signet and confirm `sub` in backend payload', async () => {
    test.setTimeout(180_000)

    await login(page, CREDENTIALS.COMMUNITY_LEADER)

    const eventId = await openBirthDeclarationAndCaptureEventId(page)

    await fillChildDetails(page)
    await continueForm(page)

    await page.locator('#informant____relation').click()
    await page.getByText('Father', { exact: true }).click()
    await page.locator('#informant____email').fill('psut-father@example.com')
    await continueForm(page)

    await page.getByLabel("Mother's details are not available").check()
    await page.locator('#mother____reason').fill('Mother details not available')
    await continueForm(page)

    await authenticateFatherWithESignet(page, MOCK_NID)

    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 60_000
    })

    if (await page.locator('#father____addressSameAs_YES').isVisible()) {
      await page.locator('#father____addressSameAs_YES').check()
    }

    if (await page.locator('#father____maritalStatus').isVisible()) {
      await page.locator('#father____maritalStatus').click()
      await page.getByText('Single', { exact: true }).click()
    }

    if (await page.locator('#father____educationalAttainment').isVisible()) {
      await page.locator('#father____educationalAttainment').click()
      await page.getByText('No schooling', { exact: true }).click()
    }

    await goToSection(page, 'review')

    await page.locator('#review____comment').fill('PSUT persistence check')
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page.getByRole('button', { name: 'Apply' }).click()

    await triggerDeclarationAction(page, 'Declare')

    // Hospital Official's `record.read` scope is gated by `notifiedIn`, and
    // this record was declared directly without a prior NOTIFY action, so
    // read it back with a role whose `record.read` isn't notify-scoped.
    const registrationOfficerToken = await getToken(
      CREDENTIALS.REGISTRATION_OFFICER
    )
    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${registrationOfficerToken}`
    )

    // `father.verify-nid-http-fetch` is a `secured` field, only visible to an
    // assignee, so the reader must assign themselves before it appears.
    const { sub: registrationOfficerId } = decode<{ sub: string }>(
      registrationOfficerToken
    )
    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: registrationOfficerId
    })

    await expect
      .poll(
        async () => {
          const eventDocument = await client.event.get.query({
            eventId
          })
          const declareAction = eventDocument.actions.find(
            (action) =>
              action.type === 'DECLARE' && action.status === 'Requested'
          )

          return {
            sub:
              declareAction &&
              'declaration' in declareAction &&
              declareAction.declaration?.['father.verify-nid-http-fetch']?.data
                ?.sub
          }
        },
        { timeout: 60_000, intervals: [1_000, 2_000, 5_000] }
      )
      .toMatchObject({ sub: EXPECTED_SUB })
  })
})
