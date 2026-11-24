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
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { getToken, login } from '@e2e/support/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  type
} from '@e2e/support/utils'
import {
  createDeclaration,
  type Declaration
} from '@e2e/support/test-data/birth-declaration'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test('Escalating a rejected record preserves the Rejected flag', async ({
  page
}) => {
  let declaration: Declaration
  let eventId: string
  let trackingId: string

  const rejectionReason = 'Mother NID is missing. Please update and resubmit.'
  const escalationReason =
    'Escalating this rejected record to provincial registrar for guidance.'

  await test.step('Initialise a rejected birth record via API', async () => {
    const registrarToken = await getToken(CREDENTIALS.REGISTRAR)

    const declareRes = await createDeclaration(
      registrarToken,
      undefined,
      ActionType.DECLARE
    )
    declaration = declareRes.declaration
    eventId = declareRes.eventId
    trackingId = declareRes.trackingId!

    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${registrarToken}`
    )

    const registrarUserId = JSON.parse(
      Buffer.from(registrarToken.split('.')[1], 'base64').toString()
    ).sub

    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: registrarUserId
    })

    await client.event.actions.reject.request.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration: {},
      annotation: {},
      content: { reason: rejectionReason }
    })
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Find the rejected record by tracking ID', async () => {
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expectInUrl(page, `events/${eventId}`)

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Record carries the Rejected flag', async () => {
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
  })

  await test.step('Escalate the record to the provincial registrar', async () => {
    await selectAction(page, 'Escalate')

    const confirmButton = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmButton).toBeDisabled()

    await page.locator('#escalate-to').click()
    await page
      .getByText('My state provincial registrar', { exact: true })
      .first()
      .click()

    await page.locator('#reason').fill(escalationReason)

    const escalateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    await escalateResponse
  })

  await test.step('Rejected flag is still present after escalation', async () => {
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await expect(page.getByTestId('flags-value')).toContainText(
      'Escalated to Provincial Registrar'
    )
  })
})
