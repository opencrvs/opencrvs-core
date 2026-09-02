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
import { getToken, login } from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration-with-mother-father'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { createClient } from '@opencrvs/toolkit/api'
import { v4 as uuidv4 } from 'uuid'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test('Mark as duplicate while offline', async ({ page }) => {
  const details = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0],
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const name = formatV2ChildName(details)
  let trackingId: string

  let duplicateEventId: string
  let token: string

  await test.step('First declaration', async () => {
    token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details)

    expect(res.trackingId).toBeDefined()

    trackingId = res.trackingId!
  })

  await test.step('Second declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const duplicateEvent = await createDeclaration(
      token,
      details,
      ActionType.DECLARE
    )
    duplicateEventId = duplicateEvent.eventId!
  })

  await test.step("Navigate to potential duplicate's overview", async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
  })

  await test.step('Go to duplicate review', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')
  })

  await test.step('Go offline', async () => {
    await page.context().setOffline(true)
  })

  await test.step('Mark as duplicate', async () => {
    await page.getByRole('button', { name: 'Mark as duplicate' }).click()
    await page.locator('.react-select__control').first().click()
    await page.locator('.react-select__option').getByText(trackingId).click()

    await page.locator('#describe-reason').fill('Test reason')

    await page.getByTestId('mark-as-duplicate-button').click()
  })

  await test.step('Unassign user via API', async () => {
    const provincialToken = await getToken(CREDENTIALS.PROVINCIAL_REGISTRAR)
    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${provincialToken}`
    )

    await client.event.actions.assignment.unassign.mutate({
      eventId: duplicateEventId,
      transactionId: uuidv4(),
      type: ActionType.UNASSIGN
    })
  })

  await test.step('Go online', async () => {
    await page.context().setOffline(false)
  })

  await test.step('Validate unassignment', async () => {
    await expect(
      page.getByText("You've been unassigned from the event")
    ).toBeVisible()
  })

  await test.step('Record still appears in potential duplicates workqueue', async () => {
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await expect(page.getByRole('button', { name })).toBeVisible()
  })
})
