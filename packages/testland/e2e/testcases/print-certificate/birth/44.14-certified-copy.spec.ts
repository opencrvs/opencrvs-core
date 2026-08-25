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
import { getToken, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  navigateToCertificatePrintAction,
  openRecordByTitle,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

test.describe.serial('44.14.0 Validate "Certified copy" option', () => {
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

  test('44.14.0.1 Log in', async () => {
    await login(page)
  })

  test('44.14.0.1 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test('44.14.1 "Certified Copy" is not available in certificate types', async () => {
    await page.locator('#certificateTemplateId svg').click()
    await expect(
      page.getByText('Birth Certificate', { exact: true })
    ).toHaveCount(2) // One as a selected option, another in dropdown
    await expect(
      page.getByText('Birth Certificate Certified Copy', { exact: true })
    ).not.toBeVisible()
    await page.locator('body').click()
  })

  test('44.14.2 Print certificate', async () => {
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })

  test('44.14.3 "Certified Copy" is now available in certificate types', async () => {
    await page
      .getByRole('textbox', { name: 'Search for a record' })
      .fill(formatV2ChildName(declaration))

    await page.getByRole('button', { name: 'Search' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Print')
    await page.locator('#certificateTemplateId svg').click()
    await expect(
      page.getByText('Birth Certificate Certified Copy', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText('Birth Certificate', { exact: true })
    ).not.toBeVisible()
  })
})
