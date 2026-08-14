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
import { CREDENTIALS } from '../../../../constants'
import { openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Alpha print button and its functionality". This is
 * genuinely new coverage - the button (`review.print`,
 * FieldType.ALPHA_PRINT_BUTTON,
 * packages/testland/src/events/birth/forms/declaration.ts) has no prior e2e
 * coverage anywhere in the codebase, only Storybook stories
 * (AlphaPrintButton.stories.tsx / .interaction.stories.tsx). Visible only
 * for LOCAL_REGISTRAR/PROVINCIAL_REGISTRAR/NATIONAL_REGISTRAR roles, and
 * only before the event has a NOTIFY or DECLARE action recorded.
 */

const fillAndReachReviewAsRegistrar = async (page: Page) => {
  await login(page, CREDENTIALS.REGISTRAR)
  await openBirthDeclaration(page)

  // Edge-case child name from the birth sample-data sheet (sample 6:
  // "Complete declaration by National Registrar" - tests an apostrophe).
  await page.locator('#firstname').fill("O'Neill")
  await page.locator('#surname').fill('Samson')
  await page.locator('#child____gender').click()
  await page.getByText('Male', { exact: true }).click()
  await page.getByPlaceholder('dd').fill('01')
  await page.getByPlaceholder('mm').fill('01')
  await page.getByPlaceholder('yyyy').fill(String(new Date().getFullYear()))
  await page.locator('#child____placeOfBirth').click()
  await page.getByText('Health Institution', { exact: true }).click()
  await page
    .locator('#searchable-select-child____birthLocation input')
    .fill('ib')
  await page.getByText('Ibombo District Hospital').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Mother', { exact: true }).click()
  await page.locator('#informant____email').fill('mother@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#firstname').fill('Aisha')
  await page.locator('#surname').fill('Islam')
  await page.getByPlaceholder('dd').fill('01')
  await page.getByPlaceholder('mm').fill('01')
  await page.getByPlaceholder('yyyy').fill('1990')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#father____addressSameAs_YES').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await goToSection(page, 'review')
}

trackAndDeleteCreatedEvents()

test('1. The button is available and functional for a Registrar creating a fresh declaration', async ({
  page
}) => {
  await fillAndReachReviewAsRegistrar(page)

  await test.step('The "Print certificate in advance of registration" button is shown', async () => {
    /*
     * Expected result: Registrar sees a button in the annotation section
     */
    await expect(page.getByTestId('review____print')).toBeVisible()
    await expect(
      page.getByRole('button', {
        name: 'Print certificate in advance of registration'
      })
    ).toBeVisible()
  })

  await test.step('Clicking the button prints the certificate as a PDF', async () => {
    const popupPromise = page.waitForEvent('popup')
    await page.getByTestId('review____print').click()
    const popup = await popupPromise
    const download = await popup.waitForEvent('download')

    /*
     * Expected result: a new window opens and downloads/prints the
     * generated certificate PDF
     */
    expect(popup.url()).toBe('about:blank')
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  })
})

test('2. The button is not available for non-Registrar roles', async ({
  page
}) => {
  const fillMinimalDeclarationAndReachReview = async (
    username: (typeof CREDENTIALS)[keyof typeof CREDENTIALS]
  ) => {
    await login(page, username)
    await openBirthDeclaration(page)
    await page.locator('#firstname').fill('James-Peter')
    await page.locator('#surname').fill('Collen')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('mother@opencrvs.dev')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await goToSection(page, 'review')
  }

  await test.step('Community leader does not see the button', async () => {
    await fillMinimalDeclarationAndReachReview(CREDENTIALS.COMMUNITY_LEADER)

    /*
     * Expected result: should not see "Print certificate in advance of
     * registration"
     */
    await expect(page.getByTestId('review____print')).toBeHidden()
  })

  await test.step('Registration officer does not see the button', async () => {
    await fillMinimalDeclarationAndReachReview(
      CREDENTIALS.REGISTRATION_OFFICER
    )

    await expect(page.getByTestId('review____print')).toBeHidden()
  })
})

// @TODO: not confirmed whether the "Register"/"Validate" action review
// reuses the same BIRTH_DECLARATION_REVIEW.review.print field config, or
// whether the declare-form review (where this button lives) is even
// reachable again once the event has a NOTIFY/DECLARE action recorded.
// Needs a closer look at how per-action review forms are resolved before
// asserting on this.
test.skip('3. The button is hidden once the record has been notified or declared', async () => {})
