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
 * QA case: "Validate Fathers details page"
 */

const beginAtFathersPage = async (page: Page) => {
  await login(page)
  await openBirthDeclaration(page)
  await page.locator('#firstname').fill('Rakibul')
  await page.locator('#surname').fill('Islam')

  /*
   * The child's own DOB must be set for the father's "DOB after child's
   * DOB" validation (further below) to have anything to compare against.
   */
  const childDob = new Date()
  childDob.setDate(childDob.getDate() - 30)
  const [cyyyy, cmm, cdd] = childDob.toISOString().split('T')[0].split('-')
  await page.getByPlaceholder('dd').fill(cdd)
  await page.getByPlaceholder('mm').fill(cmm)
  await page.getByPlaceholder('yyyy').fill(cyyyy)

  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Brother', { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText("Mother's details", { exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText("Father's details", { exact: true })
  ).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('Validate Fathers details page', async ({ page }) => {
  await beginAtFathersPage(page)

  await test.step('1-3. "Father\'s details unavailable" checkbox', async () => {
    /*
     * Expected result: checkbox appears when informant is not Father
     */
    await expect(
      page.getByText("Father's details are not available")
    ).toBeVisible()

    await page.getByText("Father's details are not available").click()

    /*
     * Expected result: Reason field appears and is mandatory; remaining
     * father detail fields are hidden
     */
    await expect(page.locator('#father____reason')).toBeVisible()
    await expect(page.locator('#firstname')).toBeHidden()

    await goToSection(page, 'review')
    await expect(
      page
        .locator('[data-testid="father.reason-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()

    await page.getByTestId('change-button-father.reason').click()
    /*
     * Clicking a review-page "Change" button first shows an "Edit
     * declaration?" confirmation dialog - it must be confirmed before the
     * underlying field becomes interactive again.
     */
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByText("Father's details are not available").click()

    /*
     * Expected result: Reason field hides and standard father fields
     * reappear
     */
    await expect(page.locator('#father____reason')).toBeHidden()
    await expect(page.locator('#firstname')).toBeVisible()
  })

  await test.step('4. Validate the identity status field', async () => {
    await expect(
      page.getByRole('button', { name: 'Scan QR code' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Authenticate with National ID system'
      })
    ).toBeVisible()
  })

  await test.step('5-6. Validate "First Name(s)" and "Last Name" fields', async () => {
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
      await page.locator('#firstname').fill('John')

      await page.locator('#surname').fill(LONG_NAME)
      await page.getByRole('heading', { name: 'Birth' }).click()
      await expect(page.locator('#surname')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
      await page.locator('#surname').fill('Islam')
    })

    await test.step('Reject a name containing an invalid character', async () => {
      await page.locator('#firstname').fill('John@Doe')

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
          .locator('[data-testid="father.name-value"]')
          .getByText(
            "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')"
          )
      ).toBeVisible()

      await page.getByTestId('change-button-father.name').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.locator('#firstname').fill('John')
    })
  })

  await test.step('7-8. Validate the DOB field and "Exact date of birth unknown"', async () => {
    await test.step('Enter a valid past date', async () => {
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1985')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#father____dob_error')).toBeHidden()
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
      await expect(page.locator('#father____dob_error')).toHaveText(
        'Must be a valid birth date'
      )
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1985')
    })

    await test.step("Enter a DOB after the child's DOB", async () => {
      const today = new Date()
      const [yyyy, mm, dd] = today.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Birth' }).click()

      /*
       * Expected result: "Birth date must be before child's birth date"
       */
      await expect(page.locator('#father____dob_error')).toHaveText(
        "Birth date must be before child's birth date"
      )
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1985')
    })

    await test.step('Check "Exact date of birth unknown" shows the Age field', async () => {
      await page.getByText('Exact date of birth unknown').click()

      await expect(
        page.getByText('Age of father (at the time of event)')
      ).toBeVisible()
      await page.locator('#father____age').fill('32')
      await expect(page.locator('#father____age')).toHaveValue('32')

      await test.step('Enter an out-of-range age (5)', async () => {
        await page.locator('#father____age').fill('5')
        await page.getByRole('heading', { name: 'Birth' }).click()

        /*
         * Expected result: "Age must be between 12 and 120"
         */
        await expect(page.locator('#father____age_error')).toHaveText(
          'Age must be between 12 and 120'
        )
      })

      await test.step('Enter an out-of-range age (130)', async () => {
        await page.locator('#father____age').fill('130')
        await page.getByRole('heading', { name: 'Birth' }).click()

        /*
         * Expected result: "Age must be between 12 and 120"
         */
        await expect(page.locator('#father____age_error')).toHaveText(
          'Age must be between 12 and 120'
        )
        await page.locator('#father____age').fill('32')
      })

      await page.getByText('Exact date of birth unknown').click()
    })
  })

  await test.step('9. Validate the "Nationality" drop-down field', async () => {
    await page.locator('#father____nationality').click()
    await page.getByText('Gabon', { exact: true }).click()

    await expect(page.locator('#father____nationality')).toContainText(
      'Gabon'
    )
    await page.locator('#father____nationality').click()
    await page
      .locator('.react-select__option')
      .getByText('Farajaland', { exact: true })
      .click()
  })

  await test.step('10-11. Validate "Proof of identity" and "National ID"', async () => {
    for (const idType of ['Passport', 'Birth Registration Number', 'National ID']) {
      await page.locator('#father____idType').click()
      await page.getByText(idType, { exact: true }).click()

      await expect(page.getByText('ID Number')).toBeVisible()
    }

    await page.locator('#father____nid').fill('123456789')
    await page.getByRole('heading', { name: 'Birth' }).click()
    await expect(
      page.getByText(
        'The national ID can only be numeric and must be 10 digits long',
        { exact: true }
      )
    ).toBeVisible()

    await page.locator('#father____nid').fill('9876543210')
    await page.getByRole('heading', { name: 'Birth' }).click()
    await expect(
      page.getByText(
        'The national ID can only be numeric and must be 10 digits long',
        { exact: true }
      )
    ).not.toBeVisible()
  })

  await test.step('12. Validate Passport/Birth Registration Number field', async () => {
    await page.locator('#father____idType').click()
    await page.getByText('Passport', { exact: true }).click()
    await page.locator('#father____passport').fill('P1234567')
    await page.getByRole('heading', { name: 'Birth' }).click()

    await expect(page.locator('#father____passport_error')).toBeHidden()

    await page.locator('#father____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#father____nid').fill('9876543210')
  })

  await test.step('13. Validate "Same as mother\'s usual place of residence?"', async () => {
    await page.locator('#father____addressSameAs_YES').click()

    /*
     * Expected result: address fields should be hidden
     */
    await expect(page.locator('#country')).toBeHidden()

    await page.locator('#father____addressSameAs_NO').click()

    /*
     * Expected result: address fields should appear with default values
     */
    await expect(page.locator('#country')).toHaveText('Farajaland')
  })

  await test.step('14. Validate the Residence address section', async () => {
    await page.locator('#province').click()
    await page.getByText('Chuminga', { exact: true }).click()
    await page.locator('#district').click()
    await page.getByText('Nsali', { exact: true }).click()
    await page.locator('#village').click()
    await page.getByText('Oro', { exact: true }).click()

    await page.locator('#town').fill('Klow')
    await page.locator('#residentialArea').fill('Downtown')
    await page.locator('#street').fill('Main street')
    await page.locator('#number').fill('12')
    await page.locator('#zipCode').fill('1200')

    await expect(
      page.locator('#searchable-select-province .react-select__single-value')
    ).toHaveText('Chuminga')
  })

  await test.step('15-16. Validate Marital status and Level of education', async () => {
    await page.locator('#father____maritalStatus').click()
    await page.getByText('Widowed', { exact: true }).click()
    await expect(page.locator('#father____maritalStatus')).toContainText(
      'Widowed'
    )

    await page.locator('#father____educationalAttainment').click()
    await page.getByText('No schooling', { exact: true }).click()
    await expect(
      page.locator('#father____educationalAttainment')
    ).toContainText('No schooling')
  })

  await test.step('17. Validate "Occupation" field', async () => {
    await page.locator('#father____occupation').fill('Fisherman')
    await expect(page.locator('#father____occupation_error')).toBeHidden()
  })

  await test.step('18. "Continue" navigates to Supporting documents', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText('Upload supporting documents', { exact: true })
    ).toBeVisible()
  })
})

test('Validate Fathers details page - required field validation and NID uniqueness', async ({
  page
}) => {
  await beginAtFathersPage(page)

  await test.step('Leave everything null and check the review page', async () => {
    await goToSection(page, 'review')

    await expect(
      page
        .locator('[data-testid="father.name-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
    await expect(
      page
        .locator('[data-testid="father.dob-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
  })

  await test.step("The same National ID as the mother's is rejected as non-unique", async () => {
    await page.getByTestId('change-button-father.name').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#father____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#father____nid').fill('9876543210')

    /*
     * "Continue" from an edit-from-review page walks forward through the
     * remaining declare pages (here: Documents) back to Review - Mother's
     * details comes *before* Father's in the normal sequence, so it's
     * reached via its own "Change" button, not by continuing forward.
     */
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByTestId('change-button-mother.name').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#mother____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#mother____nid').fill('9876543210')
    await page.getByRole('heading', { name: 'Birth' }).click()

    /*
     * Expected result: "National id must be unique"
     */
    await expect(
      page.getByText('National id must be unique', { exact: true })
    ).toBeVisible()
  })
})
