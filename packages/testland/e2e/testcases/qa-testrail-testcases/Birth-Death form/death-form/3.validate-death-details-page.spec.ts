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
import { REQUIRED_VALIDATION_ERROR } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Death details page" - the QA doc's "Event details"
 * page (packages/testland/src/events/death/forms/pages/eventDetails.ts),
 * including its cause-of-death gating into either a plain Description
 * textarea (Lay reported/Verbal autopsy) or the separate ICD-10
 * causeOfDeathDetails page (Physician/Medically Certified).
 */

const beginAtEventDetailsPage = async (page: Page) => {
  await login(page)
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#firstname').fill('Richard')
  await page.locator('#surname').fill('Doppler')

  /*
   * The deceased's own DOB must be fixed for the "Date of death must be
   * after the deceased's birth date" validation (further below) to have
   * a known value to compare against.
   */
  await page.getByPlaceholder('dd').fill('01')
  await page.getByPlaceholder('mm').fill('01')
  await page.getByPlaceholder('yyyy').fill('1960')

  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByText('Event details')).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('Validate Death details page', async ({ page }) => {
  await beginAtEventDetailsPage(page)

  await test.step('1. Validate the Date of Death field', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const [yyyy, mm, dd] = yesterday.toISOString().split('T')[0].split('-')

    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await page.getByRole('heading', { name: 'Death' }).click()

    /*
     * Expected result: should accept the DOD date
     */
    await expect(page.locator('#eventDetails____date_error')).toBeHidden()

    await test.step('Enter a future date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const [fyyyy, fmm, fdd] = futureDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(fdd)
      await page.getByPlaceholder('mm').fill(fmm)
      await page.getByPlaceholder('yyyy').fill(fyyyy)
      await page.getByRole('heading', { name: 'Death' }).click()

      /*
       * Expected result: "Must be a valid date"
       */
      await expect(page.locator('#eventDetails____date_error')).toHaveText(
        'Must be a valid date'
      )

      // Restore a valid past date before the next check
      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Death' }).click()
      await expect(page.locator('#eventDetails____date_error')).toBeHidden()
    })

    await test.step("Enter a date of death before the deceased's DOB", async () => {
      await page.getByPlaceholder('dd').fill('01')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('1959')
      await page.getByRole('heading', { name: 'Death' }).click()

      /*
       * Expected result: "Date of death must be after the deceased's
       * birth date"
       */
      await expect(page.locator('#eventDetails____date_error')).toHaveText(
        "Date of death must be after the deceased's birth date"
      )

      // Restore a valid date of death for the rest of the flow
      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByRole('heading', { name: 'Death' }).click()
      await expect(page.locator('#eventDetails____date_error')).toBeHidden()
    })
  })

  await test.step('2-3. Validate "Place of death"', async () => {
    await test.step('Select "Health Institution" and enter a facility', async () => {
      await page.locator('#eventDetails____placeOfDeath').click()
      await page.getByText('Health Institution', { exact: true }).click()

      await expect(
        page.locator('#eventDetails____deathLocation')
      ).toBeVisible()

      await page
        .locator('#searchable-select-eventDetails____deathLocation input')
        .fill('ib')
      await page.getByText('Ibombo District Hospital').click()

      await expect(
        page.locator(
          '#searchable-select-eventDetails____deathLocation .react-select__single-value'
        )
      ).toHaveText('Ibombo District Hospital')
    })

    await test.step("Select \"Deceased's usual place of residence\"", async () => {
      await page.locator('#eventDetails____placeOfDeath').click()
      await page
        .getByText("Deceased's usual place of residence", { exact: true })
        .click()

      /*
       * Expected result: no separate address block is shown - the
       * deceased's own residence (collected on the deceased's details
       * page) is reused
       */
      await expect(
        page.locator('#eventDetails____deathLocation')
      ).toBeHidden()
      await expect(
        page.locator('#eventDetails____deathLocationOther-form-input')
      ).toBeHidden()
    })

    await test.step('Select "Other" and enter an address', async () => {
      await page.locator('#eventDetails____placeOfDeath').click()
      await page.getByText('Other', { exact: true }).click()

      await expect(
        page.locator('#eventDetails____deathLocationOther-form-input')
      ).toBeVisible()
      await expect(page.locator('#country')).toHaveText('Farajaland')

      /*
       * This field's `allowedLocations` is scoped to the user's own
       * jurisdiction (packages/testland/src/events/death/forms/pages/
       * eventDetails.ts's deathLocationOther config) - with only one
       * valid choice, province/district render pre-filled and locked
       * rather than as an open combobox, unlike the other address fields
       * in this suite.
       */
      await expect(
        page.locator('#searchable-select-province .react-select__single-value')
      ).toHaveText('Central')
      await expect(
        page.locator('#searchable-select-district .react-select__single-value')
      ).toHaveText('Ibombo')
      await page.locator('#town').fill('Klow')
      await page.locator('#residentialArea').fill('Downtown')
      await page.locator('#street').fill('Main street')
      await page.locator('#number').fill('12')
      await page.locator('#zipCode').fill('1200')
    })
  })

  await test.step('4. Validate "Manner of death"', async () => {
    await page.locator('#eventDetails____mannerOfDeath').click()
    await page.getByText('Natural causes', { exact: true }).click()

    await expect(page.locator('#eventDetails____mannerOfDeath')).toContainText(
      'Natural causes'
    )
  })

  await test.step('5-6. Validate "Cause of death has been established" and its Source', async () => {
    await test.step('Leave the checkbox unchecked hides Source of cause of death', async () => {
      await expect(
        page.getByText('Source of cause of death')
      ).toBeHidden()
    })

    await test.step('Checking it shows "Source of cause of death"', async () => {
      await page.getByText('Cause of death has been established').click()

      await expect(page.getByText('Source of cause of death')).toBeVisible()
    })

    await test.step('Selecting "Lay reported" shows the plain Description field', async () => {
      await page.locator('#eventDetails____sourceCauseDeath').click()
      await page.getByText('Lay reported', { exact: true }).click()

      // Not { exact: true } - the label renders as "Description *".
      await expect(page.getByText('Description')).toBeVisible()
      await page.locator('#eventDetails____description').fill('Fell ill suddenly.')
    })

    await test.step('Selecting "Physician" instead routes to the ICD-10 cause-of-death page', async () => {
      await page.locator('#eventDetails____sourceCauseDeath').click()
      await page.getByText('Physician', { exact: true }).click()

      /*
       * Expected result: "Description" field hides - the ICD-10 page is
       * used instead
       */
      await expect(page.getByText('Description', { exact: true })).toBeHidden()
    })
  })

  await test.step('7. Click "Continue" and fill the ICD-10 cause-of-death page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: navigates to the Cause of death details page
     */
    await expect(page.getByText('A. Cause of death')).toBeVisible()

    await test.step('Selecting "Other" and entering text with a semicolon shows "Must not contain semicolon(s)"', async () => {
      await page
        .locator('#causeOfDeathDetails____causeOfDeathA____symptom____one')
        .click()
      await page.getByText('Other', { exact: true }).click()

      await expect(
        page.locator(
          '#causeOfDeathDetails____causeOfDeathA____symptom____one____other'
        )
      ).toBeVisible()

      await page
        .locator(
          '#causeOfDeathDetails____causeOfDeathA____symptom____one____other'
        )
        .fill('Sepsis; unspecified')
      await page.getByRole('heading', { name: 'Death' }).click()

      /*
       * Expected result: "Must not contain semicolon(s)"
       */
      await expect(
        page.locator(
          '#causeOfDeathDetails____causeOfDeathA____symptom____one____other_error'
        )
      ).toHaveText('Must not contain semicolon(s)')
    })

    // Real ICD-10 term already proven against the lookup API in
    // death/declaration/death-declaration-1.spec.ts:65,192-198.
    await page
      .locator('#causeOfDeathDetails____causeOfDeathA____symptom____one')
      .fill('Sepsis, unspecified')
    await page.getByText('Sepsis, unspecified', { exact: true }).click()
    await page
      .locator('#causeOfDeathDetails____causeOfDeathA____interval')
      .fill('2')
    await page
      .locator('#causeOfDeathDetails____causeOfDeathA____interval-form-input')
      .getByTestId('select__unit')
      .click()
    await page.getByText('Days', { exact: true }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: navigates to the Informant details page
     */
    await expect(page.getByText("Informant's details")).toBeVisible()
  })
})

test('Validate Death details page - required field validation', async ({
  page
}) => {
  await beginAtEventDetailsPage(page)

  await goToSection(page, 'review')

  /*
   * Expected result: "Required for registration" for date of death and
   * place of death
   */
  await expect(
    page
      .locator('[data-testid="eventDetails.date-value"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
  await expect(
    page.locator('[data-testid="eventDetails.placeOfDeath-value"]')
  ).toHaveText(REQUIRED_VALIDATION_ERROR)
})

test('Validate Death details page - deathLocationOther incomplete address validation', async ({
  page
}) => {
  await beginAtEventDetailsPage(page)

  await page.locator('#eventDetails____placeOfDeath').click()
  await page.getByText('Other', { exact: true }).click()

  await goToSection(page, 'review')

  /*
   * Expected result: "Invalid input" - province/district are pre-filled
   * and locked to the user's own jurisdiction, but no village was ever
   * selected, so the address falls short of the required leaf
   * administrative level (see eventDetails.ts's deathLocationOther field
   * validation, id: 'error.invalidInput').
   */
  await expect(
    page
      .locator('[data-testid="eventDetails.deathLocationOther-value"]')
      .getByText('Invalid input')
  ).toBeVisible()
})
