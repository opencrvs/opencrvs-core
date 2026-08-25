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
import { getToken, login, searchFromSearchBar } from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

test('Hospital Official can only see and edit records notified from their own office', async ({
  browser
}) => {
  let eventId: string
  let childName: string
  const page = await browser.newPage()

  await test.step('Hospital Official A notifies a birth record at Klow Village Hospital', async () => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    const res = await createDeclaration(
      token,
      undefined,
      ActionType.NOTIFY,
      'HEALTH_FACILITY'
    )
    eventId = res.eventId
    childName = formatV2ChildName(res.declaration as Declaration)
  })

  await test.step('Hospital Official A can see the record in their workqueue', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.getByRole('button', { name: 'Recent' }).click()
    await expect(page.getByRole('button', { name: childName })).toBeVisible()
  })

  await test.step('Hospital Official A can access the record via direct URL', async () => {
    await page.goto(`${CLIENT_URL}/events/${eventId}`)
    await expect(page.locator('#content-name')).toHaveText(childName, {
      timeout: 30_000
    })
  })

  await test.step('Hospital Official A has an Edit action available on the record', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await expect(
      page
        .locator('#action-Dropdown-Content')
        .getByText('Edit', { exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Action', exact: true }).click()
  })

  await test.step('Hospital Official B (different office) cannot find the record in their workqueue', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL_OTHER)
    await page.getByRole('button', { name: 'Recent' }).click()
    await expect(
      page.getByRole('button', { name: childName })
    ).not.toBeVisible()
  })

  await test.step('Hospital Official B cannot find the record via search', async () => {
    await searchFromSearchBar(page, childName, false)
  })

  await test.step('Hospital Official B cannot navigate to the record via direct URL', async () => {
    await page.goto(`${CLIENT_URL}/events/${eventId}`)
    await expect(
      page.getByText(`No event or draft found with id: ${eventId}`)
    ).toBeVisible({ timeout: 30_000 })
  })
})
