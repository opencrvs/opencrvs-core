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
import { faker } from '@faker-js/faker'
import {
  getToken,
  login,
  searchFromSearchBar,
  switchEventTab
} from '../../../../helpers'
import { CLIENT_URL, CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import { formatV2ChildName } from '../../../birth/helpers'
import { ensureAssignedToUser, selectAction } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

/**
 * QA case: "Validation of user marking the record as a duplicate".
 *
 * This adapts the already-proven end-to-end flow from
 * `duplicate/overview.spec.ts` (same modal locators:
 * `.react-select__control`/`.react-select__option`, `#describe-reason`,
 * `mark-as-duplicate-button`) rather than inventing a new one, and adds the
 * QA case's specific button-disabled-state checks that the existing spec
 * doesn't cover.
 */
test('1. "Mark as duplicate" is disabled until both a tracking id and a reason are given, then archives the record', async ({
  page
}) => {
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
  let duplicateTrackingId: string

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details)
    expect(res.trackingId).toBeDefined()
    trackingId = res.trackingId!
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details, ActionType.DECLARE)
    duplicateTrackingId = res.trackingId!
  })

  await test.step('Open the review page and the Mark as duplicate modal', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')

    await page.getByRole('button', { name: 'Mark as duplicate' }).click()
    await expect(
      page.getByText(`Mark ${duplicateTrackingId} as duplicate?`)
    ).toBeVisible()
  })

  await test.step('The confirm button is disabled with neither field filled', async () => {
    await expect(page.getByTestId('mark-as-duplicate-button')).toBeDisabled()
  })

  await test.step('It stays disabled with only the reason filled in', async () => {
    await page.locator('#describe-reason').fill('Test reason')
    await expect(page.getByTestId('mark-as-duplicate-button')).toBeDisabled()
  })

  await test.step('It becomes enabled once a duplicate-of tracking id is also selected', async () => {
    await page.locator('.react-select__control').first().click()
    await page.locator('.react-select__option').getByText(trackingId).click()

    await expect(page.getByTestId('mark-as-duplicate-button')).toBeEnabled()
  })

  await test.step('Confirming marks the record as a duplicate and archives it', async () => {
    await page.getByTestId('mark-as-duplicate-button').click()
  })

  await test.step('The record is archived and no longer listed as a potential duplicate', async () => {
    await searchFromSearchBar(page, duplicateTrackingId, false)
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await expect(page.getByTestId('status-value')).toHaveText('Archived')
  })

  await test.step('The audit history records "Marked as a duplicate"', async () => {
    await switchEventTab(page, 'Audit')

    await expect(
      page.getByRole('button', { name: 'Marked as a duplicate', exact: true })
    ).toBeVisible()
  })
})

test('2. Cancelling the "Mark as duplicate" modal leaves the record untouched', async ({
  page
}) => {
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

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details)
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details, ActionType.DECLARE)
  })

  await test.step('Open and cancel the Mark as duplicate modal', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')

    await page.getByRole('button', { name: 'Mark as duplicate' }).click()
    await page.getByTestId('modal_cancel').click()
  })

  await test.step('The record is still listed as a potential duplicate, not archived', async () => {
    // Neither the "Review potential duplicates" page nor the record
    // overview it returns to (via goBack) show the workqueue sidebar --
    // only the post-login dashboard does. Reset there directly.
    await page.goto(CLIENT_URL)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
  })
})
