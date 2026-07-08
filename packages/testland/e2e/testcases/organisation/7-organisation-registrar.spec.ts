import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
import { navigateToWorkqueue } from '../../utils'
test.describe.serial('7. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('7.1 Basic UI check', async () => {
    test('7.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('7.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      await page.getByRole('button', { name: /Klow/ }).click()

      await expect(
        page.getByRole('button', { name: /Klow Village Hospital/ })
      ).toBeEnabled()
    })
    test('7.1.2 Verify Province -> District -> District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Chuminga/ }).click()
      await page.getByRole('button', { name: /Ama/ }).click()

      await expect(
        page.getByRole('button', { name: /Ama District Office/ })
      ).toBeDisabled()
    })
    test('7.1.3 Verify Province -> District -> Different District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Organisation/ }).click()

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()

      await expect(
        page.getByRole('button', { name: /Ilanga District Office/ })
      ).toBeDisabled()
    })

    test('7.1.4 Verify team page member list of District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()

      const members = ['Felix Katongo', 'Kennedy Mweene']

      await verifyMembersClickable(page, members, 'Ibombo District Office')
    })

    test('7.1.5 Verify Embassy Office', async () => {
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(
        page.getByRole('button', { name: 'French Embassy Office' })
      ).toBeDisabled()
    })
  })
})
