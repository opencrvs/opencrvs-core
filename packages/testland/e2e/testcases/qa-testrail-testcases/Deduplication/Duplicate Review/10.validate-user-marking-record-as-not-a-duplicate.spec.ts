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
import { getToken, login, validateActionMenuButton } from '../../../../helpers'
import { CLIENT_URL, CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import { formatV2ChildName } from '../../../birth/helpers'
import { ensureAssignedToUser, selectAction } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

/**
 * QA case: "Validation of user marking the record as not a duplicate".
 *
 * There is no prior e2e coverage of this button anywhere in the codebase --
 * the only place it's exercised at all is a client-side Storybook
 * interaction test, not a Playwright/testland spec. Locators below (modal
 * id, Cancel/Confirm testids, the "Marked not a duplicate" audit label) are
 * taken directly from the component source
 * (packages/client/src/v2-events/features/events/actions/dedup/MarkAsNotDuplicateModal.tsx)
 * and the production translation override for the audit-history label
 * (packages/testland/src/translations/client.csv), since the English
 * default in EventOverview.tsx doesn't cover this action at all and the CSV
 * override is what actually ships.
 */

function declarationDetails() {
  return {
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
}

test('1. Cancelling the "Not a duplicate" confirmation leaves the record flagged', async ({
  page
}) => {
  const details = declarationDetails()
  const name = formatV2ChildName(details)

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details)
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details, ActionType.DECLARE)
  })

  await test.step('Open "Not a duplicate" and cancel', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')

    await page.getByRole('button', { name: 'Not a duplicate' }).click()
    await expect(page.getByText(/is not duplicate\?/)).toBeVisible()
    await page.getByTestId('not-duplicate-cancel').click()
  })

  await test.step('The modal closes and the record is still in Potential duplicate', async () => {
    await expect(page.getByText(/is not duplicate\?/)).toBeHidden()

    // Neither the "Review potential duplicates" page nor the record
    // overview it returns to (via goBack) show the workqueue sidebar --
    // only the post-login dashboard does. Reset there directly.
    await page.goto(CLIENT_URL)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
  })
})

test('2. Confirming "Not a duplicate" clears the flag and records it in the audit history', async ({
  page
}) => {
  const details = declarationDetails()
  const name = formatV2ChildName(details)

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details)
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details, ActionType.DECLARE)
  })

  await test.step('Mark it as not a duplicate', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')

    await page.getByRole('button', { name: 'Not a duplicate' }).click()
    await expect(page.getByText(/is not duplicate\?/)).toBeVisible()

    const markNotDuplicateResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.duplicate.markNotDuplicate') &&
        res.ok()
    )
    await page.getByTestId('not-duplicate-confirm').click()
    await markNotDuplicateResponse
  })

  await test.step('The record is no longer blocked from registration', async () => {
    await validateActionMenuButton(page, 'Register', true)
  })

  await test.step('The audit history records "Marked not a duplicate"', async () => {
    await page.getByRole('button', { name: 'Audit', exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Marked not a duplicate', exact: true })
    ).toBeVisible()
  })
})
