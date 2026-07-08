import { test, type Page, expect } from '@playwright/test'
import { login, logout } from '../../helpers'
import { CREDENTIALS , LOGIN_URL } from '../../constants'
import { setMobileViewport } from '../../mobile-helpers'

test.describe('Desktop', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Logging in twice in a row', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await logout(page)

    const url = new URL(page.url())

    await page.waitForURL((url) => {
      return url.origin === LOGIN_URL
    })

    const redirectTo = url.searchParams.get('redirectTo')
    expect(redirectTo).toBe(null)
    const lang = url.searchParams.get('lang')
    expect(lang).toBe('en')

    await login(page, CREDENTIALS.REGISTRAR, true)

    // Crashed previously due bad redirect value
    await expect(page.getByText('Farajaland CRS')).toBeVisible()
  })
})

test.describe('Mobile', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await setMobileViewport(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Logging in twice in a row', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await logout(page)

    await page.waitForURL((url) => {
      return url.origin === LOGIN_URL
    })

    const url = new URL(page.url())
    const redirectTo = url.searchParams.get('redirectTo')
    expect(redirectTo).toBe(null)
    const lang = url.searchParams.get('lang')
    expect(lang).toBe('en')

    await await login(page, CREDENTIALS.REGISTRAR, true)

    // Crashed previously due bad redirect value.
    await expect(
      page.getByRole('heading', { name: 'Assigned to you' })
    ).toBeVisible()
  })
})
