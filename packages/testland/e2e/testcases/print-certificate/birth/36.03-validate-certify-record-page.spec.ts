import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { getToken, login } from '../../../helpers'
import {
  createDeclaration,
  Declaration
} from '../../test-data/birth-declaration'
import {
  printAndExpectPopup,
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType,
  openRecordByTitle
} from './helpers'
import { ensureAssignedToUser, expectInUrl, type } from '../../../utils'
import { formatV2ChildName } from '../../birth/helpers'

test.describe.serial('3.0 Validate "Certify record" page', () => {
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

  test('3.0.1 Log in', async () => {
    await login(page)
  })

  test('3.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test('3.1 should navigate to Verify their identity page', async () => {
    await expectInUrl(page, `/print-certificate/${eventId}/pages/collector`)

    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')

    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.identity.verify`
    )
  })

  test('3.2 should see informant Id, names, nationality and dob', async () => {
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.identity.verify`
    )

    await expect(page.locator('#content-name')).toContainText(
      'Verify their identity'
    )

    await expect(page.getByText('Verify their identity')).toBeVisible()

    await expect(page.locator('#maincontent')).toContainText(
      declaration['mother.nid']
    )
    await expect(page.locator('#maincontent')).toContainText(
      declaration['mother.name'].firstname +
        ' ' +
        declaration['mother.name'].surname
    )

    await expect(
      page.getByRole('button', { name: 'Identity does not match' })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Verified' })).toBeVisible()
  })

  test('3.3 should navigate to collect payment page on "Verified" button click', async () => {
    await page.getByRole('button', { name: 'Verified' }).click()

    await expect(page.locator('#content-name')).toContainText('Collect Payment')

    await expect(page.locator('#maincontent')).toContainText('Service')
    await expect(page.locator('#maincontent')).toContainText(
      'Birth registration before 30 days of date of birth'
    )
    await expect(page.locator('#maincontent')).toContainText('Fee')
    await expect(page.locator('#maincontent')).toContainText('$5.00')

    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await page.getByRole('button', { name: 'Back' }).click()
  })

  test('3.4 should open warning modal on "Identity does not match" button click', async () => {
    await page.getByRole('button', { name: 'Identity does not match' }).click()
    await expect(page.getByRole('dialog')).toContainText(
      'Print without proof of ID?'
    )
    await expect(page.getByRole('dialog')).toContainText(
      'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector'
    )
  })

  test('3.5 click warning modal cancel button should close the modal', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.identity.verify`
    )
  })

  test('3.6 click warning modal confirm button should take to payment page', async () => {
    await page.getByRole('button', { name: 'Identity does not match' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.locator('#content-name')).toContainText('Collect Payment')
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(
      page,
      `/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
    )
  })

  test('3.7 Print', async () => {
    await printAndExpectPopup(page)
  })

  test('3.8 Validate Certified -modal', async () => {
    if (!trackingId) {
      throw new Error('Tracking ID is undefined')
    }
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Audit' }).click()
    await page.getByRole('button', { name: 'Certified', exact: true }).click()

    const modal = page.getByTestId('event-history-modal')

    await expect(modal.getByText('Type' + 'Birth Certificate')).toBeVisible()
    await expect(
      modal.getByText('Requester' + 'Print and issue to Informant (Mother)')
    ).toBeVisible()
    await expect(modal.getByText('Verified' + 'No')).toBeVisible()

    await expect(modal.getByText('Identity details')).toBeVisible()
    await expect(modal.getByText('Date of birth:')).toBeVisible()
    await expect(
      modal.getByText(`ID Number: ${declaration['mother.nid']}`)
    ).toBeVisible()
    await expect(modal.getByText('Type of ID: National ID')).toBeVisible()

    await expect(
      modal.getByText(
        `Mother's name: ${declaration['mother.name'].firstname} ${declaration['mother.name'].surname}`
      )
    ).toBeVisible()

    await expect(modal.getByText('Nationality: Farajaland')).toBeVisible()

    await expect(modal.getByText('Payment details')).toBeVisible()
    await expect(modal.getByText('Fee: $5.00')).toBeVisible()
    await expect(
      modal.getByText(
        'Service: Birth registration before 30 days of date of birth'
      )
    ).toBeVisible()

    // Expect 5 rows
    await expect(modal.locator('#row_0')).toBeVisible()
    await expect(modal.locator('#row_1')).toBeVisible()
    await expect(modal.locator('#row_2')).toBeVisible()
    await expect(modal.locator('#row_3')).toBeVisible()
    await expect(modal.locator('#row_4')).toBeVisible()
    await expect(modal.locator('#row_5')).not.toBeVisible()
  })
})
