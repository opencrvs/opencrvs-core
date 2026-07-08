import { expect, test, type Page } from '@playwright/test'

import { login, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'

import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '../print-certificate/birth/helpers'
import { expectInUrl } from '../../utils'

test.describe.serial('Navigating in and out of action', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string
  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    eventId = res.eventId
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page)
  })

  test('Navigate to "Pending certification" -workqueue', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
  })

  test('Navigate successfully through the print certificate action flow', async () => {
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
    await page.waitForURL(/\/review/)
    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
    )
  })

  test('Browser back and forward actions work correctly inside the action flow', async () => {
    await page.goBack()
    await page.goBack()
    await page.goForward()
    await page.goBack()
    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/pages/collector.identity.verify`
    )
    await page.goForward()
    await page.goForward()
    await page.waitForURL(/\/review/)
    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
    )
  })

  test('After finishing action flow, user should be redirected to the event overview page', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()

    // Wait for PDF the load and the page to be redirected to the overview page
    await page.waitForURL(`**/workqueue/pending-certification`)
    await expectInUrl(page, `/workqueue/pending-certification`)
  })

  test('Browser back button should take user to the front page instead of action flow', async () => {
    await page.goBack()
    await expect(page.locator('#content-name')).toContainText(
      'Pending certification'
    )
  })

  test('Browser forward button should take user back to the event overview page', async () => {
    await page.goForward()
    await expectInUrl(
      page,
      `/events/${eventId}?backTo=/workqueue/pending-certification`
    )
  })
})
