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
import { test, expect, type Page } from '@playwright/test'
import { goToSection, login } from '../../../../helpers'
import { REQUIRED_VALIDATION_ERROR, openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Mothers details page"
 */

const beginAtMothersPage = async (page: Page) => {
  await login(page)
  await openBirthDeclaration(page)
  await page.locator('#firstname').fill('Rakibul')
  await page.locator('#surname').fill('Islam')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Brother', { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText("Mother's details", { exact: true })
  ).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('Validate Mothers details page', async ({ page }) => {
  await beginAtMothersPage(page)

  await test.step('1-3. "Mother\'s details unavailable" checkbox', async () => {
    /*
     * Expected result: checkbox appears when informant is not Mother
     */
    await expect(
      page.getByText("Mother's details are not available")
    ).toBeVisible()

    await page.getByText("Mother's details are not available").click()

    /*
     * Expected result: Reason field appears and is mandatory; remaining
     * mother detail fields are hidden
     */
    await expect(page.locator('#mother____reason')).toBeVisible()
    await expect(page.locator('#firstname')).toBeHidden()

    await goToSection(page, 'review')
    await expect(
      page
        .locator('[data-testid="mother.reason-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()

    await page.getByTestId('change-button-mother.reason').click()
    /*
     * Clicking a review-page "Change" button first shows an "Edit
     * declaration?" confirmation dialog - it must be confirmed before the
     * underlying field becomes interactive again.
     */
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByText("Mother's details are not available").click()

    /*
     * Expected result: Reason field hides and standard mother fields
     * reappear
     */
    await expect(page.locator('#mother____reason')).toBeHidden()
    await expect(page.locator('#firstname')).toBeVisible()
  })

  await test.step('4. Validate the identity status field', async () => {
    // Covered end-to-end in 10.validate-esignet-flow.spec.ts and
    // 11.validate-mosip-qr-integration.spec.ts - just re-confirm the two
    // buttons are present here.
    await expect(
      page.getByRole('button', { name: 'Scan QR code' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Authenticate with National ID system'
      })
    ).toBeVisible()
  })

  await test.step('5. Validate "First Name(s)" text field', async () => {
    for (const name of ['Richard the 3rd', 'John_Peter', 'John-Peter', "O'Neill"]) {
      await test.step(`Accept non-English/special-character name: ${name}`, async () => {
        await page.locator('#firstname').fill(name)
        await page.getByRole('heading', { name: 'Birth' }).click()

        await expect(page.locator('#firstname_error')).toBeHidden()
      })
    }

    await test.step('Enter more than 32 English characters is clipped', async () => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator('#firstname').fill(LONG_NAME)
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#firstname')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
      await page.locator('#firstname').fill('Aisha')
    })

    await test.step('Reject a name containing an invalid character', async () => {
      await page.locator('#firstname').fill('John@Doe')
      await page.locator('#surname').fill('Doe')

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
          .locator('[data-testid="mother.name-value"]')
          .getByText(
            "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')"
          )
      ).toBeVisible()

      await page.getByTestId('change-button-mother.name').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.locator('#firstname').fill('Aisha')
    })
  })

  await test.step('6. Validate "Last Name" text field', async () => {
    const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
    await page.locator('#surname').fill(LONG_NAME)
    await page.getByRole('heading', { name: 'Birth' }).click()

    /*
     * Expected result: should not be able to accept more than 32
     * characters
     */
    await expect(page.locator('#surname')).toHaveValue(LONG_NAME.slice(0, 32))
    await page.locator('#surname').fill('Islam')
  })

  await test.step('7-8. Validate the DOB field and "Exact date of birth unknown"', async () => {
    await test.step('Enter a valid past date', async () => {
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1990')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#mother____dob_error')).toBeHidden()
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
      await expect(page.locator('#mother____dob_error')).toHaveText(
        'Must be a valid birth date'
      )
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1990')
    })

    await test.step('Enter a DOB less than 18 years before child\'s DOB', async () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 365 * 10)
      const [yyyy, mm, dd] = recentDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Birth date must be 18 years before child's
       * birth date"
       */
      await expect(page.locator('#mother____dob_error')).toHaveText(
        "Birth date must be 18 years before child's birth date"
      )
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1990')
    })

    await test.step('Check "Exact date of birth unknown" shows the Age field', async () => {
      await page.getByText('Exact date of birth unknown').click()

      /*
       * Expected result: "Age of mother (at the time of event)" field
       * appears, accepts only integers
       */
      await expect(
        page.getByText('Age of mother (at the time of event)')
      ).toBeVisible()
      await page.locator('#mother____age').fill('30')
      await expect(page.locator('#mother____age')).toHaveValue('30')

      await test.step('Enter an out-of-range age (5)', async () => {
        await page.locator('#mother____age').fill('5')
        await page.getByRole('heading', { name: 'Birth' }).click()

        /*
         * Expected result: "Age must be between 12 and 120"
         */
        await expect(page.locator('#mother____age_error')).toHaveText(
          'Age must be between 12 and 120'
        )
      })

      await test.step('Enter an out-of-range age (130)', async () => {
        await page.locator('#mother____age').fill('130')
        await page.getByRole('heading', { name: 'Birth' }).click()

        /*
         * Expected result: "Age must be between 12 and 120"
         */
        await expect(page.locator('#mother____age_error')).toHaveText(
          'Age must be between 12 and 120'
        )
        await page.locator('#mother____age').fill('30')
      })

      // Uncheck so the DOB fields are used for the rest of the flow
      await page.getByText('Exact date of birth unknown').click()
    })
  })

  await test.step('9. Validate the "Nationality" drop-down field', async () => {
    await page.locator('#mother____nationality').click()
    await page.getByText('Holy See', { exact: true }).click()

    await expect(page.locator('#mother____nationality')).toContainText(
      'Holy See'
    )
    await page.locator('#mother____nationality').click()
    await page
      .locator('.react-select__option')
      .getByText('Farajaland', { exact: true })
      .click()
  })

  await test.step('10-11. Validate "Proof of identity" and "National ID"', async () => {
    for (const idType of ['Passport', 'Birth Registration Number', 'National ID']) {
      await page.locator('#mother____idType').click()
      await page.getByText(idType, { exact: true }).click()

      /*
       * Expected result: should show Document No. for every ID type
       */
      await expect(page.getByText('ID Number')).toBeVisible()
    }

    await test.step('Enter less than 10 digits', async () => {
      await page.locator('#mother____nid').fill('123456789')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()
    })

    await test.step('Enter 10 digits', async () => {
      await page.locator('#mother____nid').fill('1234567890')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).not.toBeVisible()
    })
  })

  await test.step("12. Enter the same National ID as the father's", async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#father____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#father____nid').fill('1234567890')
    await page.getByRole('heading', { name: 'Birth' }).click()

    /*
     * Expected result: "National id must be unique"
     */
    await expect(
      page.getByText('National id must be unique', { exact: true })
    ).toBeVisible()

    // Give the father a different NID, then return to the Mother's page
    // to continue the rest of the flow
    await page.locator('#father____nid').fill('9876543210')
    await page.goBack()
    await expect(
      page.getByText("Mother's details", { exact: true })
    ).toBeVisible()
  })

  await test.step('13. Validate the Residence address section', async () => {
    await expect(page.locator('#country')).toHaveText('Farajaland')
    await page.locator('#province').click()
    await page.getByText('Sulaka', { exact: true }).click()
    await page.locator('#district').click()
    await page.getByText('Irundu', { exact: true }).click()
    await page.locator('#village').click()
    await page.getByText('Xhosa', { exact: true }).click()

    await page.locator('#town').fill('Klow')
    await page.locator('#residentialArea').fill('Downtown')
    await page.locator('#street').fill('Main street')
    await page.locator('#number').fill('12')
    await page.locator('#zipCode').fill('1200')

    await expect(
      page.locator('#searchable-select-province .react-select__single-value')
    ).toHaveText('Sulaka')
  })

  await test.step('14-15. Validate Marital status and Level of education', async () => {
    await page.locator('#mother____maritalStatus').click()
    await page.getByText('Widowed', { exact: true }).click()
    await expect(page.locator('#mother____maritalStatus')).toContainText(
      'Widowed'
    )

    await page.locator('#mother____educationalAttainment').click()
    await page.getByText('No schooling', { exact: true }).click()
    await expect(
      page.locator('#mother____educationalAttainment')
    ).toContainText('No schooling')
  })

  await test.step('16-17. Validate Occupation and No. of previous births', async () => {
    await page.locator('#mother____occupation').fill('Farmer')
    await expect(page.locator('#mother____occupation_error')).toBeHidden()

    await page.locator('#mother____previousBirths').fill('2')
    await expect(
      page.locator('#mother____previousBirths_error')
    ).toBeHidden()
  })

  await test.step('18. "Continue" navigates to the Father\'s details page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText("Father's details", { exact: true })
    ).toBeVisible()
  })
})

test('Validate Mothers details page - required field validation', async ({
  page
}) => {
  await beginAtMothersPage(page)

  await goToSection(page, 'review')

  /*
   * Expected result: "Required" for name, DOB, ID and address
   */
  await expect(
    page
      .locator('[data-testid="mother.name-value"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
  await expect(
    page
      .locator('[data-testid="mother.dob-value"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
  /*
   * Unlike the scalar fields above, an empty ADDRESS field fails its own
   * `isValidAdministrativeLeafLevel()` validator rather than the generic
   * required check, so its review row shows "Invalid input" instead of
   * "Required for registration" (see child.ts/mother.ts's address field
   * validation message, id: 'error.invalidInput').
   */
  await expect(
    page
      .locator('[data-testid="mother.address-value"]')
      .getByText('Invalid input')
  ).toBeVisible()
})
