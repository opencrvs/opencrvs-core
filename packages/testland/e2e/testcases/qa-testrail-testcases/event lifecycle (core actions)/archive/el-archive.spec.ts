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
import { test, expect, type Page } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS, GATEWAY_HOST } from '../../../../constants'
import { ensureAssignedToUser } from '../../utils'
import {
  createDeclaration as createBirthDeclaration,
  type Declaration as BirthDeclaration
} from '../../../../testcases/test-data/birth-declaration'
import {
  createDeclaration as createDeathDeclaration,
  type Declaration as DeathDeclaration
} from '../../../../testcases/test-data/death-declaration'
import { createDeclaration as createDuplicateBirthDeclaration } from '../../../../testcases/test-data/birth-declaration-with-mother-father'
import { formatV2ChildName } from '../../../../testcases/birth/helpers'
import {
  getToken,
  joinValuesWith,
  login,
  switchEventTab,
  triggerDeclarationAction
} from '../../../../helpers'
import {
  openRecordByTitle,
  searchFromSearchBar,
  createDuplicateDeathDeclaration
} from '../../helpers'

const formatV2DeceasedName = (declaration: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) =>
  joinValuesWith([
    declaration['deceased.name'].firstname,
    declaration['deceased.name'].surname
  ])

/**
 * Archives the currently open record, then re-finds it via search.
 *
 * An action (Archive included) navigates the user out of the record view
 * back to the workqueue/search-result it was opened from - the record's own
 * page is gone by the time the action's response resolves. So status/flags/
 * action-menu can only be asserted after a fresh navigation back into the
 * record (never on the page directly following the action), which also
 * avoids racing the auto-unassign that follows Archive (mirrors
 * archival/archive-and-unarchive.spec.ts).
 */
async function archiveAndAssertActions(
  page: Page,
  recordName: string,
  expectedOptions: string[]
) {
  await triggerDeclarationAction(page, 'Archive')

  await searchFromSearchBar(page, recordName)
  await expect(page.getByTestId('status-value')).toHaveText('Archived')

  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const options = await page
    .locator('#action-Dropdown-Content li')
    .allTextContents()
  expect(options).toStrictEqual(expectedOptions)
  await page.getByRole('button', { name: 'Action', exact: true }).click()
}

// TestRail TC-0067: Verify user can archive records from Notifications
// workqueue (NOTIFIED records)
//
// Known issue: When CL notifies a death record, the 'Attestation required' flag is added.
// Which shouldn't have. If fixed it'll pass.

test.skip('Verify Registration Officer can archive NOTIFIED records from Notifications', async ({
  page
}) => {
  test.setTimeout(180_000)

  let birthDeclaration: BirthDeclaration
  let deathDeclaration: DeathDeclaration

  await test.step('Community Leader notifies a birth and a death record via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    birthDeclaration = (
      await createBirthDeclaration(token, undefined, ActionType.NOTIFY)
    ).declaration
    deathDeclaration = (
      await createDeathDeclaration(token, undefined, ActionType.NOTIFY)
    ).declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Archive the notified birth record', async () => {
    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formatV2ChildName(birthDeclaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await archiveAndAssertActions(
      page,
      formatV2ChildName(birthDeclaration),
      ['Assign', 'Escalate', 'Unarchive']
    )
  })

  await test.step("'Archived' audit entry is recorded", async () => {
    // The Audit tab stays empty until the record is (re-)assigned to the
    // viewing user - archiveAndAssertActions leaves it unassigned.
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Archived', exact: true }).click()
    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText('Felix Katongo')).toBeVisible()
    await page.locator('#close-dialog').click()
    await page.getByTestId('exit-event').click()
  })

  await test.step('Archive the notified death record', async () => {
    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formatV2DeceasedName(deathDeclaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await archiveAndAssertActions(
      page,
      formatV2DeceasedName(deathDeclaration),
      ['Assign', 'Escalate', 'Unarchive']
    )
  })

  await test.step('Archived records no longer appear in Notifications', async () => {
    await page.getByTestId('exit-event').click()
    await page.getByText('Notifications').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(birthDeclaration) })
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', {
        name: formatV2DeceasedName(deathDeclaration)
      })
    ).not.toBeVisible()
  })
})

// TestRail TC-0068: Verify user can archive records from Pending
// registration workqueue (DECLARED-validated records)
test('Verify Registrar and Registrar General can archive DECLARED-validated records from Pending registration', async ({
  page
}) => {
  test.setTimeout(180_000)

  let birthDeclaration: BirthDeclaration
  let deathDeclaration: DeathDeclaration

  await test.step('Registrar declares a birth and a death record via API (auto-validated)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    birthDeclaration = (
      await createBirthDeclaration(token, undefined, ActionType.DECLARE)
    ).declaration
    deathDeclaration = (
      await createDeathDeclaration(token, undefined, ActionType.DECLARE)
    ).declaration
  })

  await test.step('Registrar archives the validated birth record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(birthDeclaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await archiveAndAssertActions(page, formatV2ChildName(birthDeclaration), [
      'Assign',
      'Escalate',
      'Unarchive'
    ])
  })

  await test.step('Registrar General archives the validated death record', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await searchFromSearchBar(page, formatV2DeceasedName(deathDeclaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)

    await archiveAndAssertActions(
      page,
      formatV2DeceasedName(deathDeclaration),
      ['Assign', 'Unarchive']
    )
  })
})

