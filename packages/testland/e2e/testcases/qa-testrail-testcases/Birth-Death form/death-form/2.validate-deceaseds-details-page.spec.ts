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
 * QA case: "Validate the deceased's details page"
 * (packages/testland/src/events/death/forms/pages/deceased.ts)
 */

const openDeathDeclaration = async (page: Page) => {
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText("Deceased's details")).toBeVisible()
}

trackAndDeleteCreatedEvents()

test("Validate the deceased's details page", async ({ page }) => {
  await login(page)
  await openDeathDeclaration(page)

  await test.step('1. Validate "First Name(s)" text field', async () => {
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
          .locator('[data-testid="deceased.name-value"]')
          .getByText(
            "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')"
          )
      ).toBeVisible()

      await page.getByTestId('change-button-deceased.name').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.locator('#firstname').fill('Rakibul')
    })
  })

  await test.step('2. Validate "Last name" text field', async () => {
    const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
    await page.locator('#surname').fill(LONG_NAME)
    await page.getByRole('heading', { name: 'Death' }).click()

    /*
     * Expected result: should not accept more than 32 characters
     */
    await expect(page.locator('#surname')).toHaveValue(LONG_NAME.slice(0, 32))
    await page.locator('#surname').fill('Islam')
  })

  await test.step('3. Validate the Sex dropdown field', async () => {
    for (const sex of ['Male', 'Female', 'Unknown']) {
      await test.step(`Select dropdown value: ${sex}`, async () => {
        await page.locator('#deceased____gender').click()
        await page.getByText(sex, { exact: true }).click()

        await expect(
          page.locator('#deceased____gender', { hasText: sex })
        ).toBeVisible()
      })
    }
  })

  await test.step('4. Validate the DOB field', async () => {
    await test.step('Enter a valid past date and focus out', async () => {
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1960')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(page.locator('#deceased____dob_error')).toBeHidden()
    })

    await test.step('Enter a future date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const [yyyy, mm, dd] = futureDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Death' }).click()

      /*
       * Expected result: "Must be a valid Birthdate"
       */
      await expect(page.locator('#deceased____dob_error')).toHaveText(
        'Must be a valid Birthdate'
      )

      // Restore a valid past date for the rest of the flow
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1960')
      await page.getByRole('heading', { name: 'Death' }).click()
      await expect(page.locator('#deceased____dob_error')).toBeHidden()
    })
  })

  await test.step('5. Validate the "Nationality" drop-down field', async () => {
    await page.locator('#deceased____nationality').click()
    await page.getByText('Holy See', { exact: true }).click()

    await expect(page.locator('#deceased____nationality')).toContainText(
      'Holy See'
    )
    await page.locator('#deceased____nationality').click()
    /*
     * Scoped to the open dropdown's own option list - a bare page-wide
     * getByText('Farajaland') also matches the "Country" field's own
     * single-value badge further down the (still-rendered) address
     * section, since Farajaland is that field's default too.
     */
    await page
      .locator('.react-select__option')
      .getByText('Farajaland', { exact: true })
      .click()
  })

  await test.step('6-7. Validate "Proof of identity" and "National ID"', async () => {
    for (const idType of ['Passport', 'Birth Registration Number', 'National ID']) {
      await page.locator('#deceased____idType').click()
      await page.getByText(idType, { exact: true }).click()

      /*
       * Expected result: should show Document No. for every ID type
       */
      await expect(page.getByText('ID Number')).toBeVisible()
    }

    await test.step('Enter less than 10 digits', async () => {
      await page.locator('#deceased____nid').fill('123456789')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()
    })

    await test.step('Enter 10 digits', async () => {
      await page.locator('#deceased____nid').fill('1234567890')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).not.toBeVisible()
    })

    await test.step('Enter more than 10 digits', async () => {
      await page.locator('#deceased____nid').fill('12345678901')
      await page.getByRole('heading', { name: 'Death' }).click()

      await expect(
        page.getByText(
          'The national ID can only be numeric and must be 10 digits long',
          { exact: true }
        )
      ).toBeVisible()

      await page.locator('#deceased____nid').fill('1234567890')
    })
  })

  await test.step('8. Validate Passport/Birth Registration Number field', async () => {
    await page.locator('#deceased____idType').click()
    await page.getByText('Passport', { exact: true }).click()
    await page.locator('#deceased____passport').fill('P1234567')
    await page.getByRole('heading', { name: 'Death' }).click()

    await expect(page.locator('#deceased____passport_error')).toBeHidden()

    await page.locator('#deceased____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#deceased____nid').fill('1234567890')
  })

  await test.step('9. Validate the "Marital Status" drop-down field', async () => {
    await page.locator('#deceased____maritalStatus').click()
    await page.getByText('Widowed', { exact: true }).click()

    await expect(page.locator('#deceased____maritalStatus')).toContainText(
      'Widowed'
    )
  })

  await test.step('10. Validate "No. of dependants" field', async () => {
    await page.locator('#deceased____numberOfDependants').fill('2')
    await expect(
      page.locator('#deceased____numberOfDependants_error')
    ).toBeHidden()

    /*
     * Expected result: should accept NULL as it is an optional field
     */
    await page.locator('#deceased____numberOfDependants').fill('')
    await expect(
      page.locator('#deceased____numberOfDependants_error')
    ).toBeHidden()
  })

  await test.step('11. Validate the Residence section', async () => {
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

  await test.step('12. Click "Continue"', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: users will redirect to the Event details page
     */
    await expect(page.getByText('Event details')).toBeVisible()
  })
})

