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
import { getToken, login } from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import { formatV2ChildName, assertRecordInWorkqueue } from '../../../birth/helpers'
import { ensureAssignedToUser } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

/**
 * QA case: "Validate user can find duplicate records in Potential duplicate
 * workqueue".
 *
 * The QA text describes a "duplicate icon" in the workqueue row and on the
 * audit page. The actual `<Duplicate />` icon
 * (packages/components/src/icons/Duplicate.tsx) has no `data-testid`,
 * `aria-label`, or `title` -- there is nothing to assert against it
 * directly, and no existing spec anywhere in this codebase tries to. Every
 * existing duplicate-related spec (duplicate/overview.spec.ts,
 * qa-testrail-testcases/.../1 and 2.validate-user-can-see-duplicate-*)
 * instead verifies the same underlying fact -- the record is discoverable
 * as a duplicate -- through the workqueue membership and the text-based
 * `DuplicateWarning` banner / audit-history entry. This spec follows that
 * same, already-proven approach rather than asserting on an untestable
 * icon.
 */
test('1. A potential duplicate is findable in the Potential duplicate workqueue and flagged on its audit page', async ({
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

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details)
    expect(res.trackingId).toBeDefined()
    trackingId = res.trackingId!
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, details, ActionType.DECLARE)
  })

  await test.step('The second declaration is listed in the Potential duplicate workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await assertRecordInWorkqueue({
      page,
      name,
      workqueues: [{ title: 'Potential duplicate', exists: true }]
    })
  })

  await test.step('Open it and confirm the duplicate warning is shown on its overview', async () => {
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(
      page.getByText(`Potential duplicate of record ${trackingId}`)
    ).toBeVisible()
  })

  await test.step('The audit page records it as flagged for a potential duplicate', async () => {
    await page.getByRole('button', { name: 'Audit', exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Flagged as potential duplicate' })
    ).toBeVisible()
  })
})
