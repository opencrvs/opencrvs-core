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
import { expect, test } from '@playwright/test'
import { CREDENTIALS } from '@e2e/support/constants'
import { getToken, login, searchFromSearchBar } from '@e2e/support/helpers'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '@e2e/support/utils'
import {
  createDeclaration,
  getDeclaration,
  type Declaration
} from '@e2e/support/test-data/birth-declaration'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import {
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'

test('Issue verifiable credential', async ({ page }) => {
  test.setTimeout(180_000)

  async function openIssueVerifiableCredentialAction() {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page
      .locator('#action-Dropdown-Content')
      .getByText('Issue a verifiable credential', { exact: true })
      .click()
  }
  const token = await getToken(CREDENTIALS.REGISTRAR)

  const motherInformantRes = await createDeclaration(token)
  const motherInformantDeclaration = motherInformantRes.declaration
  const motherInformantChildName = formatV2ChildName(motherInformantDeclaration)

  const nonParentInformantDec = await getDeclaration({
    token,
    informantRelation: 'BROTHER'
  })

  const nonParentInformantRes = await createDeclaration(
    token,
    nonParentInformantDec
  )
  const nonParentInformantDeclaration = nonParentInformantRes.declaration
  const nonParentInformantChildName = formatV2ChildName(
    nonParentInformantDeclaration
  )

  await test.step('Log in and navigate to mother informant record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await searchFromSearchBar(page, motherInformantChildName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Requester dropdown spec: mother informant only shows mother (and father if available)', async () => {
    await openIssueVerifiableCredentialAction()

    await page.locator('#requester____type').click()

    await expect(page.getByText('Mother', { exact: true })).toBeVisible()
    await expect(page.getByText('Father', { exact: true })).toHaveCount(0)
    await expect(
      page.getByText('Brother (informant)', { exact: true })
    ).toHaveCount(0)

    await page.getByText('Mother', { exact: true }).click()
    await page.getByRole('button', { name: 'Generate', exact: true }).click()

    const actionQrCode = page.getByRole('dialog').locator('img')
    await expect(actionQrCode).toBeVisible()
    await expect(actionQrCode).toHaveAttribute(
      'src',
      /^data:image\/png;base64,/
    )

    const acceptedOfferCheckbox = page.locator('#requester____acceptedVcOffer')
    await expect(acceptedOfferCheckbox).toBeVisible()

    const confirmButton = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmButton).toBeDisabled()

    await acceptedOfferCheckbox.check()
    await expect(confirmButton).toBeEnabled()

    const verifiableCredentialResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await confirmButton.click()
    await verifiableCredentialResponse
  })

  await test.step('Requester dropdown spec: non-parent informant shows available parent(s) plus informant relation', async () => {
    await navigateToWorkqueue(page, 'Pending certification')
    await searchFromSearchBar(page, nonParentInformantChildName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await openIssueVerifiableCredentialAction()

    await page.locator('#requester____type').click()

    await expect(page.getByText('Mother', { exact: true })).toBeVisible()
    await expect(page.getByText('Father', { exact: true })).toHaveCount(0)
    await expect(
      page.getByText('Brother (informant)', { exact: true })
    ).toBeVisible()

    await page.getByText('Brother (informant)', { exact: true }).click()
    await page.getByRole('button', { name: 'Generate', exact: true }).click()

    const actionQrCode = page.getByRole('dialog').locator('img')
    await expect(actionQrCode).toBeVisible()
    await expect(actionQrCode).toHaveAttribute(
      'src',
      /^data:image\/png;base64,/
    )

    const acceptedOfferCheckbox = page.locator('#requester____acceptedVcOffer')
    await expect(acceptedOfferCheckbox).toBeVisible()
    await acceptedOfferCheckbox.check()

    const verifiableCredentialResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await page.getByRole('button', { name: 'Confirm' }).click()
    await verifiableCredentialResponse
  })

  await test.step('Show verifiable credential QR code in Birth Certificate', async () => {
    await navigateToWorkqueue(page, 'Pending certification')
    await searchFromSearchBar(page, motherInformantChildName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await selectAction(page, 'Print')
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()

    // known UX issue:
    // there is a background HTTP call to create the verifiable credential. We need to wait for it to succeed.
    await page.waitForResponse(
      (response) =>
        response.url().includes('/verifiable-credentials/paper-credential') &&
        response.status() === 200
    )

    await page.getByRole('button', { name: 'Continue' }).click()

    const certificateQrCode = page.locator(
      '#print image[data-testid="verifiable-credential-qr-code"]'
    )
    await expect(certificateQrCode).toBeVisible()

    const qrValue = await certificateQrCode.evaluate((element) => {
      return (
        element.getAttribute('href') || element.getAttribute('xlink:href') || ''
      )
    })

    expect(qrValue).toMatch(/^data:image\/png;base64,/)
  })
})
