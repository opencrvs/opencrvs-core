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
import { test, expect, Page } from '@playwright/test'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { getToken, login, switchEventTab } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser } from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

test.describe
  .serial('History rows when Registrar registers a birth from scratch', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page)
  })
  test('Assign', async () => {
    await page.getByText('Pending certification').click()

    await openRecordByTitle(page, formatV2ChildName(declaration))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
  })
  test('validate Actions in history', async () => {
    await switchEventTab(page, 'Audit')
    const rows = page.locator('#listTable-task-history [id^="row_"]')

    const expectedActions = [
      'Assigned',
      'Declared',
      'Registered',
      'Unassigned',
      'Viewed',
      'Assigned'
    ]

    await expect(rows).toHaveCount(expectedActions.length)

    for (let i = 0; i < expectedActions.length; i++) {
      const actionCell = rows.nth(i).locator('span').first()
      await expect(actionCell).toHaveText(expectedActions[i])

      await actionCell.getByRole('button').click()

      const modal = page.getByTestId('event-history-modal')

      await expect(modal.getByRole('heading')).toHaveText(expectedActions[i])
      await modal.locator('#close-dialog').click()
    }
  })
})
