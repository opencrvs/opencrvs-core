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

import { login, getToken, validateActionMenuButton } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { ensureAssignedToUser, expectInUrl } from '@e2e/support/utils'
import {
  getRowByTitle,
  openRecordByTitle
} from '@e2e/support/print-certificate/birth/helpers'

test('5(b) Validate "Pending registration"-workqueue for Registrar', async ({
  page
}) => {
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const res = await createDeclaration(token, undefined, ActionType.DECLARE)
  const declaration = res.declaration
  const eventId = res.eventId

  await test.step('5.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('5.1 Go to "Pending registration"-workqueue', async () => {
    await page.getByText('Pending registration').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending registration'
    )
  })

  await test.step('5.2 validate the list', async () => {
    const header = page.getByTestId('workqueue-table-header')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Last updated',
      ''
    ])

    const row = getRowByTitle(page, formatV2ChildName(declaration))
    const cells = row.locator(':scope > div')

    await expect(cells.nth(0)).toHaveText(formatV2ChildName(declaration))
    await expect(cells.nth(1)).toHaveText('Birth')
    await expect(cells.nth(2)).toHaveText(
      declaration['child.dob'].split('T')[0]
    )
  })

  await test.step('5.4 Click a name', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expectInUrl(
      page,
      `events/${eventId}?backTo=/workqueue/pending-registration`
    )
  })

  await test.step('5.5 Register action should be available for declared and validated record', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await validateActionMenuButton(page, 'Register', true)
  })
})
