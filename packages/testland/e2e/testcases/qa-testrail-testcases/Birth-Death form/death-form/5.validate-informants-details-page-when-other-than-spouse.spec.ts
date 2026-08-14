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
 * QA case: "Validate the Informant's details page when informant is other
 * than spouse" - the fields that only appear when the informant relation is
 * Son/Daughter/Son in law/Daughter in law/Mother/Father/Grandson/
 * Granddaughter/Someone else.
 */

const beginAtInformantPage = async (page: Page) => {
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

  await expect(page.getByText("Informant's details")).toBeVisible()
}

trackAndDeleteCreatedEvents()

test("Validate the Informant's details page when informant is other than spouse", async ({
  page
}) => {
  await beginAtInformantPage(page)

  await test.step('1. Select Son/Daughter/Son in law/Daughter in law/Mother/Father/Grandson/Granddaughter', async () => {
    await page.locator('#informant____relation').click()
    for (const option of [
      'Son',
      'Daughter',
      'Son in law',
      'Daughter in law',
      'Mother',
      'Father',
      'Grandson',
      'Granddaughter',
      'Someone else'
    ]) {
      await expect(page.getByText(option, { exact: true })).toBeVisible()
    }
    await page.getByText('Son', { exact: true }).click()

    /*
     * Expected result: should add the other fields - First name(s), Last
     * name, Date of birth, Nationality, Type of ID, Usual place of
     * residence
     */
    await expect(page.locator('#firstname')).toBeVisible()
    await expect(page.locator('#surname')).toBeVisible()
    await expect(page.getByPlaceholder('dd')).toBeVisible()
    await expect(page.locator('#informant____nationality')).toBeVisible()
    await expect(page.locator('#informant____idType')).toBeVisible()
  })

  await test.step('2. Select "Someone else" reveals "Relationship to deceased"', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Someone else', { exact: true }).click()

    /*
     * Note: per-page "Continue" does not block on empty required fields -
     * it navigates straight through instead of showing inline errors.
     * Required-field validation for this page is covered separately via
     * the Review page (see e.g. 2.validate-deceaseds-details-page.spec.ts).
     */
    await page.locator('#informant____other____relation').fill('Neighbour')

    // Restore Son for the remaining steps
    await page.locator('#informant____relation').click()
    await page.getByText('Son', { exact: true }).click()
  })

  await test.step('3. Validate "First Name(s)" text field', async () => {
    for (const name of [
      'Richard the 3rd',
      'John_Peter',
      'John-Peter',
      "O'Neill"
    ]) {
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
      await page.locator('#firstname').fill('Rakibul')
    })
  })

  await test.step('4. Validate "Last Name" text field', async () => {
    await page.locator('#surname').fill('Islam')
    await expect(page.locator('#surname_error')).toBeHidden()
  })

  await test.step('5. Validate the DOB field', async () => {
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill('1970')
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#informant____dob_error')).toBeHidden()

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
      await expect(page.locator('#informant____dob_error')).toHaveText(
        'Must be a valid Birthdate'
      )

      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1970')
      await page.getByRole('heading', { name: 'Death' }).click()
      await expect(page.locator('#informant____dob_error')).toBeHidden()
    })
  })

  await test.step('6. Validate the "Nationality" drop-down field', async () => {
    await page.locator('#informant____nationality').click()
    await page.getByText('Holy See', { exact: true }).click()

    await expect(page.locator('#informant____nationality')).toContainText(
      'Holy See'
    )
    await page.locator('#informant____nationality').click()
    await page
      .locator('.react-select__option')
      .getByText('Farajaland', { exact: true })
      .click()
  })

  await test.step('7-8. Select "Type of ID" and validate "National ID"', async () => {
    await page.locator('#informant____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await expect(page.locator('#informant____nid')).toBeVisible()

    await page.locator('#informant____nid').fill('123456789')
    await page.getByRole('heading', { name: 'Death' }).click()
    await expect(
      page.getByText(
        'The national ID can only be numeric and must be 10 digits long',
        { exact: true }
      )
    ).toBeVisible()

    await page.locator('#informant____nid').fill('1234567890')
    await page.getByRole('heading', { name: 'Death' }).click()
    await expect(
      page.getByText(
        'The national ID can only be numeric and must be 10 digits long',
        { exact: true }
      )
    ).not.toBeVisible()
  })

  await test.step('9. Validate Passport/ Birth certificate field', async () => {
    await page.locator('#informant____idType').click()
    await page.getByText('Passport', { exact: true }).click()
    await page.locator('#informant____passport').fill('P1234567')
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#informant____passport_error')).toBeHidden()

    await page.locator('#informant____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#informant____nid').fill('1234567890')
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

  await test.step('11a. Validate informant.name and informant.address validators that only surface on the Review page', async () => {
    /*
     * invalidNameValidator (informant.name) and isValidAdministrativeLeafLevel
     * (informant.address) are cross-subfield validators - unlike the scalar
     * fields above (nid/dob/phoneNo), they render no inline "_error" element
     * on this page; they only surface as the Review page's row value. Step
     * 11 already left the address incomplete (no village selected), so only
     * firstname needs to be pushed into an invalid state here.
     */
    await page.locator('#firstname').fill('Rakibul@123')

    await goToSection(page, 'review')

    /*
     * Expected result: "Input contains invalid characters. Please use
     * only letters (a-z, A-Z), numbers (0-9), hyphens (-) and
     * apostrophes(')"
     */
    await expect(
      page
        .locator('[data-testid="informant.name-value"]')
        .getByText(
          "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')"
        )
    ).toBeVisible()

    /*
     * Expected result: "Invalid input"
     */
    await expect(
      page
        .locator('[data-testid="informant.address-value"]')
        .getByText('Invalid input')
    ).toBeVisible()

    await page.getByTestId('change-button-informant.name').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#firstname').fill('Rakibul')
  })

  await test.step('12. Validate the "Phone number" field', async () => {
    await test.step('Enter a number not matching the required format', async () => {
      await page.locator('#informant____phoneNo').fill('1234567890')
      await page.getByRole('heading', { name: 'Death' }).click()

      /*
       * Expected result: "Must be a valid 10 digit number that starts
       * with 0(7|9)"
       */
      await expect(page.locator('#informant____phoneNo_error')).toHaveText(
        'Must be a valid 10 digit number that starts with 0(7|9)'
      )
    })

    await page.locator('#informant____phoneNo').fill('0712345678')
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#informant____phoneNo_error')).toBeHidden()
  })

  await test.step('13. Validate the "Email" field', async () => {
    await page.locator('#informant____email').fill('son@opencrvs.dev')
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#informant____email_error')).toBeHidden()
  })

  await test.step('14. "Continue" navigates to the Spouse details page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText('Spouse details', { exact: true })
    ).toBeVisible()
  })
})

test("Validate the Informant's details page when informant is other than spouse - required field validation", async ({
  page
}) => {
  await beginAtInformantPage(page)
  await page.locator('#informant____relation').click()
  await page.getByText('Son', { exact: true }).click()

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
