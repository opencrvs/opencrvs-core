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

import { login } from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import {
  expectBirthsTabSelected,
  expectNoBrokenCards,
  populateDashboardRecords
} from '@e2e/support/dashboard/utils'

// Every card on the Births tab, in dashboard grid order. The markdown intro
// card ("Registrations Dashboard") has no title element.
const EXPECTED_CARD_TITLES = [
  'Births registrations total',
  'Birth registrations by time period and by sex',
  'Birth registrations by age and by sex',
  'Birth registrations by sex',
  'Birth registrations by type of location and by sex',
  'Birth registrations by province',
  'Birth registrations by district',
  'Birth registration certification rate',
  "Birth registrations by mother's age in years",
  "Birth registrations by father's age in years",
  'Birth registrations by type of birth'
]
const UNTITLED_CARDS = 1 // markdown intro card

test('Registrations dashboard cards render and survive filtering', async ({
  page
}) => {
  await populateDashboardRecords(page)

  await login(page, CREDENTIALS.REGISTRAR)
  await page.goto(`${CLIENT_URL}/performance/dashboard/registrations`)
  const frame = page.frameLocator('iframe')

  await test.step('All cards render without errors on the Births tab', async () => {
    await expectBirthsTabSelected(frame)
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Location filter does not break any card', async () => {
    await frame.getByRole('button', { name: 'Location' }).click()
    await frame.getByText('Ibombo District Office', { exact: true }).click()
    await frame.getByRole('button', { name: 'Add filter' }).click()

    await expect(
      frame.getByText('Location: Ibombo District Office')
    ).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Date filter does not break any card', async () => {
    // Defaults to "Date: This year"; selecting a relative range applies it
    // immediately without a confirm button
    await frame.getByText('Date:', { exact: false }).click()
    await frame.getByText('Previous 30 days', { exact: true }).click()

    await expect(frame.getByText('Date: Previous 30 days')).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Resetting the date filter does not break any card', async () => {
    // The widget's button is labelled "Clear" when the default value is
    // selected and "Reset filter to default state" otherwise. Scope to the
    // Date widget — the applied Location filter has a similar button.
    await frame
      .locator('[data-testid="parameter-widget"]', { hasText: 'Date:' })
      .getByRole('button', { name: /reset filter|clear/i })
      .click()

    await expect(frame.getByText('Date: This year')).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })
})
