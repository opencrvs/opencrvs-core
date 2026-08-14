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
import { REQUIRED_VALIDATION_ERROR } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Spouse details page"
 * (packages/testland/src/events/death/forms/pages/spouse.ts).
 *
 * Correction to the QA doc: its steps 12-13 (Phone number / Email fields)
 * look like a copy-paste from the informant QA case - `spouse.ts` defines
 * no phoneNo/email fields at all (only informant.ts does), so those two
 * steps are not exercised here.
 */

const beginAtSpousePage = async (
  page: Page,
  informantRelation: string = 'Son'
) => {
  await login(page)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#firstname').fill('Richard')
  await page.locator('#surname').fill('Doppler')
  await page.getByRole('button', { name: 'Continue' }).click()

  const dateOfDeath = new Date()
  dateOfDeath.setDate(dateOfDeath.getDate() - 5)
  const [yyyy, mm, dd] = dateOfDeath.toISOString().split('T')[0].split('-')
  await page.getByPlaceholder('dd').fill(dd)
  await page.getByPlaceholder('mm').fill(mm)
  await page.getByPlaceholder('yyyy').fill(yyyy)
  await page.locator('#eventDetails____placeOfDeath').click()
  await page.getByText('Health Institution', { exact: true }).click()
  await page
    .locator('#searchable-select-eventDetails____deathLocation input')
    .fill('ib')
  await page.getByText('Ibombo District Hospital').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText(informantRelation, { exact: true }).click()
  if (informantRelation !== 'Spouse') {
    await page.locator('#informant____email').fill('informant@opencrvs.dev')
  }
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText('Spouse details', { exact: true })
  ).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('Validate Spouse details page', async ({ page }) => {
  await beginAtSpousePage(page, 'Son')

  await test.step("1. Validate the checkbox's visibility depending on informant type", async () => {
    /*
     * Expected result: informant is not Spouse, so "Spouse's details are
     * not available" checkbox should show
     */
    await expect(
      page.getByText("Spouse's details are not available")
    ).toBeVisible()
  })

  await test.step('2. Validate "Deceased does not have spouse/ their details are unknown" checkbox', async () => {
    await page.getByText("Spouse's details are not available").click()

    /*
     * Expected result: Reason field appears and is mandatory; remaining
     * spouse detail fields are hidden
     */
    await expect(page.locator('#spouse____reason')).toBeVisible()
    await expect(page.locator('#firstname')).toBeHidden()

    await goToSection(page, 'review')
    await expect(
      page
        .locator('[data-testid="spouse.reason-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()

    await page.getByTestId('change-button-spouse.reason').click()
    /*
     * Clicking a review-page "Change" button first shows an "Edit
     * declaration?" confirmation dialog - it must be confirmed before the
     * underlying field becomes interactive again.
     */
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByText("Spouse's details are not available").click()

    /*
     * Expected result: Reason field hides and standard spouse fields
     * reappear
     */
    await expect(page.locator('#spouse____reason')).toBeHidden()
    await expect(page.locator('#firstname')).toBeVisible()
  })

  await test.step('3. Validate "First Name(s)" text field', async () => {
    for (const name of ['Richard the 3rd', 'John_Peter', 'John-Peter', "O'Neill"]) {
      await test.step(`Accept non-English/special-character name: ${name}`, async () => {
        await page.locator('#firstname').fill(name)
        await page.getByRole('heading', { name: 'Death' }).click()

        await expect(page.locator('#firstname_error')).toBeHidden()
      })
    }

    await test.step('Enter more than 32 English characters is clipped', async () => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator('#firstname').fill(LONG_NAME)
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(page.locator('#firstname')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
      await page.locator('#firstname').fill('Aisha')
    })

    await test.step('Reject a name containing an invalid character', async () => {
      await page.locator('#firstname').fill('Aisha@123')
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
          .locator('[data-testid="spouse.name-value"]')
          .getByText(
            "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')"
          )
      ).toBeVisible()

      await page.getByTestId('change-button-spouse.name').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.locator('#firstname').fill('Aisha')
    })
  })

  await test.step('4. Validate "Last Name" text field', async () => {
    const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
    await page.locator('#surname').fill(LONG_NAME)
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#surname')).toHaveValue(LONG_NAME.slice(0, 32))
    await page.locator('#surname').fill('Doppler')
  })

  await test.step('5. Validate the DOB field', async () => {
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill('1985')
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#spouse____dob_error')).toBeHidden()

    await test.step('Enter a future date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      const [yyyy, mm, dd] = futureDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Death' }).click()

      /*
       * Expected result: "Must be a valid Birthdate"
       */
      await expect(page.locator('#spouse____dob_error')).toHaveText(
        'Must be a valid Birthdate'
      )

      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1985')
      await page.getByRole('heading', { name: 'Death' }).click()
      await expect(page.locator('#spouse____dob_error')).toBeHidden()
    })
  })

  await test.step('Validate "Exact date of birth unknown" reveals the Age field and its range validator', async () => {
    await page.getByText('Exact date of birth unknown').click()

    /*
     * Expected result: "Age of spouse (at the time of event)" field
     * appears
     */
    await expect(
      page.getByText('Age of spouse (at the time of event)')
    ).toBeVisible()

    await page.locator('#spouse____age').fill('200')
    await page.getByRole('heading', { name: 'Death' }).click()

    /*
     * Expected result: "Age must be between 12 and 120"
     */
    await expect(page.locator('#spouse____age_error')).toHaveText(
      'Age must be between 12 and 120'
    )

    await page.locator('#spouse____age').fill('40')
    await page.getByRole('heading', { name: 'Death' }).click()
    await expect(page.locator('#spouse____age_error')).toBeHidden()

    // Uncheck so the DOB fields are used for the rest of the flow
    await page.getByText('Exact date of birth unknown').click()
  })

  await test.step('6. Validate the "Nationality" drop-down field', async () => {
    await page.locator('#spouse____nationality').click()
    await page.getByText('Holy See', { exact: true }).click()

    await expect(page.locator('#spouse____nationality')).toContainText(
      'Holy See'
    )
    await page.locator('#spouse____nationality').click()
    await page
      .locator('.react-select__option')
      .getByText('Farajaland', { exact: true })
      .click()
  })

  await test.step('7-8. Select "Type of ID" and validate "National ID"', async () => {
    await page.locator('#spouse____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await expect(page.locator('#spouse____nid')).toBeVisible()

    await page.locator('#spouse____nid').fill('123456789')
    await page.getByRole('heading', { name: 'Death' }).click()
    await expect(
      page.getByText(
        'The national ID can only be numeric and must be 10 digits long',
        { exact: true }
      )
    ).toBeVisible()

    await page.locator('#spouse____nid').fill('1234567890')
    await page.getByRole('heading', { name: 'Death' }).click()
    await expect(
      page.getByText(
        'The national ID can only be numeric and must be 10 digits long',
        { exact: true }
      )
    ).not.toBeVisible()
  })

  await test.step('9. Validate Passport/ Birth Registration Number field', async () => {
    await page.locator('#spouse____idType').click()
    await page.getByText('Passport', { exact: true }).click()
    await page.locator('#spouse____passport').fill('P1234567')
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#spouse____passport_error')).toBeHidden()

    await page.locator('#spouse____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#spouse____nid').fill('1234567890')
  })

  await test.step('10. Validate "Same as deceased\'s usual place of residence?" checkbox', async () => {
    await page.getByLabel('Yes', { exact: true }).check()
    await expect(page.locator('#country')).toBeHidden()

    await page.getByLabel('No', { exact: true }).check()
    await expect(page.locator('#country')).toHaveText('Farajaland')
  })

  await test.step('11. Validate the Residence section', async () => {
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

  await test.step('Validate spouse.address validator that only surfaces on the Review page', async () => {
    /*
     * isValidAdministrativeLeafLevel (spouse.address) is a cross-subfield
     * validator - unlike the scalar fields above (nid/dob), it renders no
     * inline "_error" element on this page; it only surfaces as the
     * Review page's row value. Step 11 above never actually selected a
     * village option (only opened the dropdown), so the address is
     * already incomplete.
     */
    await goToSection(page, 'review')

    /*
     * Expected result: "Invalid input"
     */
    await expect(
      page
        .locator('[data-testid="spouse.address-value"]')
        .getByText('Invalid input')
    ).toBeVisible()

    await page.getByTestId('change-button-spouse.address').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Actually pick a village this time, so the address is valid for the
    // rest of the flow.
    await page.locator('#village').click()
    await selectLocationOption(page, 'Mbondo')
  })

  await test.step('14. "Continue" navigates to the Supporting documents page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText('Upload supporting documents', { exact: true })
    ).toBeVisible()
  })
})

test('Spouse details page - hidden when informant is Spouse, shown otherwise', async ({
  page
}) => {
  await test.step('When informant is Spouse, the "details unavailable" checkbox is hidden', async () => {
    await beginAtSpousePage(page, 'Spouse')

    await expect(
      page.getByText("Spouse's details are not available")
    ).toBeHidden()

    /*
     * Expected result: spouse identity fields are still collected (the
     * informant IS the spouse)
     */
    await expect(page.locator('#firstname')).toBeVisible()
  })
})
