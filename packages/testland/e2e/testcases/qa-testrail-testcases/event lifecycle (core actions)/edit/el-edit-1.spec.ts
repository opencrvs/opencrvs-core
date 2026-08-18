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
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS, GATEWAY_HOST } from '../../../../constants'
import { ensureAssignedToUser } from '../../utils'
import { selectAction } from '../../../../utils'
import {
  createDeclaration as createBirthDeclaration,
  type Declaration as BirthDeclaration
} from '../../../../testcases/test-data/birth-declaration'
import {
  createDeclaration as createDeathDeclaration,
  type Declaration as DeathDeclaration
} from '../../../../testcases/test-data/death-declaration'
import { formatV2ChildName } from '../../../../testcases/birth/helpers'
import {
  getToken,
  joinValuesWith,
  login,
  switchEventTab,
  triggerDeclarationAction
} from '../../../../helpers'
import { openRecordByTitle, searchFromSearchBar } from '../../helpers'
import { strict } from 'assert'

const formatV2DeceasedName = (declaration: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) =>
  joinValuesWith([
    declaration['deceased.name'].firstname,
    declaration['deceased.name'].surname
  ])

// TestRail TC-0059: Verify user can edit DECLARED birth records
// (1 of 2 e2e tests in this file covering this test case - Registration
// Officer, 'declare with edits')
test('Verify Registration Officer can edit a DECLARED birth record and declare with edits', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration
  const newEmail = faker.internet.email()

  await test.step('Community Leader declares a birth record via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step("Record is found in Pending validation and is assigned", async () => {
    await page.getByText('Pending validation').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Edit the informant email and go back to review', async () => {
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-informant.email').click()
    await page.locator('#informant____email').fill(newEmail)
    await page.getByRole('button', { name: 'Go to review' }).click()

    await expect(
      page.getByTestId('informant.email-value')
    ).toContainText(newEmail)
  })

  await test.step('Declare with edits', async () => {
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Record remains Declared, with Edited and Declared audit entries', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Edited', exact: true }).first().click()
    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText('Email', { exact: true })).toBeVisible()
    await expect(modal.getByText(newEmail)).toBeVisible()
    await page.locator('#close-dialog').click()

    await expect(
      page.getByRole('button', { name: 'Declared', exact: true }).first()
    ).toBeVisible()
  })
})

// TestRail TC-0059: Verify user can edit DECLARED birth records
// (2 of 2 e2e tests in this file covering this test case - Registrar,
// 'register with edits')
test('Verify Registrar can edit a DECLARED-validated birth record and register with edits', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration
  const newEmail = faker.internet.email()

  await test.step('Registrar declares a birth record via API (auto-validated)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Login as Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Record is found in Pending registration with the Validated flag', async () => {
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Edit the informant email and go back to review', async () => {
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-informant.email').click()
    await page.locator('#informant____email').fill(newEmail)
    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Register with edits', async () => {
    await triggerDeclarationAction(page, 'Register with edits')
  })

  await test.step('Record is Registered, with Edited and Registered audit entries', async () => {
    await page.getByText('Pending certification').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Registered')

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await switchEventTab(page, 'Audit')
    await expect(
      page.getByRole('button', { name: 'Edited', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Registered', exact: true })
    ).toBeVisible()
  })
})

// TestRail TC-0060: Verify user can edit NOTIFIED-rejected records
// (1 of 2 e2e tests in this file covering this test case - Community
// Leader, own birth record, 'notify with edits')
test("Verify Community Leader can edit and re-notify their own NOTIFIED-rejected birth record", async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration
  let eventId: string
  const rejectionReason = 'Please double check the informant email.'

  await test.step('Community Leader notifies a birth record and it is rejected via API', async () => {
    // Community Leader doesn't hold record.reject (only Registration
    // Officer/Registrar do, see roles.ts) - notify as Community Leader, then
    // use the RO's own token for assign+reject (both in RO's scope).
    // Reassigning to the Community Leader later happens via the UI
    // (ensureAssignedToUser below), so who performs the API-side assign+
    // reject doesn't affect the record being "theirs" for editing.
    const clToken = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const roToken = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const res = await createBirthDeclaration(
      clToken,
      undefined,
      ActionType.NOTIFY
    )
    declaration = res.declaration
    eventId = res.eventId

    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${roToken}`)
    const roUserId = JSON.parse(
      Buffer.from(roToken.split('.')[1], 'base64').toString()
    ).sub

    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: roUserId
    })

    await client.event.actions.reject.request.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration: {},
      annotation: {},
      content: { reason: rejectionReason }
    })
  })

  await test.step('Login as Community Leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Own rejected record carries the Rejected flag', async () => {
    // await page.getByText('Recent').click()
    // await openRecordByTitle(page, formatV2ChildName(declaration))

    await searchFromSearchBar(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Edit the informant email and go back to review', async () => {
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-informant.email').click()
    await page.locator('#informant____email').fill(faker.internet.email())
    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Notify with edits', async () => {
    await triggerDeclarationAction(page, 'Notify with edits')
  })

  await test.step('Record is re-Notified, Rejected flag cleared, with Edited and Notified audit entries', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    await expect(page.getByText('Rejected', { exact: true })).not.toBeVisible()

    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)
    await switchEventTab(page, 'Audit')
    await expect(
      page.getByRole('button', { name: 'Edited', exact: true }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Notified', exact: true }).first()
    ).toBeVisible()
  })
})

// TestRail TC-0060: Verify user can edit NOTIFIED-rejected records
// (2 of 2 e2e tests in this file covering this test case - Registration
// Officer, death record from Pending updates, 'declare with edits')
//
// Known issue: When CL notifies a death record, the 'Attestation required' flag is added.
// Which shouldn't have. If fixed it'll pass.

test.skip('Verify Registration Officer can edit a NOTIFIED-rejected death record from Pending updates and declare with edits', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: DeathDeclaration
  let eventId: string
  const rejectionReason = 'Spouse ID number looks incorrect.'

  await test.step('Hospital Official notifies a death record, then it is rejected via API', async () => {
    // Registration Officer doesn't hold record.notify (only Hospital
    // Official/Community Leader do) - notify as Hospital Official, then use
    // the RO's own token for assign+reject (both in RO's scope).
    const hoToken = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const roToken = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const res = await createDeathDeclaration(
      hoToken,
      undefined,
      ActionType.NOTIFY
    )
    declaration = res.declaration
    eventId = res.eventId

    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${roToken}`)
    const roUserId = JSON.parse(
      Buffer.from(roToken.split('.')[1], 'base64').toString()
    ).sub

    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: roUserId
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

  await test.step('Rejected record is found in Pending updates', async () => {
    await page.getByText('Pending updates').click()
    await openRecordByTitle(page, formatV2DeceasedName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Edit the informant email and go back to review', async () => {
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-informant.email').click()
    await page.locator('#informant____email').fill(faker.internet.email())
    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Declare with edits', async () => {
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Record is Declared, Rejected flag cleared, with Edited and Declared audit entries', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2DeceasedName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByText('Rejected', { exact: true })).not.toBeVisible()

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await switchEventTab(page, 'Audit')
    await expect(
      page.getByRole('button', { name: 'Edited', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Declared', exact: true })
    ).toBeVisible()
  })
})
