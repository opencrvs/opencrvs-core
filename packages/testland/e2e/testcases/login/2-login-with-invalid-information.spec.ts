import { test, expect } from '@playwright/test'
import { CREDENTIALS, LOGIN_URL, TEST_USER_PASSWORD } from '../../constants'
import { ensureLoginPageReady } from '../../helpers'

test.describe('2. Login with invalid information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    await ensureLoginPageReady(page)
  })

  test('2.1. Navigate to the login URL', async ({ page }) => {
    // Expected result: User should be redirected to the login page
    await expect(page.getByText('Login to Farajaland CRVS')).toBeVisible()
  })

  test('2.2. Enter invalid username and valid password', async ({ page }) => {
    await page.fill('#username', 'j.kimmich')
    await page.fill('#password', TEST_USER_PASSWORD)
    await page.getByText('Login', { exact: true }).click()

    // Expected result: Should show toast saying: Incorrect username or password
    await expect(page.getByText('Incorrect username or password')).toBeVisible()
  })

  test('2.3. Enter valid username and invalid password', async ({ page }) => {
    await page.fill('#username', CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.fill('#password', 'tests')
    await page.getByText('Login', { exact: true }).click()

    // Expected result: Should show toast saying: Incorrect username or password
    await expect(page.getByText('Incorrect username or password')).toBeVisible()
  })

  test('2.4. Enter expired 2fa code', async ({ page }) => {
    await page.fill('#username', CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.fill('#password', TEST_USER_PASSWORD)
    await page.getByText('Login', { exact: true }).click()

    // Expected result: User should be redirected to the next page to verify through mobile number or email address
    await expect(page.getByText('Verify your account')).toBeVisible()

    await page.fill('#code', 'Expire')
    await page.getByText('Verify', { exact: true }).click()

    // Expected result: Should show toast saying: Incorrect verification code
    await expect(page.getByText('Incorrect verification code.')).toBeVisible()
  })
})
