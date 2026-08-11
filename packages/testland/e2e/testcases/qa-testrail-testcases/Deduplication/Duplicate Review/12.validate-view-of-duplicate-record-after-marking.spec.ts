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
  logout,
  searchFromSearchBar,
  validateActionMenuButton
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import { formatV2ChildName } from '../../../birth/helpers'
import { ensureAssignedToUser, selectAction } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

/**
 * QA case: "Validation of user's view of a duplicate record after marking
 * them as duplicate/ not as duplicate".
 *
 * Scope note: "by another user" is represented here by re-logging in on the
 * same page rather than a second, differently-scoped user account. What's
 * under test is the record's resulting state after the mark-as-*action --
 * that state is persisted server-side and rendered identically to whoever
 * next opens the record, so this is a faithful (and much lower-risk) way to
 * exercise it than juggling a second user's jurisdiction/scope.
 *
 * The re-login passes `skipPin: true` -- this is the SAME user logging back
 * in within the same browser context, which already has a PIN set from the
 * first login, so the create-PIN flow never renders and waiting for it
 * hangs.
 */
test('1. After being marked not a duplicate, the record shows a normal review page with no duplicate warning', async ({
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
  let duplicateTrackingId: string

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details)
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details, ActionType.DECLARE)
    duplicateTrackingId = res.trackingId!
  })

  await test.step('Mark it as not a duplicate', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')

    await page.getByRole('button', { name: 'Not a duplicate' }).click()
    const markNotDuplicateResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.duplicate.markNotDuplicate') &&
        res.ok()
    )
    await page.getByTestId('not-duplicate-confirm').click()
    await markNotDuplicateResponse
  })

  await test.step('Viewed again, the record has no duplicate warning and a normal action menu', async () => {
    await logout(page)
    await login(page, CREDENTIALS.REGISTRAR, true)

    // The baseline and the marked-not-duplicate declaration share the exact
    // same name -- searching by name alone matches both and makes
    // openRecordByTitle's row locator ambiguous. Searching by tracking id
    // first narrows the result list to the one record before opening it by
    // name, same as test 2 below.
    await searchFromSearchBar(page, duplicateTrackingId, false)
    await openRecordByTitle(page, name)

    await expect(page.getByText(/Potential duplicate of record/)).toBeHidden()

    await validateActionMenuButton(page, 'Register', true)
  })
})

test('2. After being marked a duplicate, the record is found archived', async ({
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
    trackingId = res.trackingId!
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details, ActionType.DECLARE)
    duplicateTrackingId = res.trackingId!
  })

  await test.step('Mark it as a duplicate', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')

    await page.getByRole('button', { name: 'Mark as duplicate' }).click()
    await page.locator('.react-select__control').first().click()
    await page.locator('.react-select__option').getByText(trackingId).click()
    await page.locator('#describe-reason').fill('Test reason')
    await page.getByTestId('mark-as-duplicate-button').click()
  })

  await test.step('Viewed again, the record is found archived', async () => {
    await logout(page)
    await login(page, CREDENTIALS.REGISTRAR, true)

    await searchFromSearchBar(page, duplicateTrackingId, false)
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(page.getByTestId('status-value')).toHaveText('Archived')
  })
})
