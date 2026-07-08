import { test, type Page } from '@playwright/test'

import { login, getToken, formatName } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'

import {
  selectCertificationType,
  selectRequesterType
} from '../print-certificate/birth/helpers'
import { expectInUrl, selectAction } from '../../utils'
import { ActionType } from '@opencrvs/toolkit/events'

test.describe.skip('Navigating in and out of action', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string
  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
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

  test('Navigate to the "Pending registration" -workqueue', async () => {
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  test("Enter the 'Review' -action from workqueue", async () => {
    const childName = formatName({
      firstNames: declaration['child.name'].firstname,
      familyName: declaration['child.name'].surname
    })

    const row = page.locator('div', { hasText: childName }).first()

    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .first()
      .click()

    await row
      .getByRole('button', { name: 'Review', exact: true })
      .first()
      .click()
  })

  test('Register the event', async () => {
    await selectAction(page, 'Register')
    await page.getByRole('button', { name: 'Confirm' }).click()

    await page.waitForURL(`**/workqueue/pending-registration`)
    await expectInUrl(page, '/workqueue/pending-registration')
  })

  test('Browser back button should take user back to the event overview page "Record" -tab', async () => {
    await page.goBack()
    await expectInUrl(
      page,
      `/events/${eventId}/record?backTo=/workqueue/pending-registration`
    )
  })

  test('Navigate to the "Pending certification" -workqueue', async () => {
    await page.getByTestId('exit-event').click()
    await page.getByRole('button', { name: 'Pending certification' }).click()
  })

  test("Enter the 'Print' -action from workqueue", async () => {
    const childName = formatName({
      firstNames: declaration['child.name'].firstname,
      familyName: declaration['child.name'].surname
    })
    // Locate the row with correct name
    const row = page.locator('div', { hasText: childName }).first()

    // Click the "Assign record" button inside that row
    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .first()
      .click()

    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    // Click the "Print" button inside that row
    await row
      .getByRole('button', { name: 'Print', exact: true })
      .first()
      .click()
  })

  test('Navigate successfully through the print certificate action flow', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForURL(/\/review/)
    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/review?templateId=v2.birth-certificate&backTo=/workqueue/pending-certification`
    )
  })

  test('After finishing action flow, user should be redirected back to the workqueue', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()

    await page.waitForURL(`**/workqueue/pending-certification`)
    await expectInUrl(page, '/workqueue/pending-certification')
  })

  test('Browser back button should take user to the "In review all" workqueue instead of action flow', async () => {
    await page.goBack()
    await page.waitForURL(`**/workqueue/in-review-all`)
    await expectInUrl(page, `/workqueue/in-review-all`)
  })

  test('Browser forward button should take user back to the workqueue', async () => {
    await page.goForward()
    await page.waitForURL(`**/workqueue/pending-certification`)
    await expectInUrl(page, `/workqueue/pending-certification`)
  })
})
