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
import { CREDENTIALS } from '@e2e/support/constants'
import {
  getToken,
  login,
  searchFromSearchBar,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '@e2e/support/utils'
import {
  createDeclaration,
  type Declaration
} from '@e2e/support/test-data/birth-declaration'
import {
  assertRecordInWorkqueue,
  formatV2ChildName
} from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

const ESCALATION_FLAG = 'Escalated to Provincial Registrar'

/**
 * An escalation is pending until the authority it was escalated to responds, so
 * an edit by anyone else must keep the flag - and the record must stay in that
 * authority's "Pending feedback" workqueue.
 * See https://github.com/opencrvs/opencrvs-core/issues/13718
 */
test('An escalated declaration keeps its escalation flag when edited by the RO', async ({
  browser
}) => {
  test.setTimeout(180_000)
  const page = await browser.newPage()

  let declaration: Declaration
  let childName: string

  await test.step('Seed a declared birth record via API', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)

    declaration = res.declaration
    childName = formatV2ChildName(declaration)
  })

  await test.step('Registrar escalates the record to the provincial registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await navigateToWorkqueue(page, 'Pending registration')
    await openRecordByTitle(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR, { timeout: 15_000 })

    await selectAction(page, 'Escalate')

    const confirmButton = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmButton).toBeDisabled()

    await page.locator('#escalate-to').click()
    await page
      .getByText('My state provincial registrar', { exact: true })
      .first()
      .click()

    await page
      .locator('#reason')
      .fill('Escalating this declaration for provincial guidance.')

    const escalateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    await escalateResponse
  })

  await test.step('The escalation flag is shown on the record', async () => {
    await searchFromSearchBar(page, childName)

    await expect(page.getByTestId('flags-value')).toContainText(ESCALATION_FLAG)
  })

  await test.step('RO edits the record and declares with edits', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await searchFromSearchBar(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER, {
      timeout: 15_000
    })

    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-child.weightAtBirth').click()
    await page.getByTestId('number__child____weightAtBirth').fill('2.6')
    await page.getByRole('button', { name: 'Go to review' }).click()

    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('The escalation flag survives the edit', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, childName)

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toContainText(ESCALATION_FLAG)
  })

  await test.step('The record is still awaiting the provincial registrar', async () => {
    await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)

    await assertRecordInWorkqueue({
      page,
      name: childName,
      workqueues: [{ title: 'Pending feedback', exists: true }]
    })
  })

  await test.step('Provincial registrar can still give feedback, which clears the flag', async () => {
    await openRecordByTitle(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.PROVINCIAL_REGISTRAR, {
      timeout: 15_000
    })

    await selectAction(page, 'Provincial registrar feedback')

    const confirmButton = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmButton).toBeDisabled()

    await page.locator('#notes').fill('Reviewed the edits, proceed.')

    const feedbackResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    await feedbackResponse

    await searchFromSearchBar(page, childName)
    await expect(page.getByTestId('flags-value')).not.toContainText(
      ESCALATION_FLAG
    )
  })
})
