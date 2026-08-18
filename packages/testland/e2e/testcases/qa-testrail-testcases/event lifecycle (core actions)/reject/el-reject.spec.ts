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
import { faker } from '@faker-js/faker'
import { format, subDays } from 'date-fns'
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS } from '../../../../constants'
import { ensureAssignedToUser } from '../../utils'
import { selectAction } from '../../../../utils'
import {
  createDeclaration as createBirthDeclaration,
  getDeclaration as getBirthDeclaration,
  type Declaration as BirthDeclaration
} from '../../../../testcases/test-data/birth-declaration'
import {
  createDeclaration as createDeathDeclaration,
  type Declaration as DeathDeclaration
} from '../../../../testcases/test-data/death-declaration'
import { formatV2ChildName } from '../../../../testcases/birth/helpers'
import { getToken, joinValuesWith, login, switchEventTab } from '../../../../helpers'
import { openRecordByTitle, searchFromSearchBar } from '../../helpers'

const formatV2DeceasedName = (declaration: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) =>
  joinValuesWith([
    declaration['deceased.name'].firstname,
    declaration['deceased.name'].surname
  ])

async function rejectFromActionMenu(page: Page) {
  await selectAction(page, 'Reject')
  await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

  const rejectResponse = page.waitForResponse(
    (res) => res.url().includes('event.actions.reject') && res.ok()
  )
  await page.getByRole('button', { name: 'Send For Update' }).click()
  await rejectResponse
}

// TestRail TC-0064: Verify user can reject records from Notifications
// workqueue (NOTIFIED records)
// (1 of 2 e2e tests in this file covering this test case - Registration
// Officer, birth)
test('Verify Registration Officer can reject a NOTIFIED birth record from Notifications', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  await test.step('Community Leader notifies a birth record via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.NOTIFY
    )
    declaration = res.declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Assign the notified record from Notifications', async () => {
    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Reject the record', async () => {
    await rejectFromActionMenu(page)
  })

  // Rejecting (like every action) navigates the user out of the record view
  // back to the workqueue - re-find the record before asserting on it.
  await test.step('Record stays Notified, with the Rejected flag', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
  })

  await test.step('Action menu retains Edit/Escalate/Unassign', async () => {
    // The record was left unassigned by the reject action.
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    const options = await page
      .locator('#action-Dropdown-Content li')
      .allTextContents()
    // The spreadsheet lists 'Assign' alongside 'Unassign', which cannot both
    // be true for an already-assigned record - the record stays assigned to
    // the rejecting user, so only the assigned-state actions apply here.
    expect(options).toEqual(
      expect.arrayContaining(['Edit', 'Escalate', 'Unassign'])
    )
    expect(options).not.toContain('Assign')
    expect(options).not.toContain('Reject')
    await page.getByRole('button', { name: 'Action', exact: true }).click()
  })

  await test.step("'Rejected' audit entry records the reason", async () => {
    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Rejected', exact: true }).click()
    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText('Felix Katongo')).toBeVisible()
    await page.locator('#close-dialog').click()
  })
})

// TestRail TC-0064: Verify user can reject records from Notifications
// workqueue (NOTIFIED records)
// (2 of 2 e2e tests in this file covering this test case - Registrar, death)
test.skip('Verify Registrar can reject a NOTIFIED death record from Notifications', async ({  // Notified death records need to be attested before found in the Notifications workqueue at this point.
  page                                                                                   // The config issue that CL's death notifications adding 'Attestetion required' flag is being worked on, so this test will be updated once that is resolved.
}) => {
  test.setTimeout(180_000)

  let declaration: DeathDeclaration

  await test.step('Hospital Official notifies a death record via API', async () => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    const res = await createDeathDeclaration(
      token,
      undefined,
      ActionType.NOTIFY
    )
    declaration = res.declaration
  })

  await test.step('Login as Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Assign the notified record from Notifications', async () => {
    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formatV2DeceasedName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Reject the record', async () => {
    await rejectFromActionMenu(page)
  })

  await test.step('Record stays Notified, with the Rejected flag', async () => {
    await searchFromSearchBar(page, formatV2DeceasedName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
  })
})

