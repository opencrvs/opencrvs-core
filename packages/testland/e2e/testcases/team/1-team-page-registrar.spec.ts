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
import { CREDENTIALS } from '@e2e/support/constants'

test.describe.serial('1. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 Team Page', async () => {
    test('1.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Ibombo District Office'
      )

      await expect(
        page.getByText('Ibombo, Central', {
          exact: true
        })
      ).toBeVisible()
    })

    const team = [
      { name: 'Felix Katongo', role: 'Registration Officer' },
      { name: 'Kennedy Mweene', role: 'Registrar' }
    ]

    test('1.1.1 Verify Team Members, Roles and their statuses', async () => {
      for (const member of team) {
        const row = page
          .locator('#user_list tbody tr')
          .filter({ hasText: member.name })
        await expect(row.getByTestId(/-label$/)).toHaveText(member.name)
        await expect(row.getByTestId(/-value$/)).toHaveText(member.role)
        await expect(row.getByTestId(/-actions$/)).toHaveText('Active')
      }
    })
  })
})
