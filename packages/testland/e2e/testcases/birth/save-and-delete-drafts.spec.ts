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
  goToSection,
  login,
  logout,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  fillChildDetails,
  openBirthDeclaration
} from '@e2e/support/birth/helpers'
import { selectAction } from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

/**
 * Skipping tests until the outbox workqueue is implemented.
 * Develop is already in broken state. We'll revisit this when we have ungloc the pipeline and can dedicate time on which change caused the error.
 */
test.describe('Save and delete drafts', () => {
  test('Save draft', async ({ page }) => {
    let childName = ''
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openBirthDeclaration(page)

    await test.step('Save draft via Save & Exit', async () => {
      childName = await fillChildDetails(page)
      await page.getByRole('button', { name: 'Save & Exit' }).click()
      await expect(
        page.getByText(
          'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?'
        )
      ).toBeVisible()

      const draftResponse = page.waitForResponse(
        (res) => res.url().includes('event.draft.create') && res.ok()
      )
      await page.getByRole('button', { name: 'Confirm' }).click()
      await draftResponse

      await page.getByRole('button', { name: 'Drafts' }).click()
      await openRecordByTitle(page, childName)

      await expect(page.locator('#content-name')).toHaveText(childName)
    })

    await test.step('Saved draft is not visible to other users', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRAR)

      await page.getByText('Drafts').click()

      await expect(
        page.getByRole('button', { name: childName, exact: true })
      ).not.toBeVisible()
    })

    await test.step('Login as Registration Officer', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRATION_OFFICER, true)
    })

    await test.step('Delete saved draft', async () => {
      await page.getByRole('button', { name: 'Drafts' }).click()
      await openRecordByTitle(page, childName)

      await selectAction(page, 'Update')
      await triggerDeclarationAction(page, 'Delete declaration')

      await expect(
        page.getByRole('button', { name: childName, exact: true })
      ).not.toBeVisible()
    })
  })

  test('Exit without saving', async ({ page }) => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openBirthDeclaration(page)
    await test.step('Exit without saving', async () => {
      const childName = await fillChildDetails(page)
      await goToSection(page, 'review')
      await page.getByTestId('exit-button').click()

      await expect(
        page.getByText(
          'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?'
        )
      ).toBeVisible()

      await page.getByRole('button', { name: 'Confirm', exact: true }).click()

      await page.getByRole('button', { name: 'Assigned to you' }).click()

      await expect(
        page.getByRole('button', { name: childName, exact: true })
      ).not.toBeVisible()
    })
  })
})
