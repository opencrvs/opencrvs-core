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
import { formatName, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  fillNotificationForm,
  generateBirthNotificationInputs,
  notifyFromReview,
  startBirthNotification
} from '@e2e/support/birth/notify'

test('Hospital official notifies birth', async ({ page }) => {
  const inputs = generateBirthNotificationInputs()

  await test.step('Login as Hospital official', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
  })

  await test.step('Initiate birth notification', async () => {
    await startBirthNotification(page)
  })

  await test.step('Fill notification form', async () => {
    await fillNotificationForm(page, inputs)
  })

  await test.step('Notify', async () => {
    await notifyFromReview(page)
  })

  await test.step('Open record', async () => {
    await page.getByText('Recent').click()

    await openRecordByTitle(page, formatName(inputs.child.name))
  })

  await test.step('Assert that record is notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })
})
