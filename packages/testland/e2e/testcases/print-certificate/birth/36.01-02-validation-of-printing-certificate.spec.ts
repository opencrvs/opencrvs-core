import { expect, test, type Page } from '@playwright/test'

import { login, getToken } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../test-data/birth-declaration'
import { navigateToCertificatePrintAction } from './helpers'
import { expectInUrl } from '../../../utils'
import { REQUIRED_VALIDATION_ERROR } from '../../birth/helpers'

test.describe.serial('Print certificate', () => {
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

  test('1.0.1 Log in', async () => {
    await login(page)
  })

  test('1.0.2 Click on "Print certificate" from action menu', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Template type should be selected by default', async () => {
      await expect(
        page.locator('#certificateTemplateId').getByText('Birth Certificate')
      ).toBeVisible()
    })

    test('2.2 Click continue without selecting requester type', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(
        page
          .locator('#collector____requesterId_error')
          .getByText(REQUIRED_VALIDATION_ERROR)
      ).toBeVisible()
    })

    test('2.3 Click continue after selecting requester type and template type', async () => {
      await page.reload()
      await page.locator('#collector____requesterId').click()
      const selectOptionsLabels = [
        'Print and issue to Informant (Mother)',
        'Print and issue to someone else'
      ]
      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }

      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await page.getByRole('button', { name: 'Continue' }).click()
      await expectInUrl(page, '/pages/collector.identity.verify')
    })
  })
})
