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
import {
  drawSignature,
  getToken,
  login,
  switchEventTab,
  triggerDeclarationAction,
  validateActionMenuButton
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/death-declaration'
import { ActionType } from '@opencrvs/toolkit/events'

test('Death notified at a health facility is held for attestation, then reaches the registrar once attested', async ({
  browser
}) => {
  test.setTimeout(180_000)
  let declaration: Declaration
  let name: string

  const page = await browser.newPage()

  await test.step('Hospital Official notifies a death at a health facility (via API)', async () => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)

    // Notify a declaration with full details, so we can ensure that declare is blocked by the attestation-required flag, and not missing details.
    const res = await createDeclaration(
      token,
      undefined,
      ActionType.NOTIFY,
      'HEALTH_FACILITY'
    )
    declaration = res.declaration
    name = `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
  })

  await test.step('Record is held in the Hospital Official Pending attestation workqueue', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await navigateToWorkqueue(page, 'Pending attestation')
    await expect(page.getByRole('button', { name })).toBeVisible()
  })

  await test.step('User cannot "Declare with edits" a record that is pending attestation', async () => {
    await page.getByRole('button', { name }).click()

    await expect(page.getByTestId('flags-value')).toContainText(
      'Attestation required'
    )

    await expect(page.getByTestId('status-value')).toContainText('Notified')

    await ensureAssignedToUser(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await selectAction(page, 'Edit')

    // Change the gender of the deceased
    await page.getByTestId('change-button-deceased.gender').click()
    await page.locator('#deceased____gender').click()
    await page.getByText('Female', { exact: true }).click()
    await page.getByRole('button', { name: 'Go to review' }).click()

    // Re-notify should be allowed, but declare should be blocked by 'Attestation required' flag.
    await validateActionMenuButton(page, 'Notify with edits', true)

    await page.getByRole('button', { name: 'Action', exact: true }).click()
    const declareButton = page.getByText('Declare with edits', { exact: true })
    await expect(declareButton).not.toBeVisible()

    await page.getByText('Cancel edits').click()

    const unassignResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.assignment.unassign') && res.ok()
    )
    await selectAction(page, 'Unassign')
    await page.getByRole('button', { name: 'Unassign' }).click()
    await unassignResponse
  })

  await test.step('Health Administrator sees the record in Pending attestation and attests it', async () => {
    await login(page, CREDENTIALS.HEALTH_ADMINISTRATOR)

    await navigateToWorkqueue(page, 'Pending attestation')
    await expect(page.getByRole('button', { name })).toBeVisible()

    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.HEALTH_ADMINISTRATOR)

    // The record shows the attestation-required flag before it is attested.
    await expect(page.getByTestId('flags-value')).toContainText(
      'Attestation required'
    )

    await selectAction(page, 'Attest')
    await page.locator('#comments').fill('Death confirmed at this facility.')

    const attestResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') &&
        response.status() === 200
    )
    await page.getByRole('button', { name: 'Confirm' }).click()
    await attestResponse
  })

  await test.step('attestation-required flag is cleared and the record leaves Pending attestation', async () => {
    // The record is no longer awaiting attestation, so it drops out of the Pending attestation workqueue.
    await navigateToWorkqueue(page, 'Pending attestation')
    await expect(page.getByRole('button', { name })).toBeHidden()
  })

  await test.step('Record reaches the Registration Official Notifications workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await navigateToWorkqueue(page, 'Notifications')
    await expect(page.getByRole('button', { name })).toBeVisible()
  })

  let notifiedSignatureSrc: string | null = null

  await test.step('Registrar notes the signature captured at notification', async () => {
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await switchEventTab(page, 'Record')
    notifiedSignatureSrc = await page
      .getByAltText('Signature preview')
      .first()
      .getAttribute('src')
    expect(notifiedSignatureSrc).toBeTruthy()
  })

  await test.step('Registrar edits the record and draws a new signature', async () => {
    await switchEventTab(page, 'Summary')
    await selectAction(page, 'Edit')

    // Replace the informant signature on the review page.
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await triggerDeclarationAction(page, 'Register with edits')
  })

  await test.step('Record tab shows the edited signature, not the notified one', async () => {
    await navigateToWorkqueue(page, 'Pending certification')
    await openRecordByTitle(page, name)
    await expect(page.getByTestId('status-value')).toHaveText('Registered')

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await switchEventTab(page, 'Record')

    const registeredSignatureSrc = await page
      .getByAltText('Signature preview')
      .first()
      .getAttribute('src')
    expect(registeredSignatureSrc).toBeTruthy()
    // The edited signature is a freshly uploaded file, so its path differs from
    // the one captured at notification.
    expect(registeredSignatureSrc).not.toEqual(notifiedSignatureSrc)
  })
})
