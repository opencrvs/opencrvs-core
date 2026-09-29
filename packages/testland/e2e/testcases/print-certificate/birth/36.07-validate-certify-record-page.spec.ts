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
import { CREDENTIALS } from '@e2e/support/constants'
import { getToken, login } from '@e2e/support/helpers'
import {
  createDeclaration,
  getDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'
import { expectInUrl } from '@e2e/support/utils'

test.describe.serial('7.0 Validate "Certify record" page', () => {
  let eventId: string
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      token,
      await getDeclaration({ informantRelation: 'BROTHER', token })
    )
    eventId = res.eventId
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.0.1 Log in', async () => {
    await login(page)
  })

  test('7.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test('7.1 continue with "Print and issue to Informant (Brother)" redirect to Collector details page', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Brother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.identity.verify`
    )
    await page.getByRole('button', { name: 'Verified' }).click()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.collect.payment`
    )

    await expect(page.locator('#content-name')).toContainText('Collect Payment')
    await expect(
      page.getByText('Birth registration before 30 days of date of birth')
    ).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()
  })

  test('7.2 should navigate to ready to certify page on continue button click', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
    )
  })

  // @TODO: this is not implemented in events v2 yet
  test.skip('7.3 should skip payment page if payment is 0', async () => {})
})
