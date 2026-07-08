import { test, type Page, expect } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe('Side menu navigation', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Check Registrar navigation items', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    const expectedWorkqueues = [
      'Drafts',
      'Assigned to you',
      'Recent',
      'Notifications',
      'Potential duplicate',
      'Pending updates',
      'Pending approval',
      'Pending registration',
      'Escalated',
      'Pending external validation',
      'Pending certification',
      'Pending issuance'
    ]

    // All workqueues are present on home page.
    for (const item of expectedWorkqueues) {
      page.getByRole('button', { name: item })
    }

    const expectedItemsWithFrame = ['Organisation', 'Team']

    const expectedItemsWithoutFrame = [
      'Registrations Dashboard',
      'Completeness Dashboard',
      'Registry'
    ]

    for (const item of expectedItemsWithFrame) {
      await page.getByRole('button', { name: item }).click()

      // All workqueues are present on each page.
      for (const item of expectedWorkqueues) {
        await page.getByRole('button', { name: item })
      }

      // All workqueues are present on each page.
      for (const item of expectedItemsWithoutFrame) {
        await page.getByRole('button', { name: item })
      }
    }

    for (const item of expectedItemsWithoutFrame) {
      await page.getByRole('button', { name: item }).click()
      await expect(page.locator('Farajaland CRS')).toBeHidden()

      // Only one button available (X)
      await page.locator('#page-title').getByRole('button').click()
    }
  })

  test('Check Registration Officer navigation items', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    const expectedWorkqueues = [
      'Drafts',
      'Assigned to you',
      'Recent',
      'Notifications',
      'Pending validation',
      'Pending updates',
      'Pending approval',
      'Escalated',
      'Pending external validation',
      'Pending certification',
      'Pending issuance'
    ]

    // All workqueues are present on home page.
    for (const item of expectedWorkqueues) {
      page.getByRole('button', { name: item })
    }

    const expectedItemsWithFrame = ['Organisation', 'Team']

    const expectedItemsWithoutFrame = [
      'Registrations Dashboard',
      'Completeness Dashboard',
      'Registry'
    ]

    for (const item of expectedItemsWithFrame) {
      await page.getByText(item).click()

      // All workqueues are present on each page. V1 have different workqueues, so we should notice.
      for (const item of expectedWorkqueues) {
        page.getByText(item)
      }
      // All workqueues are present on each page. V1 have different workqueues, so we should notice.
      for (const item of expectedItemsWithoutFrame) {
        page.getByText(item)
      }
    }

    for (const item of expectedItemsWithoutFrame) {
      await page.getByText(item).click()
      await expect(page.locator('Farajaland CRS')).toBeHidden()

      // Only one button available (X)
      await page.locator('#page-title').getByRole('button').click()
    }
  })

  test('Check National System Admin navigation items', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

    const nationalSystemAdminNavItemsWithFrame = ['Organisation', 'Team']

    const nationalSystemAdminNavItemsWithoutFrame = [
      'Registrations Dashboard',
      'Completeness Dashboard',
      'Registry'
    ]

    // Should not have any workqueues, check that none of the workqueues are present
    const registrationAgentWorkqueues = [
      'Outbox',
      'Drafts',
      'Assigned to you',
      'Recent',
      'Notifications',
      'Pending validation',
      'Pending updates',
      'Pending approval',
      'Escalated',
      'Pending external validation',
      'Pending certification',
      'Pending issuance'
    ]

    const nationalSystemAdminNestedNavItemsWithFrame = [
      ['Communications', 'Email all users'],
      ['Configuration', 'Integrations']
    ]

    for (const item of nationalSystemAdminNavItemsWithFrame) {
      await page.getByRole('button', { name: item }).click()

      for (const item of registrationAgentWorkqueues) {
        await expect(page.getByRole('button', { name: item })).not.toBeVisible()
      }

      for (const items of nationalSystemAdminNestedNavItemsWithFrame) {
        page.getByRole('button', { name: items[0] })
        await expect(page.locator(items[1])).toBeHidden()
      }

      for (const item of nationalSystemAdminNavItemsWithoutFrame) {
        page.getByRole('button', { name: item })
      }
    }

    for (const items of nationalSystemAdminNestedNavItemsWithFrame) {
      await expect(page.locator(items[1])).toBeHidden()

      await page.getByRole('button', { name: items[0] }).click()

      await page.getByRole('button', { name: items[1] }).click()
    }

    for (const item of nationalSystemAdminNavItemsWithoutFrame) {
      await page.getByRole('button', { name: item }).click()
      await expect(page.locator('Farajaland CRS')).toBeHidden()

      // Only one button available (X)
      await page.locator('#page-title').getByRole('button').click()
    }
  })
})
