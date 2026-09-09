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
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import {
  getToken,
  login,
  logout,
  triggerDeclarationAction,
  searchFromSearchBar
} from '@e2e/support/helpers'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import {
  assertRecordInWorkqueue,
  formatV2ChildName
} from '@e2e/support/birth/helpers'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '@e2e/support/utils'
import { ActionType } from '@opencrvs/toolkit/events'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test('Basic Archival flow', async ({ page }) => {
  let declaration: Declaration

  await test.step('Create declartion via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createDeclaration(
      token,
      undefined,
      ActionType.DECLARE,
      'PRIVATE_HOME'
    )
    declaration = res.declaration
  })

  await test.step('Login as HO', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Archival is not available for CL', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Assign', exact: true })
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Archive', exact: true })
    ).not.toBeVisible()
  })

  await test.step('Logout', async () => {
    await logout(page)
  })

  await test.step('Login as RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Navigate to the event overview page', async () => {
    await page.getByText('Pending validation').click()

    // Expect not to see a quick action for Archival
    await expect(
      page.getByRole('button', { name: 'Archive', exact: true })
    ).not.toBeVisible()

    await openRecordByTitle(page, formatV2ChildName(declaration))
  })

  await test.step('Archive the declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await triggerDeclarationAction(page, 'Archive')
  })

  await test.step('Archived declaration is not visible in workqueues', async () => {
    await page.getByRole('button', { name: 'Pending validation' }).click()
    await expect(
      page.getByRole('button', {
        name: formatV2ChildName(declaration)
      })
    ).not.toBeVisible()
  })

  await test.step('Archived declaration can be found via search', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Archived')
  })

  await test.step('Assert available actions', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    const options = await page
      .locator('#action-Dropdown-Content li')
      .allTextContents()
    expect(options).toStrictEqual(['Assign', 'Escalate', 'Unarchive'])
  })
})

test('Archival of declaration pending validation', async ({ page }) => {
  test.setTimeout(180_000)
  let declaration: Declaration

  await test.step('Initialise a declared birth record via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
  })

  await test.step('Login as RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Navigate to the event overview page', async () => {
    await page.getByText('Pending validation').click()

    await openRecordByTitle(page, formatV2ChildName(declaration))
  })

  await test.step('Validate the declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await triggerDeclarationAction(page, 'Validate')
  })

  await test.step('Confirm the declaration is in "Pending registration" -workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
  })

  await test.step('Archive the declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await triggerDeclarationAction(page, 'Archive')
  })

  await test.step('Archived declaration is not visible in workqueues', async () => {
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })

  await test.step('Archived declaration can be found via search', async () => {
    await page.locator('#searchText').fill(formatV2ChildName(declaration))
    await page.locator('#searchIconButton').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })
})

test('Archival of rejected declaration', async ({ page }) => {
  let declaration: Declaration
  let eventId: string

  const rejectionReason = 'Mother NID is missing. Please update and resubmit.'

  await test.step('Initialise a rejected birth record via API', async () => {
    const registrarToken = await getToken(CREDENTIALS.REGISTRAR)

    const declareRes = await createDeclaration(
      registrarToken,
      undefined,
      ActionType.DECLARE
    )
    declaration = declareRes.declaration
    eventId = declareRes.eventId

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

  await test.step('Login as Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Rejected record appears in the Pending updates workqueue', async () => {
    await assertRecordInWorkqueue({
      page,
      name: formatV2ChildName(declaration),
      workqueues: [{ title: 'Pending updates', exists: true }]
    })
  })

  await test.step('Archive the rejected declaration', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(page.getByTestId('flags-value')).toContainText('Rejected')

    await triggerDeclarationAction(page, 'Archive')
  })

  await test.step('Archived rejected record no longer appears in the Pending updates workqueue', async () => {
    await assertRecordInWorkqueue({
      page,
      name: formatV2ChildName(declaration),
      workqueues: [{ title: 'Pending updates', exists: false }]
    })
  })

  await test.step('Archived rejected record cannot be edited', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Archived')
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    const options = await page
      .locator('#action-Dropdown-Content li')
      .allTextContents()
    expect(options).toStrictEqual(['Assign', 'Escalate', 'Unarchive'])
  })
})

test('Archival and unarchival of a notified declaration', async ({ page }) => {
  let declaration: Declaration

  await test.step('Initialise a notified birth record via API', async () => {
    const hospitalOfficialToken = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)

    const notifyRes = await createDeclaration(
      hospitalOfficialToken,
      undefined,
      ActionType.NOTIFY
    )
    declaration = notifyRes.declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Notified record appears in the Notifications work queue', async () => {
    await navigateToWorkqueue(page, 'Notifications')
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
  })

  await test.step('Archive the notified declaration', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await expect(page.getByTestId('status-value')).toHaveText('Notified')

    await triggerDeclarationAction(page, 'Archive')
  })

  await test.step('Archived declaration shows Archived status', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Archived')
  })

  await test.step('Archived record no longer appears in the Notifications work queue', async () => {
    await page.getByTestId('exit-event').click()
    await navigateToWorkqueue(page, 'Notifications')
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeHidden()
  })

  await test.step('Unarchive the declaration', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await selectAction(page, 'Unarchive')

    const unarchiveResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.unarchive') && res.ok()
    )
    await page.getByRole('button', { name: 'Unarchive', exact: true }).click()
    await unarchiveResponse
  })

  await test.step('Unarchived declaration reverts to Notified status', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await test.step('Unarchived record reappears in the Notifications workqueue', async () => {
    await page.getByTestId('exit-event').click()
    await navigateToWorkqueue(page, 'Notifications')
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
  })
})
