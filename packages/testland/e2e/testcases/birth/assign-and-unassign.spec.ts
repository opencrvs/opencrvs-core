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

import { login, getToken } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test.describe.serial('Assign & Unassign', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('Login', async () => {
    await login(page)
  })

  test('Click on "Assign" from action menu', async () => {
    await page.getByText('Pending certification').click()

    const childName = `${declaration['child.name'].firstname} ${declaration['child.name'].surname}`
    await openRecordByTitle(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  test('Click on "Unassign" from action menu', async () => {
    await selectAction(page, 'Unassign')
    // Wait for the unassign modal to appear
    await page.getByRole('button', { name: 'Unassign', exact: true }).click()
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Not assigned'
    )
  })
})
