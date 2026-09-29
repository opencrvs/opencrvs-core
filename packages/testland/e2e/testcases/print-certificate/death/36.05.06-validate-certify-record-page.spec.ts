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
import { getToken, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/death-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/death/helpers'
import { expectInUrl } from '@e2e/support/utils'
import { REQUIRED_VALIDATION_ERROR } from '@e2e/support/birth/helpers'
import { ASSETS_DIR } from '@e2e/support/paths'

async function selectIdType(page: Page, idType: string) {
  await page.locator('#collector____OTHER____idType').click()
  await page.getByText(idType, { exact: true }).click()
}

test.describe.serial('Validate collect payment page', () => {
  let eventId: string
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    eventId = res.eventId
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('5.0.1 Log in', async () => {
    await login(page)
  })

  test('5.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test('5.1 check collect payment page header', async () => {
    await selectCertificationType(page, 'Death Certificate')
    await selectRequesterType(page, 'Print and issue to someone else')
  })

  test('5.2 should be able to select "No ID available" and no other ID field will be visible', async () => {
    await selectIdType(page, 'No ID available')
    await expect(page.locator('#collector____PASSPORT____details')).toBeHidden()
  })

  test('5.2 should be able to select any type of id and corresponding id input will be visible', async () => {
    await selectIdType(page, 'Passport')
    await expect(
      page.locator('#collector____PASSPORT____details')
    ).toBeVisible()

    await selectIdType(page, 'Other')
    await expect(
      page.locator('#collector____OTHER____idTypeOther')
    ).toBeVisible()
  })

  test('5.2 should be able to select National ID and corresponding id input will be visible with validation rules', async () => {
    await selectIdType(page, 'National ID')
    await page.fill('#collector____nid', '1234567')
    await page.getByRole('heading', { name: 'Death', exact: true }).click()

    await expect(page.locator('#collector____nid_error')).toContainText(
      'The national ID can only be numeric and must be 10 digits long'
    )
    await page.fill('#collector____nid', '1235678922')
    await page.getByRole('heading', { name: 'Death', exact: true }).click()
    await expect(page.locator('#collector____nid_error')).toBeHidden()
  })

  test('5.3 should be able to enter first name', async () => {
    await page.fill('#firstname', 'James Henry')
    await expect(page.locator('#firstname')).toHaveValue('James Henry')
  })

  test('5.4 should be able to enter last name', async () => {
    await page.fill('#surname', 'Smith')
    await expect(page.locator('#surname')).toHaveValue('Smith')
  })

  test('5.5 keep relationship null and continue', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page
        .locator('#collector____OTHER____relationshipToDeceased_error')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
  })

  test('5.6 should be able to enter relationship', async () => {
    await page.fill('#collector____OTHER____relationshipToDeceased', 'Uncle')
    await expect(
      page.locator('#collector____OTHER____relationshipToDeceased')
    ).toHaveValue('Uncle')
    await page.getByRole('heading', { name: 'Death', exact: true }).click()
  })

  test("5.7 Fill all mandatory field and click 'Continue' should navigate to affidavit page", async () => {})

  test.describe('6.0 Validate "Upload signed affidavit" page:', async () => {
    test('6.1 Should be able to add file and navigate to the "Ready to certify?" page.', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const path = require('path')
      const attachmentPath = path.join(ASSETS_DIR, '528KB-random.png')
      const inputFile = await page.locator(
        'input[name="collector____OTHER____signedAffidavit"][type="file"]'
      )
      await inputFile.setInputFiles(attachmentPath)
      await expect(
        page.getByRole('button', { name: 'Signed Affidavit' })
      ).toBeVisible()
      await expect(page.locator('#preview_delete')).toBeVisible()
      await page.getByRole('button', { name: 'Continue' }).click()
      await expectInUrl(
        page,
        `/print-certificate/${eventId}/pages/collector.collect.payment`
      )
    })
  })
})
