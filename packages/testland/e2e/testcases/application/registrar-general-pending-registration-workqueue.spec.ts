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

import { CREDENTIALS } from '@e2e/support/constants'

import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration'
import { getToken, login } from '@e2e/support/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

test.describe
  .serial("Registar General's 'Pending registration' -workqueue", () => {
  let page: Page
  let embassyDeclarationChildName: string
  let registrarDeclarationChildName: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Declare a birth by Embassy Official', async () => {
    const token = await getToken(CREDENTIALS.EMBASSY_OFFICIAL)

    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    embassyDeclarationChildName = formatV2ChildName(res.declaration)
  })

  test('Declare a birth by Registrar', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    registrarDeclarationChildName = formatV2ChildName(res.declaration)
  })

  test('Login as Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  test("Navigate to 'Pending registration' -workqueue", async () => {
    await page.getByText('Pending registration').click()
  })

  test("Record declared by Embassy Official should show up on Registrar Generals 'Pending registration' -workqueue", async () => {
    await expect(
      page.getByRole('button', { name: embassyDeclarationChildName })
    ).toBeVisible()
  })

  test("Record declared by Registrar should not show up on Registrar Generals 'Pending registration' -workqueue", async () => {
    await expect(
      page.getByRole('button', { name: registrarDeclarationChildName })
    ).not.toBeVisible()
  })
})
