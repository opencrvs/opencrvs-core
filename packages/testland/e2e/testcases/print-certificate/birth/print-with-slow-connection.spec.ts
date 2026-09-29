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
import { test, type Page, expect } from '@playwright/test'
import { CREDENTIALS } from '@e2e/support/constants'
import { login, getToken } from '@e2e/support/helpers'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import {
  selectRequesterType,
  selectCertificationType,
  navigateToCertificatePrintAction
} from '@e2e/support/print-certificate/birth/helpers'
import { expectInUrl } from '@e2e/support/utils'
import { mockNetworkConditions } from '@e2e/support/mock-network-conditions'

test.describe
  .serial('User should not be able to press print button twice', () => {
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

  test('Log in', async () => {
    await login(page)
  })

  test('Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test('Fill details', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Set slow connection', async () => {
    await mockNetworkConditions(page, 'cellular2G')
  })

  test('Print with slow connection', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()

    const popupPromise = page.waitForEvent('popup')
    await page.getByRole('button', { name: 'Print', exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Yes, print certificate', exact: true })
    ).toBeDisabled()

    const popup = await popupPromise
    const downloadPromise = popup.waitForEvent('download')
    const download = await downloadPromise

    // Check that the popup URL contains PDF content
    await expect(popup.url()).toBe('about:blank')
    await expect(download.suggestedFilename()).toMatch(/^.*\.pdf$/)
    await expectInUrl(page, `/workqueue/pending-certification`)
  })
})
