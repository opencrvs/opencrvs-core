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
import { expect, Page, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionStatus, ActionType } from '@opencrvs/toolkit/events'
import { getToken, login } from '@e2e/support/helpers'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import {
  mockNetworkConditions,
  restoreNetworkConditions
} from '@e2e/support/mock-network-conditions'
import { getDeclaration } from '@e2e/support/test-data/birth-declaration'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

/*
 * A draft created on another device must be fully browsable offline once the
 * drafts workqueue has synced it — without the user first opening the record's
 * event overview while online.
 */
test.describe.serial('Draft created on another device syncs in full', () => {
  let page: Page
  let childName: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Device A logs in and goes offline', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await expect(page.getByText('Farajaland CRS')).toBeVisible({
      timeout: 30000
    })
    await expect(page.locator('#content-name')).toHaveText('Assigned to you')
    await mockNetworkConditions(page, 'offline')
  })

  test('Device B creates a draft', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

    const event = await client.event.create.mutate({
      type: 'birth',
      transactionId: uuidv4()
    })

    const declaration = await getDeclaration({ token })
    childName = formatV2ChildName(declaration)

    await client.event.draft.create.mutate({
      eventId: event.id,
      transactionId: uuidv4(),
      type: ActionType.DECLARE,
      status: ActionStatus.Requested,
      declaration
    })
  })

  test('Device A comes back online and the draft syncs', async () => {
    await restoreNetworkConditions(page)

    await page.getByRole('button', { name: 'Drafts' }).click()
    await expect(page.locator('#content-name')).toHaveText('Drafts')

    /*
     * Reconnecting refetches the drafts list on mount, so the row lands in a
     * second or two; the headroom is for the 20s `refetchInterval` in Draft.tsx
     * being the fallback if that refetch is missed on loaded CI.
     */
    await expect(
      page.getByTestId('row-item').filter({ hasText: childName })
    ).toBeVisible({ timeout: 30000 })
  })

  test('Device A opens the synced draft offline', async () => {
    await mockNetworkConditions(page, 'offline')
    await openRecordByTitle(page, childName)

    // Not SuspenseLoadingFallback's "has not been downloaded yet" screen.
    await expect(page.locator('#suspense-offline-message')).toBeHidden()
  })

  test('The draft shows in full without having been opened online', async () => {
    await expect(page.getByTestId('informant.contact-value')).toHaveText(
      'mothers@email.com'
    )

    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('record-offline-message')).not.toBeVisible()
    await expect(page.getByTestId('child.name-value')).toHaveText(childName)
  })
})
