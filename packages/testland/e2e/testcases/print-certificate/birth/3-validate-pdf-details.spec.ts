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

test.describe('Residential place of birth renders every administrative level', () => {
  const EXPECTED_PLACE_OF_BIRTH = 'Klow, Ibombo, Central, Farajaland'

  test('Village level survives on both birth certificate templates', async ({
    page
  }) => {
    test.setTimeout(180_000)

    let declaration: Declaration

    await test.step('Seed a registered birth record with a residential place of birth (via API)', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(
        token,
        undefined,
        undefined,
        'PRIVATE_HOME'
      )

      declaration = res.declaration
    })

    await test.step('Log in as the registrar', async () => {
      await login(page)
    })

    await test.step("'Birth Certificate' keeps the village level", async () => {
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

      await expect(page.locator('#print')).toContainText(
        EXPECTED_PLACE_OF_BIRTH
      )

      await page.getByRole('button', { name: 'Yes, print certificate' }).click()
      await page.getByRole('button', { name: 'Print', exact: true }).click()
    })

    await test.step("'Birth Certificate Certified Copy' keeps the village level", async () => {
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

      await expect(page.locator('#print')).toContainText(
        EXPECTED_PLACE_OF_BIRTH
      )
    })
  })
})
