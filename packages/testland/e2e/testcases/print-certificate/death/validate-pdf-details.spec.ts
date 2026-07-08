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

async function expectInPdf(page: Page, text: string) {
  await expect(page.locator('#print')).toContainText(text)
}

test.describe.serial("Validate 'Death Certificate' PDF details", () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
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
    await selectCertificationType(page, 'Death Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Validate deceased name', async () => {
    await expectInPdf(
      page,
      `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
    )
  })

  test('Validate deceased place of death', async () => {
    await expectInPdf(page, 'Ibombo, Central, Farajaland')
  })

  test('Validate registrar name', async () => {
    await expectInPdf(page, 'Kennedy Mweene')
  })
})

test.describe
  .serial("Validate 'Death Certificate Certified Copy' PDF details", () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
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
    await selectCertificationType(page, 'Death Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Validate deceased name', async () => {
    await expectInPdf(
      page,
      `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
    )
  })

  test('Validate deceased place of death', async () => {
    await expectInPdf(page, 'Ibombo, Central, Farajaland')
  })

  test('Validate registrar name', async () => {
    await expectInPdf(page, 'Registrar: Kennedy Mweene')
  })

  test('Validate spouse name', async () => {
    await expectInPdf(
      page,
      `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
    )
    await expectInPdf(page, 'Spouse')
  })
})
