import { test, expect, type Page } from '@playwright/test'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '../../utils'
import { Declaration, createDeclaration } from '../test-data/birth-declaration'
import { REQUIRED_VALIDATION_ERROR, formatV2ChildName } from '../birth/helpers'
import {
  openRecordByTitle,
  printAndExpectPopup
} from '../print-certificate/birth/helpers'

test.describe.serial('Issue Certified Copy', () => {
  let page: Page
  let declaration: Declaration
  let childName: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRAR)
    declaration = (await createDeclaration(token)).declaration
    childName = formatV2ChildName(declaration)
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe('Print in advance', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await navigateToWorkqueue(page, 'Pending certification')
      await openRecordByTitle(page, childName)

      await expect(page.getByText('Registered')).toBeVisible()
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

      await expect(
        page
          .getByTestId('flags')
          .getByText('Pending first certificate issuance')
      ).toBeVisible()
    })
    test('Navigate to print', async () => {
      await selectAction(page, 'Print')
    })

    test('Template type should be selected by default', async () => {
      await expect(
        page.locator('#certificateTemplateId').getByText('Birth Certificate')
      ).toBeVisible()
    })

    test('Clicking continue without selecting requester type should display validation error', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(
        page
          .locator('#collector____requesterId_error')
          .getByText(REQUIRED_VALIDATION_ERROR)
      ).toBeVisible()
    })

    test('Clicking continue after selecting requester type and template type', async () => {
      await expect(
        page.locator('#certificateTemplateId').getByText('Birth Certificate')
      ).toBeVisible()

      await page.locator('#collector____requesterId').click()
      const selectOptionsLabels = [
        'Print and issue to Informant (Mother)',
        'Print and issue to someone else',
        'Print in advance of issuance'
      ]
      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }

      await page.getByText(selectOptionsLabels[2], { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('Print', async () => {
      await printAndExpectPopup(page)
    })
    test('Ensure "Certified copy printed in advance of issuance" flag appears on record', async () => {
      await searchFromSearchBar(page, childName)
      const Flags = page.getByTestId('flags').filter({ hasText: 'Flags' })
      await expect(
        Flags.getByText('Certified copy printed in advance of issuance')
      ).toBeVisible()
      await page.getByTestId('exit-event').click()
    })
  })
  test.describe('Print issuance', async () => {
    test('Navigate to the declaration review page', async () => {
      await navigateToWorkqueue(page, 'Pending issuance')
      await openRecordByTitle(page, childName)
      await expect(page.getByText('Registered')).toBeVisible()
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

      const Flags = page.getByTestId('flags').filter({ hasText: 'Flags' })
      await expect(
        Flags.getByText('Certified copy printed in advance of issuance')
      ).toBeVisible()
    })
    test('Navigate to print', async () => {
      await selectAction(page, 'Issue certified copy')
    })

    test('Click continue without selecting requester type', async () => {
      await expect(
        page.getByRole('heading', {
          name: 'Issue certified copy?',
          exact: true
        })
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    })

    test('Click continue after selecting collector type and template type', async () => {
      await page.getByText('Select...').click()
      const selectOptionsLabels = ['Mother', 'Father', 'Someone else']
      for (const label of selectOptionsLabels) {
        await page.getByText(label, { exact: true }).scrollIntoViewIfNeeded()
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }
      await page
        .getByText(selectOptionsLabels[0], { exact: true })
        .scrollIntoViewIfNeeded()
      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      await expect(page.getByRole('button', { name: 'Confirm' })).toBeEnabled()
      await page.getByRole('button', { name: 'Confirm' }).click()
    })
    test('Search The record and check the No Flag', async () => {
      await searchFromSearchBar(page, childName)
      const Flags = page.getByTestId('flags').filter({ hasText: 'Flags' })
      await expect(Flags.getByText('No flags')).toBeVisible()
    })
  })
})
