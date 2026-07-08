import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
import { navigateToWorkqueue } from '../../utils'
test.describe.serial('4. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe.serial('4.1 UI check', async () => {
    test('4.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test.describe('4.1.1 My jurisdiction ', async () => {
      test('4.1.1.0 Verify Province -> District -> Health Facility', async () => {
        await page.getByRole('button', { name: /Central/ }).click()
        await page.getByRole('button', { name: /Ibombo/ }).click()
        await page
          .getByRole('button', { name: /Ibombo District Hospital/ })
          .click()
        await expect(page.locator('#content-name')).toHaveText(
          /Ibombo District Hospital/
        )
        await expect(
          page.getByText('Ibombo, Central', { exact: true })
        ).toBeVisible()
      })
      test('4.1.1.1 Verify Province -> District -> District Office', async () => {
        await navigateToWorkqueue(page, 'Organisation')
        await page.getByRole('button', { name: /Central/ }).click()
        await page
          .getByRole('button', { name: /Central Province Office/ })
          .click()

        await expect(page.locator('#content-name')).toHaveText(
          /Central Province Office/
        )
        await expect(page.getByText('Central', { exact: true })).toBeVisible()
      })
      test('4.1.1.2 Verify team page member list', async () => {
        const members = ['Mitchel Owen', 'Emmanuel Mayuka']

        await verifyMembersClickable(page, members, 'Central Province Office')
      })
    })
    test.describe('4.1.2 Outside of Jurisdiction', async () => {
      test('4.1.2.0 Verify Embassy Official', async () => {
        await navigateToWorkqueue(page, 'Organisation')
        await expect(
          page.getByRole('button', { name: /French Embassy Office/ })
        ).toBeDisabled()
      })
      test('4.1.2.1 Verify Province -> District -> District Office', async () => {
        await navigateToWorkqueue(page, 'Organisation')
        await expect(
          page.getByRole('button', { name: /HQ Office/ })
        ).toBeDisabled()
      })
      test('4.1.2.2 Verify Province -> District', async () => {
        await navigateToWorkqueue(page, 'Organisation')
        await page.getByRole('button', { name: /Pualula/ }).click()

        await expect(
          page.getByRole('button', { name: /Pualula Province Office/ })
        ).toBeDisabled()
      })
    })
  })
})
