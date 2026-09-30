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
import { faker } from '@faker-js/faker'
import { getToken, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration-with-mother-father'

test("BRN search on deceased's details finds and fills from a registered birth record", async ({
  page
}) => {
  const birthChildName = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  let registrationNumber = ''

  await test.step('Create and register a birth record via API', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, {
      'child.name': birthChildName
    })
    registrationNumber = res.registrationNumber ?? ''
    expect(registrationNumber).toMatch(/^[A-Za-z0-9]{12}$/)
  })

  await test.step('Login and start a death declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step("Search the deceased's birth record by BRN", async () => {
    await page.locator('#search').fill(registrationNumber)

    // The birth may take a moment to be indexed for search; retry the search
    // until the matching record is found.
    await expect(async () => {
      await page.locator('#search').press('Enter')
      await expect(page.getByTestId('search-input-error')).toHaveText(
        'Birth record found',
        { timeout: 5000 }
      )
    }).toPass({ timeout: 30000 })
  })

  await test.step("Deceased's name is filled from the matched birth record", async () => {
    await expect(page.locator('#firstname')).toHaveValue(
      birthChildName.firstname
    )
    await expect(page.locator('#surname')).toHaveValue(birthChildName.surname)
  })
})
