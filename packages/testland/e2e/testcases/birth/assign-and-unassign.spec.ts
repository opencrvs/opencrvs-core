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

import { login, getToken } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test('Assign & Unassign', async ({ page }) => {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const res = await createDeclaration(token)
  const declaration = res.declaration

  await test.step('Login', async () => {
    await login(page)
  })

  await test.step('Click on "Assign" from action menu', async () => {
    await page.getByText('Pending certification').click()

    const childName = `${declaration['child.name'].firstname} ${declaration['child.name'].surname}`
    await openRecordByTitle(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Click on "Unassign" from action menu', async () => {
    await selectAction(page, 'Unassign')
    // Wait for the unassign modal to appear
    await page.getByRole('button', { name: 'Unassign', exact: true }).click()
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Not assigned'
    )
  })
})
