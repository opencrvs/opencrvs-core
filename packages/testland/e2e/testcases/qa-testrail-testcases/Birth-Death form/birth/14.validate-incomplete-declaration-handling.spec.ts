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
 * Not a numbered QA-testrail case - this covers the "Incomplete" declaration
 * samples (7-10) from the birth sample-data sheet
 * (1g0ReIDGw8lbHC6Am3O0A16S1y0jje8BZ, "birth" tab), which are not otherwise
 * represented in the 13 numbered cases in this folder. All 4 rely on the
 * same mechanism already proven in 2/5/6.validate-*-details-page.spec.ts:
 * leaving a required field empty does not block "Continue" - the app
 * surfaces "Required for registration" on the review page instead.
 */

trackAndDeleteCreatedEvents()

test('Sample 7: informant-only declaration, neither parent\'s details available', async ({
  page
}) => {
  await login(page)
  await openBirthDeclaration(page)

  await test.step('Fill the child and pick "Legal guardian" as informant', async () => {
    await page.locator('#firstname').fill('Anna')
    await page.locator('#surname').fill('Brown')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#informant____relation').click()
    await page.getByText('Legal guardian', { exact: true }).click()
    await page.locator('#informant____email').fill('guardian@opencrvs.dev')
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Mark Mother\'s and Father\'s details as unavailable', async () => {
    await expect(
      page.getByText("Mother's details", { exact: true })
    ).toBeVisible()
    await page.getByText("Mother's details are not available").click()
    await page.locator('#mother____reason').fill('Mother is missing.')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText("Father's details", { exact: true })
    ).toBeVisible()
    await page.getByText("Father's details are not available").click()
    await page.locator('#father____reason').fill('Father is missing.')
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('The declaration still reaches Review with no validation errors on Mother/Father', async () => {
    await goToSection(page, 'review')

    await expect(page.getByTestId('row-value-mother.reason')).toHaveText(
      'Mother is missing.'
    )
    await expect(page.getByTestId('row-value-father.reason')).toHaveText(
      'Father is missing.'
    )
  })
})

test('Sample 8: child name left completely blank', async ({ page }) => {
  await login(page)
  await openBirthDeclaration(page)

  await test.step('Leave the child\'s name blank and continue to Review', async () => {
    await goToSection(page, 'review')

    /*
     * Expected result: "Required for registration" for the child's name -
     * mirrors the fully-empty-field case already proven in
     * 2.validate-childs-details-page.spec.ts
     */
    await expect(
      page
        .locator('[data-testid="row-value-child.name"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
  })
})

test('Sample 9: only the child\'s surname is provided', async ({ page }) => {
  await login(page)
  await openBirthDeclaration(page)

  await test.step('Fill only the surname and continue to Review', async () => {
    await page.locator('#surname').fill('Taylor')
    await goToSection(page, 'review')

    /*
     * Expected result: the missing first name is still flagged as required
     * - farajalandNameConfig requires both firstname and surname
     * sub-fields (packages/testland/src/events/birth/validators.ts)
     */
    await expect(
      page
        .locator('[data-testid="row-value-child.name"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
  })
})

test('Sample 10: only the child\'s first name is provided', async ({
  page
}) => {
  await login(page)
  await openBirthDeclaration(page)

  await test.step('Fill only the first name and continue to Review', async () => {
    await page.locator('#firstname').fill('Helen')
    await goToSection(page, 'review')

    /*
     * Expected result: the missing surname is still flagged as required
     */
    await expect(
      page
        .locator('[data-testid="row-value-child.name"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
  })
})
