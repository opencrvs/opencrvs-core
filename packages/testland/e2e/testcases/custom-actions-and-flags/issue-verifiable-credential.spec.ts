import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '../../utils'
import {
  createDeclaration,
  getDeclaration,
  type Declaration
} from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'
import {
  selectCertificationType,
  selectRequesterType
} from '../print-certificate/birth/helpers'

test.describe.serial('Issue verifiable credential', () => {
  let page: Page
  let motherInformantDeclaration: Declaration
  let motherInformantChildName: string
  let nonParentInformantDeclaration: Declaration
  let nonParentInformantChildName: string

  async function openIssueVerifiableCredentialAction() {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page
      .locator('#action-Dropdown-Content')
      .getByText('Issue a verifiable credential', { exact: true })
      .click()
  }

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const motherInformantRes = await createDeclaration(token)
    motherInformantDeclaration = motherInformantRes.declaration
    motherInformantChildName = formatV2ChildName(motherInformantDeclaration)

    const nonParentInformantDec = await getDeclaration({
      token,
      informantRelation: 'BROTHER'
    })

    const nonParentInformantRes = await createDeclaration(
      token,
      nonParentInformantDec
    )
    nonParentInformantDeclaration = nonParentInformantRes.declaration
    nonParentInformantChildName = formatV2ChildName(
      nonParentInformantDeclaration
    )

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('Log in and navigate to mother informant record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await searchFromSearchBar(page, motherInformantChildName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  test('Requester dropdown spec: mother informant only shows mother (and father if available)', async () => {
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

  test('Requester dropdown spec: non-parent informant shows available parent(s) plus informant relation', async () => {
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

  test('Show verifiable credential QR code in Birth Certificate', async () => {
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