// TestRail TC-0069: Verify user can archive records from Pending updates
// workqueue (NOTIFIED/DECLARED-rejected records)
//
// Most probably has actual bug. Not finding escalate option for archived death records.
// Also, archival still removing rejected flag!

test('Verify Registration Officer and Registrar can archive rejected records from Pending updates', async ({
  page
}) => {
  test.setTimeout(180_000)

  let notifiedRejectedDeclaration: BirthDeclaration
  let notifiedRejectedEventId: string
  let declaredRejectedDeclaration: DeathDeclaration
  let declaredRejectedEventId: string

  await test.step('Seed a NOTIFIED-rejected birth record and a DECLARED-rejected death record via API', async () => {
    // Registration Officer doesn't hold record.notify (only Hospital
    // Official/Community Leader do) - notify as Community Leader, then use
    // the RO's own token for assign+reject (both in RO's scope).
    const notifierToken = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const roToken = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const registrarToken = await getToken(CREDENTIALS.REGISTRAR)

    const birthRes = await createBirthDeclaration(
      notifierToken,
      undefined,
      ActionType.NOTIFY
    )
    notifiedRejectedDeclaration = birthRes.declaration
    notifiedRejectedEventId = birthRes.eventId

    const birthClient = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${roToken}`
    )
    const roUserId = JSON.parse(
      Buffer.from(roToken.split('.')[1], 'base64').toString()
    ).sub
    await birthClient.event.actions.assignment.assign.mutate({
      eventId: notifiedRejectedEventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: roUserId
    })
    await birthClient.event.actions.reject.request.mutate({
      eventId: notifiedRejectedEventId,
      transactionId: uuidv4(),
      declaration: {},
      annotation: {},
      content: { reason: 'Missing informant email.' }
    })

    const deathRes = await createDeathDeclaration(
      registrarToken,
      undefined,
      ActionType.DECLARE
    )
    declaredRejectedDeclaration = deathRes.declaration
    declaredRejectedEventId = deathRes.eventId

    const deathClient = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${registrarToken}`
    )
    const registrarUserId = JSON.parse(
      Buffer.from(registrarToken.split('.')[1], 'base64').toString()
    ).sub
    await deathClient.event.actions.assignment.assign.mutate({
      eventId: declaredRejectedEventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: registrarUserId
    })
    await deathClient.event.actions.reject.request.mutate({
      eventId: declaredRejectedEventId,
      transactionId: uuidv4(),
      declaration: {},
      annotation: {},
      content: { reason: 'Spouse ID number is incorrect.' }
    })
  })

  await test.step('Registration Officer archives the NOTIFIED-rejected birth record', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByText('Pending updates').click()
    await openRecordByTitle(
      page,
      formatV2ChildName(notifiedRejectedDeclaration)
    )

    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await archiveAndAssertActions(
      page,
      formatV2ChildName(notifiedRejectedDeclaration),
      ['Assign', 'Escalate', 'Unarchive']
    )
  })

  await test.step('Registrar archives the DECLARED-rejected death record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending updates').click()
    await openRecordByTitle(
      page,
      formatV2DeceasedName(declaredRejectedDeclaration)
    )

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await archiveAndAssertActions(
      page,
      formatV2DeceasedName(declaredRejectedDeclaration),
      ['Assign', 'Unarchive']
    )
  })

  await test.step('Archived rejected records no longer appear in Pending updates', async () => {
    await page.getByTestId('exit-event').click()
    await page.getByText('Pending updates').click()
    await expect(
      page.getByRole('button', {
        name: formatV2DeceasedName(declaredRejectedDeclaration)
      })
    ).not.toBeVisible()
  })
})

// TestRail TC-0070: Verify user can archive records from Potential
// duplicate workqueue (DECLARED-potential duplicate records)
test('Verify Registrar and Registrar General can archive potential-duplicate records', async ({
  page
}) => {
  test.setTimeout(180_000)

  const birthDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0],
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }
  const birthName = formatV2ChildName(birthDetails)

  const deathDetails = {
    'deceased.name': {
      firstname: faker.person.firstName('male'),
      surname: faker.person.lastName('male')
    },
    'deceased.dob': '1950-04-21'
  }
  const deathName = formatV2DeceasedName(deathDetails)

  await test.step('Create duplicate birth records via API', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDuplicateBirthDeclaration(token, birthDetails)
    await createDuplicateBirthDeclaration(
      token,
      birthDetails,
      ActionType.DECLARE
    )
  })

  await test.step('Create duplicate death records via API', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDuplicateDeathDeclaration(token, deathDetails)
    await createDuplicateDeathDeclaration(
      token,
      deathDetails,
      ActionType.DECLARE
    )
  })

  await test.step('Registrar archives the potential-duplicate birth record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, birthName)

    await page.getByRole('button', { name: 'Assign record' }).click()
    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    await archiveAndAssertActions(page, birthName, [
      'Assign',
      'Escalate',
      'Unarchive'
    ])
    await expect(page.getByTestId('flags-value')).toContainText(
      'Potential duplicate'
    )
  })

  await test.step('Registrar General archives the potential-duplicate death record', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await searchFromSearchBar(page, deathName)

    await page.getByRole('button', { name: 'Assign record' }).click()
    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    await archiveAndAssertActions(page, deathName, [
      'Assign',
      'Unarchive'
    ])
    await expect(page.getByTestId('flags-value')).toContainText(
      'Potential duplicate'
    )
  })
})
