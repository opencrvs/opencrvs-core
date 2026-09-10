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
import { getToken, login } from '@e2e/support/helpers'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '@e2e/support/constants'
import { expectInUrl, type } from '@e2e/support/utils'
import { setMobileViewport } from '@e2e/support/mobile-helpers'

test('Mobile: in-app Back on advanced-search results does not loop back into the closed record (#13677)', async ({
  page
}) => {
  await setMobileViewport(page)

  const token = await getToken(CREDENTIALS.REGISTRAR)
  const record = await createDeclaration(token, {
    'child.gender': 'female'
  })
  const { eventId } = record
  const childFirstName = record.declaration['child.name'].firstname
  const childSurname = record.declaration['child.name'].surname

  await test.step('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Run an advanced search that returns the record', async () => {
    await page
      .getByRole('button', { name: 'Go to search', exact: true })
      .click()
    await expectInUrl(page, '/search')

    await page.click('#searchType')
    await expectInUrl(page, '/advanced-search')

    await page.getByText('Birth').click()
    await page.getByText('Child details').click()
    await type(page, '#firstname', childFirstName)
    await type(page, '#surname', childSurname)

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)
    await expect(page.getByTestId('search-result')).toBeVisible()
  })

  await test.step('Open the record from the search results', async () => {
    await page
      .getByTestId('search-result')
      .getByRole('button', { name: new RegExp(childFirstName) })
      .click()

    await expectInUrl(page, `/events/${eventId}`)
    await expect(page.getByTestId('exit-event')).toBeVisible()
  })

  await test.step('Close the record with the X button', async () => {
    await page.getByTestId('exit-event').click()
    await expect(page).toHaveURL(/.*\/search-result/)
    await expect(page.getByTestId('search-result')).toBeVisible()
  })

  await test.step('In-app Back returns to the page before the search results', async () => {
    await page.locator('#header-go-back-button').click()
    await expectInUrl(page, '/advanced-search')
  })
})
