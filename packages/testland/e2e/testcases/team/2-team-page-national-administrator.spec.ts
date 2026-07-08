import { expect, test } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import {
  continueForm,
  continueUntilReview,
  drawSignature,
  login
} from '../../helpers'
import { expectInUrl } from '../../utils'

test('Basic UI check', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('Verify UI', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    await page.getByRole('button', { name: 'Team' }).click()
    await expect(page.locator('#content-name')).toHaveText('HQ Office')
  })

  await test.step('Verify Team Members Status', async () => {
    const row1 = page.getByRole('row', { name: /Mutale Musonda/ })
    await expect(row1.getByText('Active')).toBeVisible()
    const row2 = page.getByRole('row', { name: /Chipo Lungu/ })
    await expect(row2.getByText('Active')).toBeVisible()
    const row3 = page.getByRole('row', { name: /Jonathan Campbell/ })
    await expect(row3.getByText('Active')).toBeVisible()
  })

  await test.step('should be able to only find locations with location picker, not administrative areas', async () => {
    await page.getByRole('button', { name: 'HQ Office' }).click()
    await page.getByTestId('locationSearchInput').fill('Aman')

    await expect(
      page.getByText('Amani Village Office, Amani, Irundu, Sulaka', {
        exact: true
      })
    ).toBeVisible()

    await expect(
      page.getByText('Amani, Irundu, Sulaka', { exact: true })
    ).not.toBeVisible()
  })
})

test('User Account Actions', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('Login and navigate to edit details page', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    await page.getByRole('button', { name: 'Team' }).click()
    await page.locator('//nav[@id="user-item-0-menu-dropdownMenu"]').click()
    await page
      .locator('//ul[@id="user-item-0-menu-Dropdown-Content"]')
      .getByText('Edit details')
      .click()
    await expect(page.getByText('Confirm details')).toBeVisible()
  })

  await test.step('Edit User Details', async () => {
    await expect(
      page
        .getByTestId('accordion-Accordion_user.office')
        .filter({ hasText: 'Registration Office' })
    ).toBeVisible()
  })

  let phoneNumber: string

  await test.step('Change Phone Number', async () => {
    phoneNumber = '0785963' + (Math.floor(Math.random() * 900) + 100)
    await page.getByTestId('change-button-phoneNumber').click()
    await page.locator('input[name="phoneNumber"]').fill(phoneNumber)
    await continueForm(page)
  })

  await test.step('Add signature', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'signature_canvas_element', false)
    await page.getByRole('button', { name: 'Apply' }).click()
  })

  await test.step('Submit the form', async () => {
    await continueUntilReview(page)
    await page.getByRole('button', { name: 'Confirm' }).click()
    expectInUrl(page, 'view')
  })

  await test.step('Verify Phone Number Changed', async () => {
    await page
      .locator('#sub-page-header-munu-button-dropdownMenu')
      .getByRole('button')
      .click()
    await page.getByText('Edit details').click()
    await expect(page.getByText('Confirm details')).toBeVisible()
    await expect(page.locator('#phoneNumber')).toContainText(phoneNumber)
  })
})
