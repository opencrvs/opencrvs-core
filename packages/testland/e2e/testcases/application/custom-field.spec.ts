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
import { continueForm, goBackToReview, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'

/*
 * applicant.skillLevel is an _EXPERIMENTAL_CUSTOM field. Its component is the
 * ES module src/client-static/custom-fields/skill-level.js, which the client
 * loads at runtime through /api/countryconfig/.
 */
test('Custom field from country config', async ({ page }) => {
  const problems: string[] = []
  page.on('console', (message) => {
    const text = message.text()
    if (
      text.includes('Content Security Policy') ||
      text.includes('custom input dynamically') ||
      text.includes('custom output dynamically') ||
      text.includes('failed to render')
    ) {
      problems.push(text)
    }
  })
  page.on('pageerror', (error) => problems.push(error.message))

  await login(page, CREDENTIALS.REGISTRAR)
  await page.click('#header-new-event')
  await page.getByLabel('Tennis club membership application').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await test.step('Input is loaded from the country config module', async () => {
    await expect(page.getByText("Applicant's tennis skill level")).toBeVisible()
    await expect(page.getByRole('radio')).toHaveCount(5)
    await expect(page.getByText('Error loading component')).not.toBeVisible()
  })

  await test.step('Input keeps its own state and reports the value', async () => {
    await page.getByRole('radio', { name: '4 of 5' }).click()

    await expect(page.getByRole('radio', { name: '4 of 5' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  await test.step('Output shows the value on review', async () => {
    await continueForm(page)
    await continueForm(page)

    await expect(page.getByTestId('applicant.skillLevel-value')).toHaveText(
      '★★★★☆ (4/5)'
    )
  })

  await test.step('Value can be changed from review', async () => {
    await page.getByTestId('change-button-applicant.skillLevel').click()

    await expect(page.getByRole('radio', { name: '4 of 5' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await page.getByRole('radio', { name: '2 of 5' }).click()
    await goBackToReview(page)

    await expect(page.getByTestId('applicant.skillLevel-value')).toHaveText(
      '★★☆☆☆ (2/5)'
    )
  })

  expect(problems).toEqual([])
})
