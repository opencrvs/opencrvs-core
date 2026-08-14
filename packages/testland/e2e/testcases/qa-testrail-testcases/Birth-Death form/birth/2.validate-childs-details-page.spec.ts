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
import { test, expect } from '@playwright/test'
import { goToSection, login } from '../../../../helpers'
import { REQUIRED_VALIDATION_ERROR, openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Child's details page"
 */

trackAndDeleteCreatedEvents()

test("Validate Child's details page", async ({ page }) => {
  await login(page)
  await openBirthDeclaration(page)

  await test.step('1. Validate "First Name(s)" text field', async () => {
    for (const name of ['Richard the 3rd', 'John_Peter', 'John-Peter', "O'Neill"]) {
      await test.step(`Accept non-English/special-character name: ${name}`, async () => {
        await page.locator('#firstname').fill(name)
        await page.getByRole('heading', { name: 'Birth' }).click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstname_error')).toBeHidden()
      })
    }

    await test.step('Enter less than 33 English characters', async () => {
      await page.locator('#firstname').fill('Rakibul Islam')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#firstname_error')).toBeHidden()
    })

    await test.step('Enter more than 32 English characters', async () => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator('#firstname').fill(LONG_NAME)
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: should not be able to accept more than 32
       * characters
       */
      await expect(page.locator('#firstname')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
      await page.locator('#firstname').fill('Rakibul')
    })

    await test.step('Reject a name containing an invalid character', async () => {
      await page.locator('#firstname').fill('John@Peter')
      await page.locator('#surname').fill('Doppler')

      /*
       * Expected result: "Input contains invalid characters. Please use
       * only letters (a-z, A-Z), numbers (0-9), hyphens (-) and
       * apostrophes(')" - the NAME field's validator error is suppressed
       * on this page itself (a composite/nested field type) and only
       * surfaces on the review row.
       */
      await goToSection(page, 'review')
      await expect(
        page
          .locator('[data-testid="child.name-value"]')
          .getByText(
            "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')"
          )
      ).toBeVisible()

      await page.getByTestId('change-button-child.name').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.locator('#firstname').fill('Rakibul')
    })
  })

  await test.step('2. Validate "Last Name" text field', async () => {
    for (const name of ['Richard the 3rd', 'John_Peter', 'John-Peter', "O'Neill"]) {
      await test.step(`Accept non-English/special-character surname: ${name}`, async () => {
        await page.locator('#surname').fill(name)
        await page.getByRole('heading', { name: 'Birth' }).click()

        await expect(page.locator('#surname_error')).toBeHidden()
      })
    }

    await test.step('Enter more than 32 English characters', async () => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator('#surname').fill(LONG_NAME)
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#surname')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
      await page.locator('#surname').fill('Islam')
    })
  })

  await test.step('3. Validate the Sex dropdown field', async () => {
    for (const gender of ['Male', 'Female', 'Unknown']) {
      await test.step(`Select dropdown value: ${gender}`, async () => {
        await page.locator('#child____gender').click()
        await page.getByText(gender, { exact: true }).click()

        /*
         * Expected result: the drop-down value should be selected
         */
        await expect(
          page.locator('#child____gender', { hasText: gender })
        ).toBeVisible()
      })
    }
  })

  await test.step('4. Validate the DOB field', async () => {
    await test.step('Enter date less than the current date', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const [yyyy, mm, dd] = yesterday.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: should accept the date
       */
      await expect(page.locator('#child____dob_error')).toBeHidden()
    })

    await test.step('Enter a future date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const [yyyy, mm, dd] = futureDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Must be a valid birth date"
       */
      await expect(page.locator('#child____dob_error')).toHaveText(
        'Must be a valid birth date'
      )
    })
  })

  await test.step('5. Validate delayed registration', async () => {
    await test.step('Enter a DOB within the delayed registration period', async () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 30)
      const [yyyy, mm, dd] = recentDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Reason for delayed registration" should not show
       */
      await expect(
        page.getByText('Reason for delayed registration')
      ).toBeHidden()
    })

    await test.step('Enter a DOB past the delayed registration period', async () => {
      const lateDate = new Date()
      lateDate.setDate(lateDate.getDate() - 365 - 5)
      const [yyyy, mm, dd] = lateDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Reason for delayed registration" should show
       */
      await expect(
        page.getByText('Reason for delayed registration')
      ).toBeVisible()
    })

    await test.step('Enter "Reason for delayed registration"', async () => {
      await page.locator('#child____reason').fill('Lack of awareness')
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: should accept text
       */
      await expect(page.locator('#child____reason_error')).toBeHidden()
    })

    await test.step('Reset to a recent DOB so later steps are not late-registration-gated', async () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 30)
      const [yyyy, mm, dd] = recentDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
    })
  })

  await test.step('6. Validate the Place of Delivery field', async () => {
    await test.step('Select "Health Institution" and enter a facility', async () => {
      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()

      /*
       * Expected result: should show a searchable Health Institution field
       */
      await expect(page.locator('#child____birthLocation')).toBeVisible()

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

    await test.step('Select "Residential address"', async () => {
      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Residential address', { exact: true }).click()

      /*
       * Expected result: should select "Residential address" and show
       * the address block (country/province/district defaulted,
       * town/street/etc. free text)
       */
      await expect(page.locator('#child____placeOfBirth')).toContainText(
        'Residential address'
      )
      await expect(
        page.locator('#child____birthLocation____privateHome-form-input')
      ).toBeVisible()
      await expect(page.locator('#country')).toHaveText('Farajaland')
      /*
       * #province/#district are react-select's inputId - the visible text
       * of the currently selected value lives in a sibling
       * `.react-select__single-value` element, not the input itself.
       */
      await expect(
        page.locator('#searchable-select-province .react-select__single-value')
      ).toHaveText('Central')
      await expect(
        page.locator('#searchable-select-district .react-select__single-value')
      ).toHaveText('Ibombo')
    })

    await test.step('Leaving the village empty on "Residential address" shows an invalid-address error', async () => {
      /*
       * Expected result: "Invalid input" - province/district are
       * defaulted from the user's own jurisdiction but no village was
       * ever selected, so the address falls short of the required leaf
       * administrative level. Like the NAME field above, this ADDRESS
       * field's error is suppressed on this page itself and only
       * surfaces on the review row.
       */
      await goToSection(page, 'review')
      await expect(
        page
          .locator(
            '[data-testid="child.birthLocation.privateHome-value"]'
          )
          .getByText('Invalid input')
      ).toBeVisible()

      await page.getByTestId('change-button-child.placeOfBirth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('Select "Other"', async () => {
      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Other', { exact: true }).click()

      /*
       * Expected result: should select "Other" and show the address
       * block
       */
      await expect(page.locator('#child____placeOfBirth')).toContainText(
        'Other'
      )
      await expect(
        page.locator('#child____birthLocation____other-form-input')
      ).toBeVisible()
    })

    await test.step('Leaving the village empty on "Other" shows an invalid-address error', async () => {
      /*
       * Expected result: "Invalid input" - for the same reason as the
       * "Residential address" case above
       */
      await goToSection(page, 'review')
      await expect(
        page
          .locator('[data-testid="child.birthLocation.other-value"]')
          .getByText('Invalid input')
      ).toBeVisible()

      await page.getByTestId('change-button-child.placeOfBirth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('Restore "Health Institution" for the rest of the flow', async () => {
      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()
      await page
        .locator('#searchable-select-child____birthLocation input')
        .fill('ib')
      await page.getByText('Ibombo District Hospital').click()
    })
  })

  await test.step('7. Validate "Attendant at birth" and "Type of birth" dropdowns', async () => {
    await page.locator('#child____attendantAtBirth').click()
    await page.getByText('Midwife', { exact: true }).click()
    await expect(
      page.locator('#child____attendantAtBirth', { hasText: 'Midwife' })
    ).toBeVisible()

    await page.locator('#child____birthType').click()
    await page.getByText('Twin', { exact: true }).click()
    await expect(
      page.locator('#child____birthType', { hasText: 'Twin' })
    ).toBeVisible()
  })

  await test.step('8. Validate the "Weight at birth" field', async () => {
    await test.step('Enter a negative number', async () => {
      await page.locator('#child____weightAtBirth').fill('-1')
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Must be within 0 and 6"
       */
      await expect(page.locator('#child____weightAtBirth_error')).toHaveText(
        'Must be within 0 and 6'
      )
    })

    await test.step('Enter a positive number <= 6', async () => {
      await page.locator('#child____weightAtBirth').fill('3.2')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#child____weightAtBirth_error')).toBeHidden()
    })

    await test.step('Enter a positive number > 6', async () => {
      await page.locator('#child____weightAtBirth').fill('7')
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Must be within 0 and 6"
       */
      await expect(page.locator('#child____weightAtBirth_error')).toHaveText(
        'Must be within 0 and 6'
      )
      await page.locator('#child____weightAtBirth').fill('')
    })
  })

  await test.step('9. Click "Continue"', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: user should redirect to the informant details page
     */
    await expect(page.getByText("Informant's details")).toBeVisible()
  })
})

test("Validate Child's details page - required field validation", async ({
  page
}) => {
  await login(page)
  await openBirthDeclaration(page)

  await test.step('Leave every field null and check the required errors on the review page', async () => {
    await goToSection(page, 'review')

    /*
     * Expected result: "Required" for name, sex, DOB and place of birth
     */
    await expect(
      page
        .locator('[data-testid="child.name-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
    await expect(
      page
        .locator('[data-testid="child.gender-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
    await expect(
      page
        .locator('[data-testid="child.dob-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="child.placeOfBirth-value"]')
    ).toHaveText(REQUIRED_VALIDATION_ERROR)
  })

  await test.step('Enter a delayed-registration DOB, then leave "Reason" null', async () => {
    await page.getByTestId('change-button-child.dob').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    const lateDate = new Date()
    lateDate.setDate(lateDate.getDate() - 365 - 5)
    const [yyyy, mm, dd] = lateDate.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)

    await goToSection(page, 'review')

    /*
     * Expected result: "Required" for the delayed-registration reason
     */
    await expect(
      page
        .getByRole('row', { name: 'Reason for delayed' })
        .locator('[data-testid="child.reason-value"]')
    ).toHaveText(REQUIRED_VALIDATION_ERROR)
  })
})
