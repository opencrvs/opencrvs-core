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
import { expect, test, type Page } from '@playwright/test'

import {
  login,
  getToken,
  triggerDeclarationAction,
  formatName
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  Declaration,
  createDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  navigateToWorkqueue,
  selectAction
} from '@e2e/support/utils'
import {
  getRowByTitle,
  openRecordByTitle
} from '@e2e/support/print-certificate/birth/helpers'
import { faker } from '@faker-js/faker'
import { ActionType } from '@opencrvs/toolkit/events'

test.describe.serial('4(a) Validate "Pending updates"-workqueue for HO', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string
  let formattedChildName: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    // @TODO: Create throwaway role for user that can notify and declare
    const res = await createDeclaration(
      token,
      undefined,
      ActionType.NOTIFY,
      'HEALTH_FACILITY'
    )
    declaration = res.declaration
    eventId = res.eventId
    formattedChildName = formatV2ChildName(declaration)
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('4.0.1 Login', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  test('4.0.2 Navigate to record audit', async () => {
    await page.getByText('Notifications').click()

    await openRecordByTitle(page, formattedChildName)
  })

  test('4.0.3 Reject a declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Reject')

    await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

    const rejectResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.reject.request') && res.ok()
    )

    await page.getByRole('button', { name: 'Send For Update' }).click()
    await rejectResponse
  })

  test('4.1 Go to "Pending updates"-workqueue', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

    await page.getByText('Pending updates').click()
    await expect(
      page.getByRole('button', { name: formattedChildName })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending updates'
    )
  })

  test('4.2 validate the list', async () => {
    const header = page.getByTestId('workqueue-table-header')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Last updated',
      ''
    ])

    const row = getRowByTitle(page, formattedChildName)

    const cells = row.locator(':scope > div')

    await expect(cells.nth(0)).toHaveText(formattedChildName)
    await expect(cells.nth(1)).toHaveText('Birth')
    await expect(cells.nth(2)).toHaveText(
      declaration['child.dob'].split('T')[0]
    )
  })

  test('4.4 Click a name', async () => {
    await openRecordByTitle(page, formattedChildName)

    // User should navigate to record audit page
    await expectInUrl(
      page,
      `events/${eventId}?backTo=/workqueue/pending-updates`
    )
  })

  test('4.5 Acting directly from workqueue should redirect to the same workqueue', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.goBack()

    const row = getRowByTitle(page, formattedChildName)

    await row.getByRole('button', { name: 'Read' }).click()
    await selectAction(page, 'Edit')

    const newSurname = faker.person.lastName('female')

    await page.getByTestId('change-button-child.name').click()
    await page.getByTestId('text__surname').fill(newSurname)

    formattedChildName = formatName({
      firstNames: declaration['child.name'].firstname,
      familyName: newSurname
    })

    await page.getByRole('button', { name: 'Go to review' }).click()

    await triggerDeclarationAction(page, 'Notify with edits')

    // Should redirect back to "Pending updates"-workqueue
    await expect(page.locator('#content-name')).toHaveText('Pending updates')
  })

  test('4.6 Assert record does not have "Edit in progress" flag', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, formattedChildName)
    await expect(page.getByText('Edit in progress')).not.toBeVisible()
  })
})