// TestRail TC-0065: Verify user can reject records from Pending approval
// workqueue (DECLARED/DECLARED-validated records)
test('Verify Provincial Registrar can reject a late birth registration from Pending approval', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  const recentDate = subDays(new Date(), 2)
  const lateRegDateString = format(subDays(recentDate, 500), 'yyyy-MM-dd')

  await test.step('Community Leader declares a late birth registration via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const declarationRequest = await getBirthDeclaration({
      token,
      partialDeclaration: {
        'child.dob': lateRegDateString,
        'child.reason': 'Late registration'
      },
      placeOfBirthType: 'PRIVATE_HOME'
    })
    const res = await createBirthDeclaration(
      token,
      declarationRequest,
      ActionType.DECLARE,
      'PRIVATE_HOME'
    )
    declaration = res.declaration
  })

  await test.step('Registration Officer validates the declaration', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByText('Pending validation').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    const validateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )
    await selectAction(page, 'Validate')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await validateResponse
  })

  await test.step('Login as Provincial Registrar', async () => {
    await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
  })

  await test.step('Assign the record from Pending approval', async () => {
    await page.getByText('Pending approval').first().click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
  })

  await test.step('Reject the record instead of approving it', async () => {
    await rejectFromActionMenu(page)
  })

  await test.step("Record keeps the 'Approval required for late registration' flag and gains 'Rejected'", async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toContainText(
      'Approval required for late registration'
    )
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
  })

  await test.step("'Rejected' audit entry is recorded", async () => {
    await ensureAssignedToUser(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
    await switchEventTab(page, 'Audit')
    await expect(
      page.getByRole('button', { name: 'Rejected', exact: true })
    ).toBeVisible()
  })
})

// TestRail TC-0066: Verify user can reject records from Pending feedback
// workqueue (NOTIFIED/DECLARED/DECLARED-validated records)
// (1 of 2 e2e tests in this file covering this test case - Provincial
// Registrar)
test('Verify Provincial Registrar can reject a record escalated to them from Pending feedback', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  await test.step('Registrar declares a birth record via API (auto-validated)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Registrar escalates the record to the Provincial Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await selectAction(page, 'Escalate')
    await page.locator('#escalate-to').click()
    await page
      .getByText('My state provincial registrar', { exact: true })
      .first()
      .click()
    await page
      .locator('#reason')
      .fill('Escalating this case to Provincial Registrar for guidance.')

    const escalateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )
    await page.getByRole('button', { name: 'Confirm' }).click()
    await escalateResponse
  })

  await test.step('Login as Provincial Registrar', async () => {
    await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
  })

  await test.step('Assign the record from Pending feedback', async () => {
    await page.getByText('Pending feedback').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
  })

  await test.step('Reject the escalated record', async () => {
    await rejectFromActionMenu(page)
  })

  await test.step('Record keeps its Escalated flag and gains Rejected', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await expect(page.getByTestId('flags-value')).toContainText(
      'Escalated to Provincial Registrar'
    )
  })
})

// TestRail TC-0066: Verify user can reject records from Pending feedback
// workqueue (NOTIFIED/DECLARED/DECLARED-validated records)
// (2 of 2 e2e tests in this file covering this test case - Registrar
// General)
test('Verify Registrar General can reject a record escalated to them from Pending feedback', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  await test.step('Registrar declares a birth record via API (auto-validated)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Registrar escalates the record to the Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await selectAction(page, 'Escalate')
    await page.locator('#escalate-to').click()
    await page.getByText('Registrar General').click()
    await page
      .locator('#reason')
      .fill('Escalating this case to Registrar General for guidance.')

    const escalateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )
    await page.getByRole('button', { name: 'Confirm' }).click()
    await escalateResponse
  })

  await test.step('Login as Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  await test.step('Assign the record from Pending feedback', async () => {
    await page.getByText('Pending feedback').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  await test.step('Reject the escalated record', async () => {
    await rejectFromActionMenu(page)
  })

  await test.step('Record keeps its Escalated flag and gains Rejected', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await expect(page.getByTestId('flags-value')).toContainText(
      'Escalated to Registrar General'
    )
  })
})
