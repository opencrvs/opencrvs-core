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
import { expect, test } from '@playwright/test'
import { login, waitForActionResponses } from '../../../../helpers'
import { selectLocationOption } from '../helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Death event declaration" - full walkthrough of the death
 * declaration form, page by page, plus the Save & Exit / Exit / Delete
 * declaration actions available from any page. Mirrors
 * ../birth/1.birth-event-declaration.spec.ts structurally; death's page
 * order is Deceased -> Event details -> Informant -> Spouse -> Documents
 * (packages/testland/src/events/death/forms/declaration.ts:64-72), and the
 * death review page has no Alpha print button (DEATH_DECLARATION_REVIEW
 * only has review.comment/review.signature, unlike birth's review.print).
 */

// Edge-case deceased name (birth sample-data sheet's sample 5: an ordinal
// suffix) - reused here since the sheet has no death-specific sample data.
const DECEASED_NAME = { firstname: 'Richard the 3rd', surname: 'Doppler' }

trackAndDeleteCreatedEvents()

test('Death event declaration', async ({ page }) => {
  await test.step('1. Click the + (Plus) sign', async () => {
    await login(page)

    await page.click('#header-new-event')
    await expect(page.getByText('New Declaration')).toBeVisible()
  })

  await test.step('2. Validate event selection page', async () => {
    /*
     * Expected result: should show radio buttons of the events, a
     * Continue button and an Exit button.
     */
    await expect(page.getByLabel('Death')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()
    /*
     * Expected result: "Please select the type of event"
     */
    await expect(
      page.getByText('Please select the type of event')
    ).toBeVisible()

    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should navigate to the "Introduction" page
     */
    await expect(
      page.getByText(
        'Introduce the death registration process to the informant'
      )
    ).toBeVisible()
  })

  await test.step('3. Validate "Introduction" page', async () => {
    /*
     * Expected result: should show Continue, Exit, Save & exit and the
     * 3-dot menu (delete option)
     */
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Exit', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Save & Exit' })
    ).toBeVisible()

    await page.locator('#event-menu-dropdownMenu').click()
    await expect(
      page
        .locator('#event-menu-dropdownMenu')
        .getByRole('listitem')
        .filter({ hasText: 'Delete declaration' })
    ).toBeVisible()
    await page.locator('#event-menu-dropdownMenu').click()

    /*
     * Expected result: verbiage of death event introduction
     */
    await expect(
      page.getByText('I am going to help you make a declaration of death.')
    ).toBeVisible()
    await expect(
      page.getByText(
        'As the legal Informant it is important that all the information provided by you is accurate.'
      )
    ).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should navigate to the "Deceased details" page
     */
    await expect(page.getByText("Deceased's details")).toBeVisible()
  })

  await test.step('4. Validate "Deceased Details" page', async () => {
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Exit', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Save & Exit' })
    ).toBeVisible()

    await page.locator('#firstname').fill(DECEASED_NAME.firstname)
    await page.locator('#surname').fill(DECEASED_NAME.surname)
    await page.locator('#deceased____gender').click()
    await page.getByText('Male', { exact: true }).click()

    const dob = new Date()
    dob.setDate(dob.getDate() - 365 * 40)
    const [dyyyy, dmm, ddd] = dob.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(ddd)
    await page.getByPlaceholder('mm').fill(dmm)
    await page.getByPlaceholder('yyyy').fill(dyyyy)

    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()

    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should navigate to the "Event details" page
     */
    await expect(page.getByText('Event details')).toBeVisible()
  })

  await test.step('5. Validate "Event Details" page', async () => {
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Exit', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Save & Exit' })
    ).toBeVisible()

    const dateOfDeath = new Date()
    dateOfDeath.setDate(dateOfDeath.getDate() - 10)
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

    /*
     * Expected result: should navigate to the "Informant details" page
     */
    await expect(page.getByText("Informant's details")).toBeVisible()
  })

  await test.step('6. Validate "Informant details" page', async () => {
    await expect(page.getByText('Informant Type')).toBeVisible()
    await expect(page.getByText('Phone number')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()

    /*
     * Note: per-page "Continue" does not block on empty required fields -
     * it navigates straight through instead of showing inline errors.
     * Required-field validation for this page is covered separately via
     * the Review page (see e.g. 2.validate-deceaseds-details-page.spec.ts).
     */
    await page.locator('#informant____relation').click()
    await page.getByText('Spouse', { exact: true }).click()
    await page.locator('#informant____email').fill('spouse@opencrvs.dev')
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should navigate to the "Spouse details" page
     */
    await expect(
      page.getByText('Spouse details', { exact: true })
    ).toBeVisible()
  })

  await test.step('7. Validate "Spouse details" page', async () => {
    await expect(
      page.getByText('Spouse details', { exact: true })
    ).toBeVisible()

    await page.locator('#firstname').fill('Aisha')
    await page.locator('#surname').fill('Doppler')
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('01')
    await page.getByPlaceholder('yyyy').fill('1985')

    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should navigate to the "Supporting documents" page
     */
    await expect(
      page.getByText('Upload supporting documents', { exact: true })
    ).toBeVisible()
  })

  await test.step('8. Validate "Supporting document" page', async () => {
    await expect(
      page.getByText('Upload supporting documents', { exact: true })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should navigate to the "Review" page
     */
    await expect(page).toHaveURL(/\/review/)
  })

  await test.step('9. Validate "Review" page', async () => {
    /*
     * Expected result: should show the Review declaration block and the
     * Action menu (Save & Exit, Exit and Delete declaration - no Alpha
     * print button on the death review page)
     */
    await expect(page.getByTestId('deceased.name-value')).toContainText(
      `${DECEASED_NAME.firstname} ${DECEASED_NAME.surname}`
    )
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await expect(
      page.getByText('Save & Exit', { exact: true })
    ).toBeVisible()
    await expect(page.getByText('Delete declaration')).toBeVisible()
    await page.getByRole('button', { name: 'Action', exact: true }).click()
  })

  await test.step('10. Validate "Save & Exit" button', async () => {
    // On the review page, Save & Exit is reached through the "Action"
    // dropdown (unlike the pre-review pages, which show it as a direct
    // top-bar button).
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page.getByText('Save & Exit', { exact: true }).click()

    /*
     * Expected result: modal with title "Save & exit?", the helper text
     * below, and Cancel/Confirm buttons.
     */
    await expect(
      page.getByRole('heading', { name: 'Save & exit?' })
    ).toBeVisible()
    await expect(
      page.getByText(
        'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?'
      )
    ).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()
    /*
     * Expected result: should close the modal
     */
    await expect(
      page.getByRole('heading', { name: 'Save & exit?' })
    ).toBeHidden()

    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page.getByText('Save & Exit', { exact: true }).click()
    await waitForActionResponses(page, ['event.draft.create'], async () => {
      await page.getByRole('button', { name: 'Confirm' }).click()
    })

    /*
     * Expected result: the declaration is saved as a draft
     */
    await page.getByText('Drafts').click()
    await expect(page.locator('#content-name')).toHaveText('Drafts')
  })
})

