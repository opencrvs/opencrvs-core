import { expect, test, type Page } from '@playwright/test'
import { login } from '../../helpers'

test.describe.serial('Advanced Search - Birth Event Declaration', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('0.1 - Validate navigating to advanced search', async () => {
    await login(page)

    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await expect(
      page.getByText('Select the options to build an advanced search.')
    ).toBeVisible()
  })

  test('0.3 - Validate display child details when selecting Birth', async () => {
    await page.getByText('Birth').click()
    await expect(page.getByText('Child details')).toBeVisible()
  })

  test('0.4 - Validate Search button disabled when form is incomplete', async () => {
    const searchButton = page.locator('#search')
    await expect(searchButton).toBeDisabled()
  })
})
