import { test, type Page, expect } from '@playwright/test'
import {
  Declaration,
  createDeclaration
} from '../../test-data/birth-declaration'
import { login, getToken } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  navigateToCertificatePrintAction,
  openRecordByTitle,
  selectRequesterType,
  selectCertificationType
} from './helpers'
import { ensureAssignedToUser, selectAction } from '../../../utils'
import { formatV2ChildName } from '../../birth/helpers'

test.describe
  .serial("Validate 'Birth Certificate Certified Copy' PDF details", () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    // Create a declaration with a health facility place of birth
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )

    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await login(page)
  })

  test('Print birth certificate once', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
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
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })

  test('Go to review', async () => {
    await page
      .getByRole('textbox', { name: 'Search for a record' })
      .fill(formatV2ChildName(declaration))

    await page.getByRole('button', { name: 'Search' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await selectAction(page, 'Print')
    await selectCertificationType(page, 'Birth Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText('Klow Village Hospital')
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
})

test.describe.serial("Validate 'Birth Certificate' PDF details", () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    // Create a declaration
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )

    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await login(page)
  })

  test('Go to review', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
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
  })

  test('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText('Klow Village Hospital')
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
})
