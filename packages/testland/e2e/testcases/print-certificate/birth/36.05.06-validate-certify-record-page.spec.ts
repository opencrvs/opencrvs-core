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
import { login, getToken } from '@e2e/support/helpers'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import {
  selectRequesterType,
  selectCertificationType,
  navigateToCertificatePrintAction,
  printAndExpectPopup,
  openRecordByTitle
} from '@e2e/support/print-certificate/birth/helpers'
import { ensureAssignedToUser, type, expectInUrl } from '@e2e/support/utils'
import {
  REQUIRED_VALIDATION_ERROR,
  formatV2ChildName
} from '@e2e/support/birth/helpers'
import { ASSETS_DIR } from '@e2e/support/paths'

async function selectIdType(page: Page, idType: string) {
  await page.locator('#collector____OTHER____idType').click()
  await page.getByText(idType, { exact: true }).click()
}

test.describe.serial('Validate collect payment page', () => {
  let eventId: string
  let declaration: Declaration
  let page: Page
  let trackingId: string | undefined

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    eventId = res.eventId
    declaration = res.declaration
    trackingId = res.trackingId
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

  test('5.1 Select certification and requester type', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to someone else')
  })

  test('5.2 should be able to select "No ID available" and no other ID field will be visible', async () => {
    await selectIdType(page, 'No ID available')
    await expect(page.locator('#collector____PASSPORT____details')).toBeHidden()
  })

  test('5.2 should be able to select any type of id and correspondent id input will be visible', async () => {
    await selectIdType(page, 'Passport')
    await expect(
      page.locator('#collector____PASSPORT____details')
    ).toBeVisible()

    await selectIdType(page, 'Other')
    await expect(
      page.locator('#collector____OTHER____idTypeOther')
    ).toBeVisible()
  })

  test('5.2 should be able to select National ID and correspondent id input will be visible with validation rules', async () => {
    await selectIdType(page, 'National ID')
    await page.fill('#collector____nid', '1234567')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()

    await expect(page.locator('#collector____nid_error')).toContainText(
      'The national ID can only be numeric and must be 10 digits long'
    )
    await page.fill('#collector____nid', '1235678922')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()
    await expect(page.locator('#collector____nid_error')).toBeHidden()
  })

  test('5.3 should be able to enter first name', async () => {
    await page.fill('#firstname', 'Muhammed Tareq')
    await expect(page.locator('#firstname')).toHaveValue('Muhammed Tareq')
  })

  test('5.4 should be able to enter last name', async () => {
    await page.fill('#surname', 'Aziz')
    await expect(page.locator('#surname')).toHaveValue('Aziz')
  })

  test('5.5 keep relationship null and continue', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page
        .locator('#collector____OTHER____relationshipToChild_error')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
  })

  test('5.6 should be able to enter relationship', async () => {
    await page.fill('#collector____OTHER____relationshipToChild', 'Uncle')
    await expect(
      page.locator('#collector____OTHER____relationshipToChild')
    ).toHaveValue('Uncle')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()
  })

  test('5.7 Should be able to add file and navigate to the payment page', async () => {
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

  test('5.8 Validate fee page', async () => {
    await expect(
      page.getByText('Birth registration before 30 days of date of birth')
    ).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('5.9 Print', async () => {
    await printAndExpectPopup(page)
  })

  test('5.10 Validate Certified -modal', async () => {
    if (!trackingId) {
      throw new Error('Tracking ID is undefined')
    }
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Audit' }).click()
    await page.getByRole('button', { name: 'Certified', exact: true }).click()

    await expect(page.getByText('Type' + 'Birth Certificate')).toBeVisible()
    await expect(
      page.getByText('Requester' + 'Print and issue to someone else')
    ).toBeVisible()
    await expect(page.getByText('Type of ID' + 'National ID')).toBeVisible()
    await expect(page.getByText('National ID' + '1235678922')).toBeVisible()
    await expect(
      page.getByText("Collector's name" + 'Muhammed Tareq Aziz')
    ).toBeVisible()
    await expect(
      page.getByText('Relationship to child' + 'Uncle')
    ).toBeVisible()

    await expect(page.getByText('Signed Affidavit (Optional)')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Signed Affidavit' })
    ).toBeVisible()
    await expect(page.getByText('Verified' + 'No')).toBeVisible()

    await expect(page.getByText('Payment details')).toBeVisible()
    await expect(page.getByText('Fee')).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()
    await expect(page.getByText('Service')).toBeVisible()
    await expect(
      page.getByText('Birth registration before 30 days of date of birth')
    ).toBeVisible()

    await expect(page.getByText('Identity details')).not.toBeVisible()
  })
})
