import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
import { navigateToWorkqueue } from '../../utils'
test.describe.serial('1. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('1.1 Basic UI check', async () => {
    test('1.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('1.1.1 Verify Province -> District -> Health Facility', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      await page.getByRole('button', { name: /Klow/ }).click()

      await page.getByRole('button', { name: /Klow Village Hospital/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Klow Village Hospital/
      )
      await expect(
        page.getByText('Klow, Ibombo, Central', { exact: true })
      ).toBeVisible()

      await expect(page.getByText('No result')).toBeHidden()
    })
    test('1.1.2 Verify Province -> District -> Village -> Village Office(No Data)', async () => {
      await navigateToWorkqueue(page, 'Organisation')
      await page.getByRole('button', { name: /Chuminga/ }).click()
      await page.getByRole('button', { name: /Ama/ }).click()
      await page.getByRole('button', { name: /Laini/ }).click()

      await page.getByRole('button', { name: /Laini Village Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Laini Village Office/
      )
      await expect(
        page.getByText('Laini, Ama, Chuminga', { exact: true })
      ).toBeVisible()

      await expect(page.getByText('No result')).toBeVisible()
    })

    test('1.1.2 Verify Province -> District -> District Office', async () => {
      await navigateToWorkqueue(page, 'Organisation')

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()

      await page.getByRole('button', { name: /Ilanga District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Ilanga District Office/
      )
      await expect(
        page.getByText('Ilanga, Sulaka', { exact: true })
      ).toBeVisible()
    })
    test('1.1.3 Verify team page member list', async () => {
      const members = ['Chilufya Tayali', 'Kondwani Mwale']

      await verifyMembersClickable(page, members, 'Ilanga District Office')
    })
  })
})
