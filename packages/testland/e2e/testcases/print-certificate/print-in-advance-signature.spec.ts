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
import { getToken } from '@e2e/support/helpers'
import { CLIENT_URL } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import {
  openRecordByTitle,
  printCertificateViaApi,
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'
import {
  createRegistrarWithSignature,
  loginAsNewUser
} from '@e2e/support/team/helpers'
import { ensureAssignedToFullName, selectAction } from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

const OFFICE = 'Ibombo District Office'
const COLLECTOR = 'Print and issue to Informant (Mother)'
const PRINT_IN_ADVANCE = 'Print in advance of issuance'

function signature(page: Page) {
  return page.locator('#print [data-testid="registrar-signature"]')
}

async function expectSignatureToRender(page: Page) {
  const href = await signature(page).getAttribute('xlink:href')

  const contentType = await page.evaluate(async (url) => {
    const response = await fetch(url!)
    return response.headers.get('content-type')
  }, href)

  expect(contentType).toMatch(/^image\//)
}

async function openPrintAction(
  page: Page,
  declaration: Declaration,
  registrarFullName: string
) {
  await page.goto(CLIENT_URL)
  await page
    .getByRole('textbox', { name: 'Search for a record' })
    .fill(formatV2ChildName(declaration))

  await page.getByRole('button', { name: 'Search' }).click()
  await openRecordByTitle(page, formatV2ChildName(declaration))
  await ensureAssignedToFullName(page, registrarFullName)
  await selectAction(page, 'Print')
}

test.describe('Certificates printed in advance of issuance carry no signature', () => {
  let registrar: { username: string; password: string; fullName: string }
  let registrarToken: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()

    registrar = await createRegistrarWithSignature(page, OFFICE)
    registrarToken = await getToken(registrar.username, registrar.password)

    await page.close()
  })

  test("'Birth Certificate' carries the signature only when issued to a collector", async ({
    page
  }) => {
    let declaration: Declaration

    await test.step('Register a birth record as new registrar (via API)', async () => {
      declaration = (await createDeclaration(registrarToken)).declaration
    })
    await test.step('Log in as that registrar', async () => {
      await loginAsNewUser(page, registrar)
    })

    await test.step('Issued to a collector, the signature is there', async () => {
      await openPrintAction(page, declaration, registrar.fullName)
      await selectCertificationType(page, 'Birth Certificate')
      await selectRequesterType(page, COLLECTOR)
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(signature(page)).toHaveCount(1)
      await expectSignatureToRender(page)
    })

    await test.step('Printed in advance, the signature is gone', async () => {
      await openPrintAction(page, declaration, registrar.fullName)
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

    await test.step('Register and print a birth record as new registrar (via API)', async () => {
      const record = await createDeclaration(registrarToken)

      declaration = record.declaration

      // The certified copy is only offered once the standard certificate has
      // been printed.
      await printCertificateViaApi({
        token: registrarToken,
        eventId: record.eventId,
        templateId: 'v2.birth-certificate'
      })
    })

    await test.step('Log in as that registrar', async () => {
      await loginAsNewUser(page, registrar)
    })

    await test.step('Issued to a collector, the signature is there', async () => {
      await openPrintAction(page, declaration, registrar.fullName)
      await selectCertificationType(page, 'Birth Certificate Certified Copy')
      await selectRequesterType(page, COLLECTOR)
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(signature(page)).toHaveCount(1)
      await expectSignatureToRender(page)
    })

    await test.step('Printed in advance, the signature is gone', async () => {
      await openPrintAction(page, declaration, registrar.fullName)
      await selectCertificationType(page, 'Birth Certificate Certified Copy')
      await selectRequesterType(page, PRINT_IN_ADVANCE)
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(signature(page)).toHaveCount(0)
    })
  })
})
