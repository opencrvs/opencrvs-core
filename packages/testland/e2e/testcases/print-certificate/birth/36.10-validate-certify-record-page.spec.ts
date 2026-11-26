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
import { expect, test, type Page } from '@playwright/test'
import {
  Declaration,
  createDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { login, getToken } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  navigateToCertificatePrintAction,
  printAndExpectPopup,
  selectRequesterType,
  selectCertificationType
} from '@e2e/support/print-certificate/birth/helpers'
import { expectInUrl } from '@e2e/support/utils'

test.describe.serial('10.0 Validate "Review" page', () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('10.0.1 Log in', async () => {
    await login(page)
  })

  test('10.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test('10.1 Review page validations', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeVisible()
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'Print certified copy?'
    )
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'This will generate a certified copy of the record for printing.'
    )
  })

  test('10.2 On click cancel button, modal will be closed', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeHidden()
  })

  test('10.3 Click print button, user will navigate to a new tab from where user can download PDF', async () => {
    await printAndExpectPopup(page)

    await expectInUrl(page, `/workqueue/pending-certification`)
  })
})
