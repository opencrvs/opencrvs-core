import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'

test.describe.serial('Death form - date validations', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await login(page)
  })

  test('Start death event declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Input valid deceased date-of-birth', async () => {
    await page.getByPlaceholder('dd').fill('22')
    await page.getByPlaceholder('mm').fill('09')
    await page.getByPlaceholder('yyyy').fill('1993')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#deceased____dob_error')).not.toBeVisible()
  })

  test('Navigate to event details section', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Input date-of-death which is before date-of-birth, expect to see validation error', async () => {
    await page.getByPlaceholder('dd').fill('09')
    await page.getByPlaceholder('mm').fill('10')
    await page.getByPlaceholder('yyyy').fill('1990')

    await page.getByPlaceholder('yyyy').blur()

    await expect(
      page.getByText("Date of death must be after the deceased's birth date")
    ).toBeVisible()
  })

  test('Input date-of-death which is after date-of-birth, expect to see no validation error', async () => {
    await page.getByPlaceholder('dd').fill('09')
    await page.getByPlaceholder('mm').fill('10')
    await page.getByPlaceholder('yyyy').fill('1995')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#eventDetails____date_error')).not.toBeVisible()
  })

  test('Go back to deceased details section', async () => {
    await page.getByRole('button', { name: 'Back' }).click()
  })

  test('Input invalid deceased date-of-birth, expect to see validation error', async () => {
    await page.getByPlaceholder('dd').fill('22')
    await page.getByPlaceholder('mm').fill('09')
    await page.getByPlaceholder('yyyy').fill('1996')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#deceased____dob_error')).toHaveText(
      'Date of birth must be before the date of death'
    )
  })

  test('Input valid deceased date-of-birth, expect to see no validation error', async () => {
    await page.getByPlaceholder('dd').fill('22')
    await page.getByPlaceholder('mm').fill('10')
    await page.getByPlaceholder('yyyy').fill('1988')

    await page.getByPlaceholder('yyyy').blur()

    await expect(page.locator('#deceased____dob_error')).not.toBeVisible()
  })
})
