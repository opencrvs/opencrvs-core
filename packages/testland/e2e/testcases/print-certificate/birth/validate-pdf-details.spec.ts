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
import {
  Declaration,
  createDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { login, getToken } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  navigateToCertificatePrintAction,
  openRecordByTitle,
  selectRequesterType,
  selectCertificationType
} from '@e2e/support/print-certificate/birth/helpers'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

test.describe
  .serial("Validate 'Birth Certificate Certified Copy' PDF details", () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    // Create a declaration with a health facility place of birth
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )

    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await login(page)
  })

  test('Print birth certificate once', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })

  test('Go to review', async () => {
    await page
      .getByRole('textbox', { name: 'Search for a record' })
      .fill(formatV2ChildName(declaration))

    await page.getByRole('button', { name: 'Search' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await selectAction(page, 'Print')
    await selectCertificationType(page, 'Birth Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText('Klow Village Hospital')
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
})

test.describe.serial("Validate 'Birth Certificate' PDF details", () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    // Create a declaration
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )

    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await login(page)
  })

  test('Go to review', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText('Klow Village Hospital')
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
})
