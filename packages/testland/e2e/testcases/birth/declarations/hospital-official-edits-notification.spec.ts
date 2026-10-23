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
import {
  getToken,
  login,
  switchEventTab,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  createDeclaration,
  Declaration,
  getNotificationDeclaration
} from '@e2e/support/test-data/birth-declaration'

/**
 * A notifier edits their own notification and notifies it again. The edit is
 * checked against the birth notification form, like the notification itself.
 */
test('Hospital Official edits their own birth notification and notifies it again', async ({
  page
}) => {
  const editedWeight = '3.6'
  let childName = ''

  await test.step('Hospital Official notifies a birth (via API)', async () => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    const { declaration } = await createDeclaration(
      token,
      await getNotificationDeclaration({
        token,
        partialDeclaration: { 'child.weightAtBirth': 3.2 }
      }),
      ActionType.NOTIFY
    )
    childName = formatV2ChildName(declaration as Declaration)
  })

  await test.step('Open the notification for editing', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.getByRole('button', { name: 'Recent' }).click()
    await openRecordByTitle(page, childName)

    await ensureAssignedToUser(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await selectAction(page, 'Edit')
  })

  await test.step('Only the notification form is shown', async () => {
    await expect(page.getByTestId('child.weightAtBirth-value')).toBeVisible()
    // Declaration-only fields are not part of the notification
    await expect(page.getByTestId('informant.relation-value')).toBeHidden()
    await expect(page.getByTestId('father.name-value')).toBeHidden()
  })

  await test.step('Change the weight at birth', async () => {
    await page.getByTestId('change-button-child.weightAtBirth').click()
    await page.locator('#child____weightAtBirth').fill(editedWeight)
    await page.getByRole('button', { name: 'Go to review' }).click()

    await expect(page.getByTestId('child.weightAtBirth-value')).toContainText(
      editedWeight
    )
  })

  await test.step('Notify with edits', async () => {
    await triggerDeclarationAction(page, 'Notify with edits')
  })

  await test.step('The record is still notified, with the edited weight', async () => {
    await page.getByRole('button', { name: 'Recent' }).click()
    await openRecordByTitle(page, childName)

    await expect(page.getByTestId('status-value')).toHaveText('Notified')

    await ensureAssignedToUser(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await switchEventTab(page, 'Record')
    await expect(page.getByTestId('child.weightAtBirth-value')).toContainText(
      editedWeight
    )
  })
})
