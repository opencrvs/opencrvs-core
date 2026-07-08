import { test, expect } from '@playwright/test'
import { goToSection, login } from '../../helpers'
import { REQUIRED_VALIDATION_ERROR } from './helpers'
import { trackAndDeleteCreatedEvents } from '../test-data/eventDeletion'

test.describe('3. Validate the mothers and fathers details pages', () => {
  trackAndDeleteCreatedEvents()

  test.beforeEach(async ({ page }) => {
    await login(page)

    await page.click('#header-new-event')

    await expect(page.getByText('New Declaration')).toBeVisible()
    await expect(
      page.getByText('What type of event do you want to declare?')
    ).toBeVisible()
    await expect(page.getByLabel('Birth')).toBeVisible()

    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText("Mother's details", { exact: true })
    ).toBeVisible()
  })

  test.describe.serial('3.1 Validate "First Name(s)" text field', async () => {
    test.describe('3.1.1 Enter Non-English characters', async () => {
      test('Using name: Richard the 3rd', async ({ page }) => {
        await page.locator('#firstname').fill('Richard the 3rd')
        await page.getByRole('heading', { name: 'Birth' })

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })

      test('Using name: John_Peter', async ({ page }) => {
        await page.locator('#firstname').fill('John_Peter')
        await page.getByRole('heading', { name: 'Birth' })

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })

      test('Using name: John-Peter', async ({ page }) => {
        await page.locator('#firstname').fill('John-Peter')
        await page.getByRole('heading', { name: 'Birth' })

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })

      test("Using name: O'Neill", async ({ page }) => {
        await page.locator('#firstname').fill("O'Neill")
        await page.getByRole('heading', { name: 'Birth' })

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })
    })

    test('3.1.2 Enter less than 33 English characters', async ({ page }) => {
      await page.locator('#firstname').fill('Rakibul Islam')
      await page.getByRole('heading', { name: 'Birth' })

      /*
       * Expected result: should accept the input and not throw any error
       */
      await expect(page.locator('#firstname_error')).toBeHidden()
    })

    test('3.1.3 Enter Field as NULL', async ({ page }) => {
      await goToSection(page, 'review')

      /*
       * Expected result: should throw error in application review page:
       * - Required
       */
      await expect(
        page
          .locator('[data-testid="row-value-mother.name"]')
          .getByText(REQUIRED_VALIDATION_ERROR)
      ).toBeVisible()
    })

    test('3.1.4 Enter more than 32 English characters', async ({ page }) => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator('#firstname').fill(LONG_NAME)
      await page.getByRole('heading', { name: 'Birth' })

      /*
       * Expected result: should clip the name to first 32 character
       */
      await expect(page.locator('#firstname')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
    })
  })

  test.describe.serial('3.2 Validate the "National ID" field', async () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('#mother____idType').getByText('Select...').click()
      await page.getByText('National ID', { exact: true }).click()
    })

    test('3.2.1 Enter empty National ID', async ({ page }) => {
      await page.locator('#mother____nid-form-input div').nth(1).click()
      await page.getByRole('heading', { name: 'Birth' }).click()
      await expect(page.locator('#mother____nid_error')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    })

    test('3.2.2 Enter National ID with non-numeric characters', async ({
      page
    }) => {
      await page.getByTestId('text__mother____nid').fill('11111asdfg')
      await page.getByRole('heading', { name: 'Birth' }).click()
      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()
    })

    test('3.2.3 Enter too short National ID', async ({ page }) => {
      await page.getByTestId('text__mother____nid').fill('123456789')
      await page.getByRole('heading', { name: 'Birth' }).click()
      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()
    })

    test('3.2.3 Enter too long National ID', async ({ page }) => {
      await page.getByTestId('text__mother____nid').fill('12345678901')
      await page.getByRole('heading', { name: 'Birth' }).click()
      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()
    })

    test('3.2.4 Enter valid National ID', async ({ page }) => {
      await page.getByTestId('text__mother____nid').fill('1234567890')
      await page.getByRole('heading', { name: 'Birth' }).click()
      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).not.toBeVisible()
    })

    test('3.2.5 Fathers National ID must not match mothers National ID', async ({
      page
    }) => {
      await page.getByTestId('text__mother____nid').fill('1234567890')
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.locator('#father____idType').getByText('Select...').click()
      await page.getByText('National ID', { exact: true }).click()
      await page.getByTestId('text__father____nid').fill('1234567890')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(
        page.getByText('National id must be unique', {
          exact: true
        })
      ).toBeVisible()
      await page.getByTestId('text__father____nid').fill('12345678901')
      await page.getByRole('heading', { name: 'Birth' }).click()
      await expect(
        page.getByText('National id must be unique', {
          exact: true
        })
      ).not.toBeVisible()
    })
  })
})
