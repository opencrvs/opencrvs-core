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

// The Births tab has a single record-table card and no untitled cards
const EXPECTED_CARD_TITLES = ['Birth records (no PII)']

test('Registry dashboard cards render and survive filtering', async ({
  page
}) => {
  await populateDashboardRecords(page)

  await login(page, CREDENTIALS.REGISTRAR)
  await page.goto(`${CLIENT_URL}/performance/dashboard/registry`)
  const frame = page.frameLocator('iframe')

  // The record table's sortable column headers ("Created at location", …)
  // also expose role=button, so scope filter clicks to the filter bar
  const filterBar = frame.getByTestId('fixed-width-filters')

  await test.step('All cards render without errors on the Births tab', async () => {
    await expectBirthsTabSelected(frame)
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES)
  })

  await test.step('Location filter does not break any card', async () => {
    await filterBar.getByRole('button', { name: 'Location' }).click()
    await frame.getByTestId('Ibombo District Office-filter-value').click()
    await frame.getByRole('button', { name: 'Add filter' }).click()

    await expect(
      frame.getByText('Location: Ibombo District Office')
    ).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES)
  })

  await test.step('Time period filter does not break any card', async () => {
    // No default value; selecting a relative range applies it immediately
    // without a confirm button
    await filterBar.getByRole('button', { name: 'Time period' }).click()
    await frame.getByText('Previous 30 days', { exact: true }).click()

    await expect(frame.getByText('Time period: Previous 30 days')).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES)
  })

  await test.step('Clearing the time period filter does not break any card', async () => {
    await frame
      .locator('[data-testid="parameter-widget"]', { hasText: 'Time period' })
      .getByRole('button', { name: /reset filter|clear/i })
      .click()

    await expect(frame.getByText('Time period: Previous 30 days')).toBeHidden()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES)
  })
})
