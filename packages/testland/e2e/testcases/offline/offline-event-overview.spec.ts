import { expect, Page, test } from '@playwright/test'

import { ActionType } from '@opencrvs/toolkit/events'
import { getToken, login } from '../../helpers'
import { mockNetworkConditions } from '../../mock-network-conditions'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { CREDENTIALS } from '../../constants'
import { formatV2ChildName } from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test.describe.serial('Can view non-downloaded event online', () => {
  let page: Page
  let declaration: Declaration
  let childName: string
  let trackingId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
    trackingId = res.trackingId!
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  test('Open the event overview page', async () => {
    await openRecordByTitle(page, childName)
  })

  test('Verify user can only see non-secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).not.toHaveText(
      'mothers@email.com'
    )
  })

  test('Verify that user can see details on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('row-value-child.name')).toHaveText(childName)
  })
})

test.describe.serial('Can partially view non-downloaded event offline', () => {
  let page: Page
  let declaration: Declaration
  let childName: string
  let trackingId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
    trackingId = res.trackingId!
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  test('Go offline', async () => {
    await mockNetworkConditions(page, 'offline')
  })

  test('Open the event overview page', async () => {
    await openRecordByTitle(page, childName)
  })

  test('Verify user can only see non-secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).not.toHaveText(
      'mothers@email.com'
    )
  })

  test('Verify user sees offline message on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('record-offline-message')).toBeVisible()
    await expect(page.getByTestId('row-value-child.name')).not.toBeVisible()
  })
})

test.describe.serial('Can view downloaded event offline', () => {
  let page: Page
  let declaration: Declaration
  let childName: string
  let trackingId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
    trackingId = res.trackingId!
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  test('Download record', async () => {
    const row = page.getByTestId('row-item').filter({ hasText: childName })

    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .click()

    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    await expect(row.getByLabel('User avatar')).toBeVisible({ timeout: 20000 })
  })

  test('Go offline', async () => {
    await mockNetworkConditions(page, 'offline')
  })

  test('Open the event overview page', async () => {
    await openRecordByTitle(page, childName)
  })

  test('Verify that user can see secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).toHaveText(
      'mothers@email.com'
    )
  })

  test('Verify that user can see details on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('row-value-child.name')).toHaveText(childName)
  })
})

test('Spinner switches to offline icon when network drops mid-assign', async ({
  browser
}) => {
  const page = await browser.newPage()
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const { declaration } = await createDeclaration(
    token,
    undefined,
    ActionType.DECLARE
  )
  const childName = formatV2ChildName(declaration)

  await test.step('Login and open the workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  await test.step('Spinner swaps to offline icon on network drop', async () => {
    await page.route(/event\.actions\.assignment\.assign/, () => {
      // Intentionally never resolve.
    })

    const row = page.getByTestId('row-item').filter({ hasText: childName })

    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .click()
    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    // Spinner appears while the assign mutation is pending.
    await expect(row.getByTestId('download-loading-icon')).toBeVisible()

    // Go offline
    await mockNetworkConditions(page, 'offline')

    await expect(row.getByTestId('no-connection-icon')).toBeVisible()
    await expect(row.getByTestId('download-loading-icon')).not.toBeVisible()

    await page.unroute(/event\.actions\.assignment\.assign/)
  })
})
