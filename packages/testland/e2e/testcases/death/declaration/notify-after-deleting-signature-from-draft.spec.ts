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
import {
  drawSignature,
  getEventIdFromUrl,
  getToken,
  goToSection,
  login,
  logout,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { customActionViaApi } from '@e2e/support/test-data/api-actions'
import {
  getRowByTitle,
  openRecordByTitle
} from '@e2e/support/print-certificate/birth/helpers'

/**
 * Regression test for https://github.com/opencrvs/opencrvs-core/issues/12803
 *
 * Sign on the review page → save as draft → reopen the draft → delete the
 * persisted signature → Notify. Pre-fix, the annotation payload kept
 * `{ 'review.signature': null }` and the record got stuck in the outbox.
 * Post-fix (`deepDropNulls` applied to the annotation before submission),
 * the `review.signature` key is omitted entirely and the record is notified
 * normally.
 *
 * Exercising the draft round-trip is the realistic path for this regression:
 * declare actions require a signature, so the only place where a previously
 * persisted signature can be cleared is a Notify (or a draft that ends in a
 * Notify). Death is used since its notify review still has the (optional)
 * signature: the birth notify review has no fields.
 */
test('Hospital official notifies a death after deleting a previously persisted signature from a draft', async ({
  page
}) => {
  const deceasedName = {
    firstname: faker.person.firstName('male'),
    surname: faker.person.lastName('male')
  }
  const formattedDeceasedName = `${deceasedName.firstname} ${deceasedName.surname}`
  let eventId = ''

  await test.step('Login as Hospital official', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
  })

  await test.step('Initiate death notification', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill deceased details', async () => {
    await page.locator('#firstname').fill(deceasedName.firstname)
    await page.locator('#surname').fill(deceasedName.surname)
  })

  await test.step('Continue to review', async () => {
    await goToSection(page, 'review')
    eventId = getEventIdFromUrl(page)
  })

  await test.step('Provide informant signature', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  await test.step('Save & Exit to persist the signature in a draft', async () => {
    await page.getByRole('button', { name: 'Action' }).click()
    await page.getByText('Save & Exit', { exact: true }).click()

    const draftResponse = page.waitForResponse(
      (res) => res.url().includes('event.draft.create') && res.ok()
    )

    await page.getByRole('button', { name: 'Confirm' }).click()
    await draftResponse
  })

  await test.step('Reopen the draft from the Drafts workqueue', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()
    await getRowByTitle(page, formattedDeceasedName)
      .getByRole('button', { name: 'Update' })
      .click()
  })

  await test.step('Delete the persisted signature', async () => {
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Sign', exact: true })
    ).toBeVisible()
  })

  await test.step('Notify', async () => {
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Open record', async () => {
    await page.getByText('Recent').click()

    await openRecordByTitle(page, formattedDeceasedName)
  })

  await test.step('Assert that record is notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await test.step('Log out from Hospital official', async () => {
    await logout(page)
  })

  await test.step('Health Administrator attests the notification (via API)', async () => {
    // A death notified by a hospital official needs attesting before it reaches the Notifications workqueue
    await customActionViaApi({
      token: await getToken(CREDENTIALS.HEALTH_ADMINISTRATOR),
      eventId,
      customActionType: 'ATTEST',
      annotation: { comments: 'Attested for review' }
    })
  })

  await test.step('Log in as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Open the notification and start the Declare flow', async () => {
    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formattedDeceasedName)

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Edit')
  })

  await test.step('Signature is not carried over from the cleared Notify', async () => {
    // The SignatureField only renders Delete when a signature value exists,
    // so the absence of the Delete button (and the presence of the Sign
    // button) is direct evidence that nothing leaked through from the
    // previous action's annotation.
    await expect(
      page.getByRole('button', { name: 'Sign', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Delete', exact: true })
    ).not.toBeVisible()
  })
})
