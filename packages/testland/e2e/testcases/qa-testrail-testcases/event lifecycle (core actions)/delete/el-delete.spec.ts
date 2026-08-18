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
import { CREDENTIALS } from '../../../../constants'
import { selectAction } from '../../../../utils'
import { fillChildDetails, openBirthDeclaration } from '../../../../testcases/birth/helpers'
import { login, triggerDeclarationAction } from '../../../../helpers'
import { openRecordByTitle } from '../../helpers'

// The delete-declaration modal ('Delete draft?' + Cancel/Confirm) is shared
// by every entry point below - the header's 3-dot menu (available on any
// page of an unsubmitted draft) and the review page's Action menu.

// TestRail TC-0072: Validate user can delete drafts
// (1 of 3 e2e tests in this file covering this test case - the modal
// contents/copy sub-scenario)
test('Validate the Delete draft modal contents', async ({ page }) => {
  test.setTimeout(180_000)

  await test.step('Login and start a birth declaration', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openBirthDeclaration(page)
  })

  await test.step('Fill child details', async () => {
    await fillChildDetails(page)
  })

  await test.step('Open the delete confirmation from the 3-dot menu', async () => {
    await page.getByTestId('event-menu-toggle-button-image').click()
    await page.getByText('Delete declaration', { exact: true }).click()
  })

  await test.step('Modal shows the expected title, verbiage and buttons', async () => {
    await expect(page.getByText('Delete draft?', { exact: true })).toBeVisible()
    await expect(
      page.getByText(
        "Are you sure you want to delete this declaration?"
      )
    ).toBeVisible()
    await expect(page.locator('#cancel_delete')).toBeVisible()
    await expect(page.locator('#confirm_delete')).toBeVisible()
  })

  await test.step('Cancel closes the modal without deleting', async () => {
    await page.locator('#cancel_delete').click()
    await expect(
      page.getByText('Delete draft?', { exact: true })
    ).not.toBeVisible()
  })
})

// TestRail TC-0072: Validate user can delete drafts
// (2 of 3 e2e tests in this file covering this test case - deleting from
// any page via the 3-dot menu)
test('Verify user can delete a draft from any page via the 3-dot menu', async ({
  page
}) => {
  test.setTimeout(180_000)

  let childName = ''

  await test.step('Login and start a birth declaration', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openBirthDeclaration(page)
  })

  await test.step('Fill child details (not the last page of the form)', async () => {
    childName = await fillChildDetails(page)
  })

  await test.step('Delete via the 3-dot menu, confirming the deletion', async () => {
    await page.getByTestId('event-menu-toggle-button-image').click()
    await page.getByText('Delete declaration', { exact: true }).click()

    await page.locator('#confirm_delete').click()
  })

  await test.step('The declaration no longer exists in Drafts', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()
    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })
})

// TestRail TC-0072: Validate user can delete drafts
// (3 of 3 e2e tests in this file covering this test case - deleting from
// the review page's Action menu)
test('Verify user can delete a draft from the review page Action menu', async ({
  page
}) => {
  test.setTimeout(180_000)

  let childName = ''

  await test.step('Login and start a birth declaration', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openBirthDeclaration(page)
  })

  await test.step('Fill child details and save as a draft', async () => {
    childName = await fillChildDetails(page)
    await page.getByRole('button', { name: 'Save & Exit' }).click()

    const draftResponse = page.waitForResponse(
      (res) => res.url().includes('event.draft.create') && res.ok()
    )
    await page.getByRole('button', { name: 'Confirm' }).click()
    await draftResponse
  })

  await test.step('Reopen the draft to reach the review page', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()
    await openRecordByTitle(page, childName)

    await expect(page.locator('#content-name')).toHaveText(childName)
  })

  await test.step("Delete declaration' from the Action menu, then Cancel", async () => {
    await selectAction(page, 'Update')
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page.getByText('Delete declaration', { exact: true }).click()

    await expect(page.getByText('Delete draft?', { exact: true })).toBeVisible()
    await page.locator('#cancel_delete').click()
  })

  await test.step('Delete declaration again, this time confirming', async () => {
    await triggerDeclarationAction(page, 'Delete declaration')
  })

  await test.step('The declaration no longer exists', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()
    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })
})