test("Validate the deceased's details page - required field validation and NID uniqueness", async ({
  page
}) => {
  await login(page)
  await openDeathDeclaration(page)

  await test.step('Leave every field null and check the required errors on Review', async () => {
    await goToSection(page, 'review')

    await expect(
      page
        .locator('[data-testid="deceased.name-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
    await expect(
      page
        .locator('[data-testid="deceased.gender-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
    await expect(
      page
        .locator('[data-testid="deceased.dob-value"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
    /*
     * Unlike the scalar fields above, an empty ADDRESS field fails its own
     * `isValidAdministrativeLeafLevel()` validator rather than the generic
     * required check, so its review row shows "Invalid input" instead of
     * "Required for registration" (see deceased.ts's address field
     * validation message, id: 'error.invalidInput').
     */
    await expect(
      page
        .locator('[data-testid="deceased.address-value"]')
        .getByText('Invalid input')
    ).toBeVisible()
  })

  await test.step("Entering the same National ID as the informant's is rejected as non-unique", async () => {
    await page.getByTestId('change-button-deceased.name').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#deceased____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#deceased____nid').fill('1122334455')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Continue through Event details to the Informant page
    await expect(page.getByText('Event details')).toBeVisible()
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill(String(new Date().getFullYear()))
    await page.locator('#eventDetails____placeOfDeath').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#searchable-select-eventDetails____deathLocation input')
      .fill('ib')
    await page.getByText('Ibombo District Hospital').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText("Informant's details")).toBeVisible()
    await page.locator('#informant____relation').click()
    await page.getByText('Son', { exact: true }).click()
    await page.locator('#informant____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#informant____nid').fill('1122334455')
    await page.getByRole('heading', { name: 'Death' }).click()

    /*
     * Expected result: "National id must be unique"
     */
    await expect(
      page.getByText('National id must be unique', { exact: true })
    ).toBeVisible()
  })
})

test("Validate the deceased's details page - age and DOB format validators", async ({
  page
}) => {
  await login(page)
  await openDeathDeclaration(page)

  await test.step('"Exact date of birth unknown" - age outside 0-120 is rejected', async () => {
    await page.getByText('Exact date of birth unknown').click()

    await page.locator('#deceased____age').fill('150')
    await page.getByRole('heading', { name: 'Death' }).click()

    /*
     * Expected result: "Age must be between 0 and 120"
     */
    await expect(page.locator('#deceased____age_error')).toHaveText(
      'Age must be between 0 and 120'
    )

    // Uncheck "unknown" so the DOB fields are used for the next step
    await page.getByText('Exact date of birth unknown').click()
  })

  await test.step('Date of birth later than the date of death is rejected', async () => {
    const dob = new Date()
    dob.setDate(dob.getDate() - 5)
    const [dyyyy, dmm, ddd] = dob.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(ddd)
    await page.getByPlaceholder('mm').fill(dmm)
    await page.getByPlaceholder('yyyy').fill(dyyyy)
    await page.getByRole('button', { name: 'Continue' }).click()

    // ...but the date of death is set earlier than that DOB
    await expect(page.getByText('Event details')).toBeVisible()
    const dateOfDeath = new Date()
    dateOfDeath.setDate(dateOfDeath.getDate() - 10)
    const [yyyy, mm, dd] = dateOfDeath.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await page.getByRole('heading', { name: 'Death' }).click()

    await goToSection(page, 'review')

    /*
     * Expected result: "Date of birth must be before the date of death"
     */
    await expect(
      page
        .locator('[data-testid="deceased.dob-value"]')
        .getByText('Date of birth must be before the date of death')
    ).toBeVisible()
  })
})
