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
import { test, expect, type Page } from '@playwright/test'
import { getToken, login } from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import {
  navigateToCertificatePrintAction,
  openRecordByTitle,
  printCertificateViaApi,
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

const COLLECTOR = 'Print and issue to Informant (Mother)'
const PRINT_IN_ADVANCE = 'Print in advance of issuance'

function signature(page: Page) {
  return page.locator('#print [data-testid="registrar-signature"]')
}

async function reopenPrintAction(page: Page, declaration: Declaration) {
  await page.goto(CLIENT_URL)
  await page
    .getByRole('textbox', { name: 'Search for a record' })
    .fill(formatV2ChildName(declaration))

  await page.getByRole('button', { name: 'Search' }).click()
  await openRecordByTitle(page, formatV2ChildName(declaration))
  await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  await selectAction(page, 'Print')
}

test.describe('Certificates printed in advance of issuance carry no signature', () => {
  test("'Birth Certificate' carries the signature only when issued to a collector", async ({
    page
  }) => {
    let declaration: Declaration

    await test.step('Seed a registered birth record (via API)', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)

      declaration = (await createDeclaration(token)).declaration
    })

    await test.step('Log in as the registrar', async () => {
      await login(page)
    })

    await test.step('Issued to a collector, the signature is there', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        declaration,
        CREDENTIALS.REGISTRAR
      )
      await selectCertificationType(page, 'Birth Certificate')
      await selectRequesterType(page, COLLECTOR)
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(signature(page)).toHaveCount(1)
    })

    await test.step('Printed in advance, the signature is gone', async () => {
      await reopenPrintAction(page, declaration)
      await selectCertificationType(page, 'Birth Certificate')
      await selectRequesterType(page, PRINT_IN_ADVANCE)
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(signature(page)).toHaveCount(0)
    })
  })

  test("'Birth Certificate Certified Copy' carries the signature only when issued to a collector", async ({
    page
  }) => {
    let declaration: Declaration

    await test.step('Seed a birth record that has been printed once (via API)', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const record = await createDeclaration(token)

      declaration = record.declaration

      // The certified copy is only offered once the standard certificate has
      // been printed.
      await printCertificateViaApi({
        token,
        eventId: record.eventId,
        templateId: 'v2.birth-certificate'
      })
    })

    await test.step('Log in as the registrar', async () => {
      await login(page)
    })

    await test.step('Issued to a collector, the signature is there', async () => {
      await reopenPrintAction(page, declaration)
      await selectCertificationType(page, 'Birth Certificate Certified Copy')
      await selectRequesterType(page, COLLECTOR)
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(signature(page)).toHaveCount(1)
    })

    await test.step('Printed in advance, the signature is gone', async () => {
      await reopenPrintAction(page, declaration)
      await selectCertificationType(page, 'Birth Certificate Certified Copy')
      await selectRequesterType(page, PRINT_IN_ADVANCE)
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(signature(page)).toHaveCount(0)
    })
  })
})
