import { expect, test, type Page } from '@playwright/test'
import { getToken, login } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../test-data/death-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from './helpers'
import { expectInUrl } from '../../../utils'

test.describe.serial('3.0 Validate "Certify record" page', () => {
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

    await selectCertificationType(page, 'Death Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')

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
      declaration['spouse.nid']
    )
    await expect(page.locator('#maincontent')).toContainText(
      declaration['spouse.name'].firstname +
        ' ' +
        declaration['spouse.name'].surname
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
      'Death registration before 45 days of date of death'
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

  test('3.5 click warning modal confirm button should take to payment page', async () => {
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.locator('#content-name')).toContainText('Collect Payment')
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(
      page,
      `/print-certificate/${eventId}/review?templateId=v2.death-certificate`
    )
    await page.goBack()
    await page.getByRole('button', { name: 'Back' }).click()
  })

  test('3.6 click warning modal cancel button should close the modal', async () => {
    await page.getByRole('button', { name: 'Identity does not match' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.identity.verify`
    )
  })
})
