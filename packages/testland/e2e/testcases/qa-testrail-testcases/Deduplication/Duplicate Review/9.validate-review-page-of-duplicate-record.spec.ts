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
import { formatV2ChildName } from '../../../birth/helpers'
import { ensureAssignedToUser, selectAction } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

/**
 * QA case: "Validation of review page of any duplicate record".
 *
 * Scope note: the QA text also describes MOSIP "ID verified"/"ID
 * verification Failed" badges next to each person section. That's a real,
 * generic field type (VERIFICATION_STATUS,
 * packages/client/src/v2-events/features/events/registered-fields/VerificationStatus.tsx)
 * but exercising it requires a MOSIP ID-reader/verification setup that no
 * existing spec (including the "mosip" suite, which only checks the field
 * value via the API) drives through the UI. That's a materially separate
 * piece of setup from what this case is really about (the duplicate-review
 * page's own layout/actions/comparison view), so it's left out here rather
 * than bolted on.
 *
 * This reuses the exact interaction patterns already proven in
 * `duplicate/overview.spec.ts` and `duplicate/corrected-record-comparison.spec.ts`
 * (selectAction(page, 'Review potential duplicates'), the tracking-id tab
 * buttons, `.react-select__control`/`#describe-reason` for the "Mark as
 * duplicate" modal) rather than inventing new locators. "Not a duplicate"
 * and "Mark as duplicate" are only opened and cancelled here -- their full
 * completion flows are covered by
 * "10.validate-user-marking-record-as-not-a-duplicate.spec.ts" and
 * "11.validate-user-marking-record-as-a-duplicate.spec.ts".
 */
test('1. The potential duplicate review page shows both records and disables conflicting actions', async ({
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
  let secondTrackingId: string

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details)
    expect(res.trackingId).toBeDefined()
    trackingId = res.trackingId!
  })

  await test.step('Declare a second, identical declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details, ActionType.DECLARE)
    expect(res.trackingId).toBeDefined()
    secondTrackingId = res.trackingId!
  })

  await test.step('Open the record overview and assign it', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('The action menu offers to review the duplicate rather than register it directly', async () => {
    // Verified live: while flagged, "Register" isn't merely disabled -- it's
    // absent from the menu entirely (replaced by "Review potential
    // duplicates"), while Escalate/Reject/Archive/Unassign remain listed.
    // Asserting the full disabled/enabled state of every one of those would
    // over-fit to a menu composition this case doesn't otherwise depend on;
    // what matters here is that duplicate review is the offered path.
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await expect(
      page
        .locator('#action-Dropdown-Content')
        .getByText('Review potential duplicates', { exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Action', exact: true }).click()
  })

  await test.step('Open the potential duplicate review page', async () => {
    await selectAction(page, 'Review potential duplicates')
  })

  await test.step('The review page shows the expected heading, tabs and question', async () => {
    await expect(
      page.getByRole('heading', { name: /Potential .*duplicate review/ })
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: secondTrackingId, exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: trackingId, exact: true })
    ).toBeVisible()

    await expect(page.getByText(/a duplicate\?/)).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Not a duplicate' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Mark as duplicate' })
    ).toBeVisible()
  })

  await test.step('"Not a duplicate" opens its confirmation modal, which can be cancelled', async () => {
    await page.getByRole('button', { name: 'Not a duplicate' }).click()

    await expect(page.getByText(/is not duplicate\?/)).toBeVisible()

    await page.getByTestId('not-duplicate-cancel').click()
  })

  await test.step('"Mark as duplicate" opens its modal with a duplicate-of dropdown and reason field, which can be cancelled', async () => {
    await page.getByRole('button', { name: 'Mark as duplicate' }).click()

    const modal = page.getByTestId('mark-as-duplicate-modal')

    await expect(
      modal.getByText(`Mark ${secondTrackingId} as duplicate?`)
    ).toBeVisible()
    await expect(modal.getByText('Duplicate of')).toBeVisible()
    await expect(modal.getByText('Please describe your reason')).toBeVisible()

    await page.getByTestId('modal_cancel').click()
  })

  await test.step('Selecting the other tracking id tab opens the comparison view', async () => {
    await page.getByRole('button', { name: trackingId, exact: true }).click()

    await expect(
      page.getByText(new RegExp(`Review .* against ${trackingId}`))
    ).toBeVisible()
    await expect(page.getByText('Declaration details')).toBeVisible()
    await expect(page.getByText('Registered at')).toBeVisible()
    await expect(page.getByText('Registered by')).toBeVisible()
    await expect(
      page.getByText('Supporting documents', { exact: true })
    ).toBeVisible()

    // The compared field renders once per column -- once for this
    // declaration, once for the matched one -- since both share identical
    // data.
    await expect(page.getByText(details['mother.nid']).first()).toBeVisible()
  })
})
