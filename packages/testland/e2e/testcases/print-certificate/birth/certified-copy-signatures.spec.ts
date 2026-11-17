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
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS } from '@e2e/support/constants'
import { getToken } from '@e2e/support/helpers'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import {
  registerViaApi,
  validateViaApi
} from '@e2e/support/test-data/api-actions'
import {
  expectImageToRender,
  openPrintAction,
  printCertificateViaApi,
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'
import {
  createRegistrarWithSignature,
  loginAsNewUser
} from '@e2e/support/team/helpers'

const OFFICE = 'Ibombo District Office'
// The role of a field agent has no electronic signature. A record that a field agent declares therefore has no declarer signature.
const FIELD_AGENT_FULL_NAME = 'Amara Nala'

type SignatureTestId =
  | 'informant-signature'
  | 'declarer-signature'
  | 'registrar-signature'

function signatureImage(page: Page, testId: SignatureTestId) {
  return page.locator(`#print [data-testid="${testId}"]`)
}

async function expectSignatureToRender(page: Page, testId: SignatureTestId) {
  await expect(signatureImage(page, testId)).toHaveCount(1)
  await expectImageToRender(signatureImage(page, testId))
}

async function openCertifiedCopyPreview(
  page: Page,
  declaration: Declaration,
  registrarFullName: string
) {
  await openPrintAction(page, declaration, registrarFullName)
  await selectCertificationType(page, 'Birth Certificate Certified Copy')
  await selectRequesterType(page, 'Print and issue to Informant (Mother)')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Verified' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
}

test("'Birth Certificate Certified Copy' shows the signatures of the informant, the declarer and the certifier", async ({
  page,
  browser
}) => {
  let registrar: Awaited<ReturnType<typeof createRegistrarWithSignature>>
  let declaredByRegistrar: Declaration
  let declaredByFieldAgent: Declaration

  await test.step('Create a registrar with a signature', async () => {
    const adminPage = await browser.newPage()

    registrar = await createRegistrarWithSignature(adminPage, OFFICE)
    await adminPage.close()
  })

  await test.step('Declare and register a birth as the registrar (via API)', async () => {
    const token = await getToken(registrar.username, registrar.password)
    const record = await createDeclaration(token)

    declaredByRegistrar = record.declaration

    await printCertificateViaApi({
      token,
      eventId: record.eventId,
      templateId: 'v2.birth-certificate'
    })
  })

  await test.step('Declare a birth as a field agent and register it as the registrar (via API)', async () => {
    const fieldAgentToken = await getToken(CREDENTIALS.FIELD_AGENT)
    const record = await createDeclaration(
      fieldAgentToken,
      undefined,
      ActionType.DECLARE
    )

    declaredByFieldAgent = record.declaration

    await validateViaApi(
      await getToken(CREDENTIALS.REGISTRATION_OFFICER),
      record.eventId
    )

    const token = await getToken(registrar.username, registrar.password)

    await registerViaApi(token, record.eventId)
    await printCertificateViaApi({
      token,
      eventId: record.eventId,
      templateId: 'v2.birth-certificate'
    })
  })

  await test.step('Log in as the registrar', async () => {
    await loginAsNewUser(page, registrar)
  })

  await test.step('All three signatures show when each signer has a signature', async () => {
    await openCertifiedCopyPreview(
      page,
      declaredByRegistrar,
      registrar.fullName
    )

    await expectSignatureToRender(page, 'informant-signature')
    await expectSignatureToRender(page, 'declarer-signature')
    await expectSignatureToRender(page, 'registrar-signature')

    const informantHref = await signatureImage(
      page,
      'informant-signature'
    ).getAttribute('xlink:href')

    const declarerHref = await signatureImage(
      page,
      'declarer-signature'
    ).getAttribute('xlink:href')

    const certifierHref = await signatureImage(
      page,
      'registrar-signature'
    ).getAttribute('xlink:href')

    expect(certifierHref).toBe(declarerHref)
    expect(informantHref).not.toBe(declarerHref)
    await expect(page.locator('#print')).toContainText(
      `Declared by: ${registrar.fullName}`
    )
  })

  await test.step('The declarer signature is left out when the declarer has no signature', async () => {
    await openCertifiedCopyPreview(
      page,
      declaredByFieldAgent,
      registrar.fullName
    )

    await expect(signatureImage(page, 'declarer-signature')).toHaveCount(0)
    await expect(page.locator('#print')).toContainText(
      `Declared by: ${FIELD_AGENT_FULL_NAME}`
    )

    await expectSignatureToRender(page, 'informant-signature')
    await expectSignatureToRender(page, 'registrar-signature')
  })
})
