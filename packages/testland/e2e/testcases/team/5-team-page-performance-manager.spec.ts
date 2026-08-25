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
import { login } from '@e2e/support/helpers'
import { verifyTeamMembers } from '@e2e/support/birth/helpers'
import { CREDENTIALS } from '@e2e/support/constants'

test.describe.serial('5. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('5.1 Basic UI check', async () => {
    test('5.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PERFORMANCE_MANAGER)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText('HQ Office')
    })

    const team = [
      { name: 'Chipo Lungu', role: 'Registrar General', disabled: true },
      {
        name: 'Jonathan Campbell',
        role: 'National Administrator',
        disabled: true
      },
      { name: 'Mutale Musonda', role: 'Operations Manager', disabled: true }
    ]

    test('5.1.1 Verify Team Members, Roles and their statuses', async () => {
      await verifyTeamMembers(page, team)
    })

    test('5.2.2 Verify for different locations', async () => {
      await page.getByRole('button', { name: /HQ Office/ }).click()
      await page.getByTestId('locationSearchInput').fill('Il')
      await page.getByText(/Ilanga District Office/).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Ilanga District Office'
      )

      await expect(
        page.getByText('Ilanga, Sulaka', {
          exact: true
        })
      ).toBeVisible()
    })
  })
})
