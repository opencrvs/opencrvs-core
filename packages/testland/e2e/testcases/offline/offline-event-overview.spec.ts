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

import { ActionType } from '@opencrvs/toolkit/events'
import { getToken, login } from '@e2e/support/helpers'
import { mockNetworkConditions } from '@e2e/support/mock-network-conditions'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { CREDENTIALS } from '@e2e/support/constants'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test('Can view non-downloaded event online', async ({ page }) => {
  test.setTimeout(180_000)
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const res = await createDeclaration(token, undefined, ActionType.DECLARE)
  const declaration = res.declaration
  const childName = formatV2ChildName(declaration)
  const trackingId = res.trackingId!

  await test.step('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  await test.step('Open the event overview page', async () => {
    await openRecordByTitle(page, childName)
  })

  await test.step('Verify user can only see non-secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).not.toHaveText(
      'mothers@email.com'
    )
  })

  await test.step('Verify that user can see details on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('child.name-value')).toHaveText(childName)
  })
})

test('Can partially view non-downloaded event offline', async ({ page }) => {
  test.setTimeout(180_000)
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const res = await createDeclaration(token, undefined, ActionType.DECLARE)
  const declaration = res.declaration
  const childName = formatV2ChildName(declaration)
  const trackingId = res.trackingId!

  await test.step('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  await test.step('Go offline', async () => {
    await mockNetworkConditions(page, 'offline')
  })

  await test.step('Open the event overview page', async () => {
    await openRecordByTitle(page, childName)
  })

  await test.step('Verify user can only see non-secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).not.toHaveText(
      'mothers@email.com'
    )
  })

  await test.step('Verify user sees offline message on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('record-offline-message')).toBeVisible()
    await expect(page.getByTestId('child.name-value')).not.toBeVisible()
  })
})

test('Can view downloaded event offline', async ({ page }) => {
  test.setTimeout(180_000)
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const res = await createDeclaration(token, undefined, ActionType.DECLARE)
  const declaration = res.declaration
  const childName = formatV2ChildName(declaration)
  const trackingId = res.trackingId!

  await test.step('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  await test.step('Download record', async () => {
    const row = page.getByTestId('row-item').filter({ hasText: childName })

    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .click()

    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    const getResponse = page.waitForResponse(
      (res) => res.url().includes('event.get') && res.ok()
    )

    const assignResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.assignment.assign') && res.ok()
    )

    const searchResponse = page.waitForResponse(
      (res) => res.url().includes('event.search') && res.ok()
    )

    await Promise.all([getResponse, assignResponse, searchResponse])

    await expect(row.getByLabel('User avatar')).toBeVisible({ timeout: 20000 })
  })

  await test.step('Go offline', async () => {
    await mockNetworkConditions(page, 'offline')
  })

  await test.step('Open the event overview page', async () => {
    await openRecordByTitle(page, childName)
  })

  await test.step('Verify that user can see secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).toHaveText(
      'mothers@email.com'
    )
  })

  await test.step('Verify that user can see details on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('child.name-value')).toHaveText(childName)
  })
})

test('Spinner switches to offline icon when network drops mid-assign', async ({
  browser
}) => {
  const page = await browser.newPage()
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const { declaration } = await createDeclaration(
    token,
    undefined,
    ActionType.DECLARE
  )
  const childName = formatV2ChildName(declaration)

  await test.step('Login and open the workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  await test.step('Spinner swaps to offline icon on network drop', async () => {
    await page.route(/event\.actions\.assignment\.assign/, () => {
      // Intentionally never resolve.
    })

    const row = page.getByTestId('row-item').filter({ hasText: childName })

    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .click()
    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    // Spinner appears while the assign mutation is pending.
    await expect(row.getByTestId('download-loading-icon')).toBeVisible()

    // Go offline
    await mockNetworkConditions(page, 'offline')

    await expect(row.getByTestId('no-connection-icon')).toBeVisible()
    await expect(row.getByTestId('download-loading-icon')).not.toBeVisible()

    await page.unroute(/event\.actions\.assignment\.assign/)
  })
})
