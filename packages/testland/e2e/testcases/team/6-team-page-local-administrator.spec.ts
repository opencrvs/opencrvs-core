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
import { verifyTeamMembers } from '@e2e/support/birth/helpers'

test.describe.serial('6. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('6.1 Basic UI check', () => {
    test('6.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Central Province Office'
      )

      await expect(
        page.getByText('Central', {
          exact: true
        })
      ).toBeVisible()
    })

    const team = [
      { name: 'Emmanuel Mayuka', role: 'Administrator' },
      { name: 'Mitchel Owen', role: 'Provincial Registrar' }
    ]

    test('6.1.1 Verify Team Members, Roles and their statuses', async () => {
      await verifyTeamMembers(page, team)
    })

    test('6.1.2 Verify Team Member Details', async () => {
      for (const member of team) {
        await page.getByRole('button', { name: member.name }).click()
        await expect(page.locator('#content-name')).toHaveText(member.name)

        await expect(page).toHaveURL(/.*\/view/)

        await page
          .getByRole('button', { name: 'Central Province Office' })
          .click()
        await expect(page).toHaveURL(/.*\/team\/users/)
      }
    })
  })
})
