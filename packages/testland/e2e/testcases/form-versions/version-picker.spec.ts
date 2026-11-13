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
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { CREDENTIALS } from '@e2e/support/constants'
import { getEventIdFromUrl, getToken, login } from '@e2e/support/helpers'
import {
  BirthVersionLabel,
  getConfigVersionId,
  startBirthDeclaration
} from '@e2e/support/form-versions'

test.describe('Form version picker', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('The current version is selected by default', async ({ page }) => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()

    await expect(page.getByText('Form version')).toBeVisible()
    await expect(
      page.getByLabel(BirthVersionLabel[BirthVersion.V2], { exact: true })
    ).toBeChecked()
    await expect(
      page.getByLabel(BirthVersionLabel[BirthVersion.INITIAL], { exact: true })
    ).not.toBeChecked()
  })

  for (const version of [BirthVersion.INITIAL, BirthVersion.V2]) {
    test(`A record is created under version '${version}' when the user picks it`, async ({
      page
    }) => {
      await startBirthDeclaration(page, BirthVersionLabel[version])
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page.getByText("Child's details")).toBeVisible()

      // The client gives a new record a temporary id ('tmp-<uuid>') until the
      // server creates it. Then the URL changes to the id of the server.
      await expect(page).not.toHaveURL(/\/tmp-/, { timeout: 30_000 })
      const eventId = getEventIdFromUrl(page)
      const token = await getToken(CREDENTIALS.REGISTRAR)

      expect(await getConfigVersionId(token, eventId)).toBe(version)
    })
  }
})