test('Validate "Exit" button', async ({ page }) => {
  await test.step('11.1 Open the "Exit" modal', async () => {
    await login(page)
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Exit', exact: true }).click()

    /*
     * Expected result: modal with title "Exit without saving changes?"
     */
    await expect(
      page.getByRole('heading', { name: 'Exit without saving changes?' })
    ).toBeVisible()
    await expect(
      page.getByText(
        'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?'
      )
    ).toBeVisible()
  })

  await test.step('11.2 Click Cancel', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()

    /*
     * Expected result: should close the modal
     */
    await expect(
      page.getByRole('heading', { name: 'Exit without saving changes?' })
    ).toBeHidden()
  })

  await test.step('11.3 Click Confirm', async () => {
    await page.getByRole('button', { name: 'Exit', exact: true }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    /*
     * Expected result: no draft is saved
     */
    await expect(
      page.getByTestId('search-result').getByText('Assigned to you')
    ).toBeVisible()
  })
})

test('Validate "Delete declaration" button', async ({ page }) => {
  await test.step('12.1 Open the "Delete draft?" modal', async () => {
    await login(page)
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#event-menu-dropdownMenu').click()
    await page
      .locator('#event-menu-dropdownMenu')
      .getByRole('listitem')
      .filter({ hasText: 'Delete declaration' })
      .click()

    /*
     * Expected result: modal with title "Delete draft?"
     */
    await expect(
      page.getByRole('heading', { name: 'Delete draft?' })
    ).toBeVisible()
    await expect(
      page.getByText('Are you sure you want to delete this declaration?')
    ).toBeVisible()
  })

  await test.step('12.2 Click Cancel', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()

    /*
     * Expected result: should close the modal
     */
    await expect(
      page.getByRole('heading', { name: 'Delete draft?' })
    ).toBeHidden()
  })

  await test.step('12.3 Click Confirm', async () => {
    await page.locator('#event-menu-dropdownMenu').click()
    await page
      .locator('#event-menu-dropdownMenu')
      .getByRole('listitem')
      .filter({ hasText: 'Delete declaration' })
      .click()

    const deleteResponse = page.waitForResponse(
      (response) => response.url().includes('event.delete') && response.ok()
    )
    await page.getByRole('button', { name: 'Confirm' }).click()
    await deleteResponse

    /*
     * Expected result: no draft is saved
     */
    await expect(
      page.getByTestId('search-result').getByText('Assigned to you')
    ).toBeVisible()
  })
})
