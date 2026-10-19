/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { test, expect, Page } from '@playwright/test'
import { goToSection, login } from '@e2e/support/helpers'
import { REQUIRED_VALIDATION_ERROR } from '@e2e/support/birth/helpers'
import { trackAndDeleteCreatedEvents } from '@e2e/support/test-data/eventDeletion'
import { type } from '@e2e/support/utils'

const loginAndBeginBirthDeclaration = async ({ page }: { page: Page }) => {
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

  await expect(page.getByText("Child's details")).toBeVisible()
}

test.describe("2. Validate the child's details page", () => {
  trackAndDeleteCreatedEvents()

  test('2.1 Validate "First Name(s)" text field', async ({ page }) => {
    test.setTimeout(300_000)

    await loginAndBeginBirthDeclaration({ page })

    await test.step('2.1.1 Enter Non-English characters', async () => {
      await test.step('Using name: Richard the 3rd', async () => {
        await type(page, '#firstname', 'Richard the 3rd')
        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })

      await test.step('Using name: John_Peter', async () => {
        await type(page, '#firstname', 'John_Peter')
        /*
         * Expected result: should throw error:
         * - Input contains invalid characters. An underscore is not one of the
         *   characters `isValidEnglishName` allows.
         */
        await expect(page.locator('#firstname_error')).toBeVisible()
      })

      await test.step('Using name: John-Peter', async () => {
        await type(page, '#firstname', 'John-Peter')
        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })

      await test.step("Using name: O'Neill", async () => {
        await type(page, '#firstname', "O'Neill")
        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })

      await test.step('Using name: &er$on', async () => {
        await type(page, '#firstname', '&er$on')
        /*
         * Expected result: should throw error:
         * - Input contains invalid characters.
         */
        await expect(page.locator('#firstname_error')).toBeVisible()
      })

      /*
       * `isValidEnglishName` accepts this today -- Æ is Script=Latin,
       * so the rule has nothing to complain about.
       */
      await test.step('Using name: X Æ A-Xii', async () => {
        await type(page, '#firstname', 'X Æ A-Xii')
        await expect(page.locator('#firstname_error')).toBeHidden()
      })
    })

    await test.step('2.1.2 Enter less than 33 English characters', async () => {
      await type(page, '#firstname', 'Rakibul Islam')
      /*
       * Expected result: should accept the input and not throw any error
       */
      await expect(page.locator('#firstname_error')).toBeHidden()
    })

    await test.step('2.1.4 Enter more than 32 English characters', async () => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await type(page, '#firstname', LONG_NAME)
      /*
       * Expected result: should clip the name to first 32 character
       */
      await expect(page.locator('#firstname')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
    })

    await test.step('2.1.3 Enter Field as NULL', async () => {
      await goToSection(page, 'review')

      /*
       * Expected result: should throw error in application review page:
       * - Required
       */
      await expect(
        page
          .locator('[data-testid="child.name-value"]')
          .getByText(REQUIRED_VALIDATION_ERROR)
      ).toBeVisible()
    })
  })

  test('2.3 Validate the Sex dropdown field', async ({ page }) => {
    await loginAndBeginBirthDeclaration({ page })

    await test.step('2.3.1 Select any dropdown value: "Female"', async () => {
      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      /*
       * Expected result: "Female" should be selected
       */
      await expect(
        page.locator('#child____gender', { hasText: 'Female' })
      ).toBeVisible()
    })
  })

  test('2.4 Validate the "DOB" field', async ({ page }) => {
    await loginAndBeginBirthDeclaration({ page })

    await test.step('2.4.1 Enter date less than the current date', async () => {
      const yesterday = new Date()
      yesterday.setDate(new Date().getDate() - 1)
      const [yyyy, mm, dd] = yesterday.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      /*
       * Expected result: should accept the date
       */
      await expect(page.locator('#child____dob_error')).toBeHidden()
    })

    // @TODO: This validation is not implemented in Events V2 yet
    await test.step.skip('2.4.2 Enter invalid date', async () => {
      await page.getByPlaceholder('dd').fill('0')
      await page.getByPlaceholder('mm').fill('0')
      await page.getByPlaceholder('yyyy').fill('0')
      /*
       * Expected result: should not accept the invalid date and show error:
       * - Must be a valid birth date
       */
      await expect(page.locator('#child____dob_error')).toHaveText(
        'Must be a valid birth date'
      )
    })

    // @TODO: This validation is not implemented in Events V2 yet
    await test.step.skip('2.4.3 Enter future date', async () => {
      const futureDate = new Date()
      futureDate.setDate(new Date().getDate() + 5)
      const [yyyy, mm, dd] = futureDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      /*
       * Expected result: should not accept the future date and show error:
       * - Must be a valid birth date

       */
      await expect(page.locator('#child____dob_error')).toHaveText(
        'Must be a valid birth date'
      )
    })
  })

  test('2.5 Validate delayed registration', async ({ page }) => {
    test.setTimeout(300_000)

    await loginAndBeginBirthDeclaration({ page })

    async function fillDelayedDate() {
      const delayedDate = new Date()
      delayedDate.setDate(new Date().getDate() - 365 - 5)
      const [yyyy, mm, dd] = delayedDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
    }

    await test.step('2.5.1 Enter date after delayed registration time period', async () => {
      await fillDelayedDate()

      const lateDate = new Date()
      lateDate.setDate(new Date().getDate() - 365 + 5)
      const [yyyy, mm, dd] = lateDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      /*
       * Expected result: should show field:
       * - Reason for delayed registration
       */
      await expect(
        page.getByText('Reason for delayed registration')
      ).toBeHidden()
    })

    await test.step('2.5.2 Enter date before delayed registration time period', async () => {
      await fillDelayedDate()

      /*
       * Expected result: should show field:
       * - Reason for delayed registration
       */
      await expect(
        page.getByText('Reason for delayed registration')
      ).toBeVisible()
    })

    await test.step('2.5.3 Enter "Reason for late registration"', async () => {
      await fillDelayedDate()

      await page.locator('#child____reason').fill('Lack of awareness')

      /*
       * Expected result: should accept text
       */
      await expect(page.locator('#child____reason_error')).toBeHidden()
    })

    await test.step('2.5.4 Set the field as null', async () => {
      await fillDelayedDate()

      await page.locator('#child____reason').fill('')
      await goToSection(page, 'review')

      /*
       * Expected result: should throw error in application review page:
       * - Required
       */
      await expect(
        page
          .getByRole('row', { name: 'Reason for delayed' })
          .locator('[data-testid="child.reason-value"]')
      ).toHaveText(REQUIRED_VALIDATION_ERROR)
    })
  })

  test('2.6 Validate place of delivery field', async ({ page }) => {
    test.setTimeout(300_000)

    await loginAndBeginBirthDeclaration({ page })

    await test.step('2.6.2.a Validate Health Institution', async () => {
      await test.step('Select Health Institution', async () => {
        await page.locator('#child____placeOfBirth').click()
        await page.getByText('Health Institution', { exact: true }).click()
        /*
         * Expected result: should show input field for:
         * - Health institution
         */
        await expect(page.locator('#child____birthLocation')).toBeVisible()
      })
      await test.step('Enter any health institution', async () => {
        await page
          .locator('#searchable-select-child____birthLocation input')
          .fill('ib')
        await page.getByText('Ibombo District Hospital').click()

        await expect(
          page.locator(
            '#searchable-select-child____birthLocation .react-select__single-value'
          )
        ).toHaveText('Ibombo District Hospital')
      })
    })

    await test.step('2.6.2.b Select Residential address', async () => {
      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Residential address', { exact: true }).click()

      /*
       * Expected result:
       * - should select "Residential address" as place of birth
       * - Should show input field for address
       */
      await expect(page.locator('#child____placeOfBirth')).toContainText(
        'Residential address'
      )

      await expect(
        page.locator('#child____birthLocation____privateHome-form-input')
      ).toBeVisible()
    })

    await test.step('2.6.2.c Select Other', async () => {
      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Other', { exact: true }).click()

      /*
       * Expected result:
       should select "Other" as place of birth
       * - Should show input field for address
       */
      await expect(page.locator('#child____placeOfBirth')).toContainText(
        'Other'
      )

      await expect(
        page.locator('#child____birthLocation____other-form-input')
      ).toBeVisible()
    })
  })
})
