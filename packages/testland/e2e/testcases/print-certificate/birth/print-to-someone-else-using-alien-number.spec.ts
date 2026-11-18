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
import { ensureAssignedToUser, type } from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

async function selectIdType(page: Page, idType: string) {
  await page.locator('#collector____OTHER____idType').click()
  await page.getByText(idType, { exact: true }).click()
}

test('Print to someone else using Alien Number as ID type', async ({
  page
}) => {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const res = await createDeclaration(token)
  const declaration = res.declaration
  const trackingId = res.trackingId

  await test.step('Log in', async () => {
    await login(page)
  })

  await test.step('Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  await test.step('Fill details, including Alien Number', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to someone else')

    await selectIdType(page, 'Alien Number')
    await page.fill('#collector____ALIEN-NUMBER____details', '1234567')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()

    await page.fill('#firstname', 'Muhammed Tareq')
    await page.fill('#surname', 'Aziz')
    await page.fill('#collector____OTHER____relationshipToChild', 'Uncle')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Print', async () => {
    await printAndExpectPopup(page)
  })

  await test.step('Validate Certified -modal', async () => {
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
    await expect(page.getByText('Type of ID' + 'Alien Number')).toBeVisible()
    await expect(page.getByText('Alien Number' + '1234567')).toBeVisible()
    await expect(
      page.getByText("Collector's name" + 'Muhammed Tareq Aziz')
    ).toBeVisible()
    await expect(
      page.getByText('Relationship to child' + 'Uncle')
    ).toBeVisible()

    await expect(page.getByText('Payment details')).toBeVisible()
    await expect(page.getByText('Fee')).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()
  })
})
