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
import { selectLocationOption } from '../helpers'
import { REQUIRED_VALIDATION_ERROR, openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Informant's details page when informant is not father/
 * mother" - the fields that only appear when the informant relation is
 * Grandfather/Grandmother/Brother/Sister/Legal guardian/Someone else.
 */

const beginAtInformantPage = async (page: Page) => {
  await login(page)
  await openBirthDeclaration(page)
  await page.locator('#firstname').fill('Rakibul')
  await page.locator('#surname').fill('Islam')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText("Informant's details")).toBeVisible()
}

trackAndDeleteCreatedEvents()

test("Validate Informant's details page when informant is not father/mother", async ({
  page
}) => {
  await beginAtInformantPage(page)

  await test.step('1. Open the Informant type dropdown', async () => {
    await page.locator('#informant____relation').click()

    /*
     * Expected result: exactly Mother, Father, Someone else, Grandfather,
     * Grandmother, Brother, Sister, Legal guardian
     */
    for (const option of [
      'Mother',
      'Father',
      'Someone else',
      'Grandfather',
      'Grandmother',
      'Brother',
      'Sister',
      'Legal guardian'
    ]) {
      await expect(page.getByText(option, { exact: true })).toBeVisible()
    }
    await page.getByText('Grandfather', { exact: true }).click()
  })

  await test.step('2. Selecting a non-Mother/Father type reveals the additional fields', async () => {
    /*
     * Expected result: Identity status, First name, Last name, Date of
     * birth, Nationality, Type of ID, Usual place of residence, Phone
     * number, Email should all be added
     */
    await expect(
      page.getByRole('button', { name: 'Scan QR code' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Authenticate with National ID system'
      })
    ).toBeVisible()
    await expect(page.locator('#firstname')).toBeVisible()
    await expect(page.locator('#surname')).toBeVisible()
    await expect(page.getByPlaceholder('dd')).toBeVisible()
    await expect(page.locator('#informant____nationality')).toBeVisible()
    await expect(page.locator('#informant____idType')).toBeVisible()
    await expect(page.locator('#informant____phoneNo')).toBeVisible()
    await expect(page.locator('#informant____email')).toBeVisible()
  })

  await test.step('3. Select "Someone else" shows the free-text relation field', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Someone else', { exact: true }).click()

    await expect(
      page.locator('#informant____other____relation')
    ).toBeVisible()
    await page.locator('#informant____other____relation').fill('Neighbour')

    // Restore Grandfather for the remaining steps
    await page.locator('#informant____relation').click()
    await page.getByText('Grandfather', { exact: true }).click()
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
    for (const name of [
      'Richard the 3rd',
      'John_Peter',
      'John-Peter',
      "O'Neill"
    ]) {
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

      /*
       * Expected result: should not be able to enter more than 32 English
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
          .locator('[data-testid="informant.name-value"]')
          .getByText(
            "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')"
          )
      ).toBeVisible()

      await page.getByTestId('change-button-informant.name').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.locator('#firstname').fill('Rakibul')
    })
  })

  await test.step('6. Validate "Last Name(s)" text field', async () => {
    await page.locator('#surname').fill('Islam')
    await expect(page.locator('#surname_error')).toBeHidden()
  })

  await test.step('7. Validate the DOB field', async () => {
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill('1970')
    await page.getByRole('heading', { name: 'Birth' }).click()

    /*
     * Expected result: should accept the DOB date
     */
    await expect(page.locator('#informant____dob_error')).toBeHidden()
  })

  await test.step('7a. Validate the DOB field rejects a future date', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const [yyyy, mm, dd] = tomorrow.toISOString().split('T')[0].split('-')

    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await page.getByRole('heading', { name: 'Birth' }).click()

    /*
     * Expected result: "Must be a valid birth date"
     */
    await expect(page.locator('#informant____dob_error')).toHaveText(
      'Must be a valid birth date'
    )

    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill('1970')
    await page.getByRole('heading', { name: 'Birth' }).click()
    await expect(page.locator('#informant____dob_error')).toBeHidden()
  })

  await test.step("7b. Validate the DOB field rejects a date after the child's birth date", async () => {
    /*
     * child.dob is still unset at this point (beginAtInformantPage only
     * fills the child's name) - give it a fixed value via the review
     * page's "Change" link so there's something to compare against.
     */
    await goToSection(page, 'review')
    await page.getByTestId('change-button-child.dob').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    const childDob = new Date()
    childDob.setDate(childDob.getDate() - 10)
    const [cyyyy, cmm, cdd] = childDob.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(cdd)
    await page.getByPlaceholder('mm').fill(cmm)
    await page.getByPlaceholder('yyyy').fill(cyyyy)

    await goToSection(page, 'review')
    await page.getByTestId('change-button-informant.dob').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    const afterChildDob = new Date()
    afterChildDob.setDate(afterChildDob.getDate() - 5)
    const [yyyy, mm, dd] = afterChildDob.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await page.getByRole('heading', { name: 'Birth' }).click()

    /*
     * Expected result: "Birth date must be before child's birth date"
     */
    await expect(page.locator('#informant____dob_error')).toHaveText(
      "Birth date must be before child's birth date"
    )

    // Reset to a valid past DOB so later steps aren't gated by this error
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill('1970')
    await page.getByRole('heading', { name: 'Birth' }).click()
    await expect(page.locator('#informant____dob_error')).toBeHidden()
  })

  await test.step('8. Validate the "Nationality" drop-down field', async () => {
    await page.locator('#informant____nationality').click()
    await page.getByText('Holy See', { exact: true }).click()

    await expect(page.locator('#informant____nationality')).toContainText(
      'Holy See'
    )
  })

  await test.step('9. Select "Proof of identity" and validate "National ID"', async () => {
    await page.locator('#informant____idType').click()
    await page.getByText('National ID', { exact: true }).click()

    /*
     * Expected result: should show the ID number field
     */
    await expect(page.locator('#informant____nid')).toBeVisible()
  })

  await test.step('10. Validate "National ID" text field', async () => {
    await test.step('Enter less than 10 digits', async () => {
      await page.locator('#informant____nid').fill('123456789')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()
    })

    await test.step('Enter 10 digits', async () => {
      await page.locator('#informant____nid').fill('1234567890')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).not.toBeVisible()
    })

    await test.step('Enter more than 10 digits', async () => {
      await page.locator('#informant____nid').fill('12345678901')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()

      await page.locator('#informant____nid').fill('1234567890')
    })
  })

  await test.step('11. Validate Passport/ Birth certificate field', async () => {
    await page.locator('#informant____idType').click()
    await page.getByText('Passport', { exact: true }).click()
    await page.locator('#informant____passport').fill('P1234567')
    await page.getByRole('heading', { name: 'Birth' }).click()

    await expect(page.locator('#informant____passport_error')).toBeHidden()
  })

  await test.step('12. Validate the Residence section', async () => {
    await expect(page.locator('#country')).toHaveText('Farajaland')
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()

    await page.locator('#town').fill('Klow')
    await page.locator('#residentialArea').fill('Downtown')
    await page.locator('#street').fill('Main street')
    await page.locator('#number').fill('12')
    await page.locator('#zipCode').fill('1200')

    await expect(
      page.locator('#searchable-select-province .react-select__single-value')
    ).toHaveText('Central')
    await expect(page.locator('#town')).toHaveValue('Klow')
  })

  await test.step('12a. Leaving the village empty shows an invalid-address error', async () => {
    /*
     * Expected result: "Invalid input" - province/district were picked in
     * step 12, but no village was ever chosen (the #village click there
     * only opens the dropdown). Like the NAME field above, this ADDRESS
     * field's error is suppressed on this page itself and only surfaces
     * on the review row.
     */
    await goToSection(page, 'review')
    await expect(
      page
        .locator('[data-testid="informant.address-value"]')
        .getByText('Invalid input')
    ).toBeVisible()

    await page.getByTestId('change-button-informant.address').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Actually pick a village this time, so the address is valid for the
    // rest of the flow.
    await page.locator('#village').click()
    await selectLocationOption(page, 'Mbondo')
  })

  await test.step('13. Validate the "Phone number" field', async () => {
    await test.step('Enter a number not starting with 07/09', async () => {
      await page.locator('#informant____phoneNo').fill('0123456789')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#informant____phoneNo_error')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    await test.step('Enter a number with the wrong length', async () => {
      await page.locator('#informant____phoneNo').fill('07123')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#informant____phoneNo_error')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    await test.step('Enter a valid 10 digit number starting with 0', async () => {
      await page.locator('#informant____phoneNo').fill('0712345678')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#informant____phoneNo_error')).toBeHidden()
    })
  })

  await test.step('14. Validate the "Email" field', async () => {
    await test.step('Enter an invalid email address', async () => {
      await page.locator('#informant____email').fill('not-an-email')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#informant____email_error')).toBeVisible()
    })

    await test.step('Enter a valid email address', async () => {
      await page.locator('#informant____email').fill('rakibul@opencrvs.dev')
      await page.getByRole('heading', { name: 'Birth' }).click()

      await expect(page.locator('#informant____email_error')).toBeHidden()
    })
  })

  await test.step('15. Values persist on Back/Continue navigation', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.getByText("Mother's details", { exact: true })
    ).toBeVisible()

    await page.goBack()

    /*
     * Expected result: previously entered values remain populated
     */
    await expect(page.locator('#firstname')).toHaveValue('Rakibul')
    await expect(page.locator('#surname')).toHaveValue('Islam')
  })

  await test.step('16. "Continue" navigates to the Mother\'s details page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText("Mother's details", { exact: true })
    ).toBeVisible()
  })
})

test("Validate Informant's details page when informant is not father/mother - required field validation", async ({
  page
}) => {
  await beginAtInformantPage(page)
  await page.locator('#informant____relation').click()
  await page.getByText('Grandfather', { exact: true }).click()

  await goToSection(page, 'review')

  /*
   * Expected result: "Required for registration" for name, DOB and email
   */
  await expect(
    page
      .locator('[data-testid="informant.name-value"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
  await expect(
    page
      .locator('[data-testid="informant.dob-value"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
  await expect(
    page
      .locator('[data-testid="informant.email-value"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
})
