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
import { expect, test, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import { formatV2ChildName } from '../birth/helpers'
import { assertTexts, selectLocationOption } from '../../utils'
import {
  createBirthRegisteredWithInactiveOfficeAndFacility,
  createDeathRegisteredWithInactiveAddress,
  createBirthRegisteredWithInactiveOffice,
  createDeathRegisteredWithInactiveOfficeAndFacility
} from './location-versioning-declarations'

function formatDeceasedName(declaration: {
  'deceased.name': { firstname: string; surname: string }
}) {
  const { firstname, surname } = declaration['deceased.name']
  return `${firstname} ${surname}`
}

test.describe
  .serial('Advanced search - inactive Central Registration Office', () => {
  let page: Page

  let birthCentral: Awaited<
    ReturnType<typeof createBirthRegisteredWithInactiveOfficeAndFacility>
  >
  let deathCentral: Awaited<
    ReturnType<typeof createDeathRegisteredWithInactiveAddress>
  >

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    birthCentral = await createBirthRegisteredWithInactiveOfficeAndFacility()
    deathCentral = await createDeathRegisteredWithInactiveAddress()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('0 - Log in as a nationally-scoped user and load advanced search', async () => {
    // Registrar General's `record.search` scope has no jurisdiction
    // restriction — needed since the seeded records span Central, Ibombo
    // and Isamba.
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
  })

  test('1 - Inactive Central Registration Office appears in Place of Registration filter and finds the birth record', async () => {
    await page.getByText('Birth').click()
    await page.getByText('Registration details').click()

    await page
      .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
      .fill('Old Central')
    // The option is present despite the office being inactive.
    await selectLocationOption(page, 'Old Central Registration Office')

    // Advanced search requires at least 2 fields — status is the 2nd here.
    await page.locator('#event____status').click()
    await page.getByText('Registered').click()

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)

    await assertTexts({
      root: page,
      testId: 'search-result',
      texts: [
        'Event: Birth',
        'Place of registration: Old Central Registration Office',
        'Status of record: Registered',
        formatV2ChildName(birthCentral.declaration)
      ]
    })
  })

  test('2 - Inactive Central Registration Office appears in Place of Registration filter and finds the death record', async () => {
    await page.goto(CLIENT_URL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)

    await page.getByText('Death').click()
    await page.getByText('Registration details').click()

    await page
      .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
      .fill('Old Central')
    await selectLocationOption(page, 'Old Central Registration Office')

    // Advanced search requires at least 2 fields — status is the 2nd here.
    await page.locator('#event____status').click()
    await page.getByText('Registered').click()

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)

    await assertTexts({
      root: page,
      testId: 'search-result',
      texts: [
        'Event: Death',
        'Place of registration: Old Central Registration Office',
        'Status of record: Registered',
        formatDeceasedName(deathCentral.declaration)
      ]
    })
  })
})

test.describe
  .serial('Advanced search - inactive Ibombo Registration Office', () => {
  let page: Page

  let birthIbombo: Awaited<
    ReturnType<typeof createBirthRegisteredWithInactiveOffice>
  >
  let deathIbombo: Awaited<
    ReturnType<typeof createDeathRegisteredWithInactiveOfficeAndFacility>
  >

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    birthIbombo = await createBirthRegisteredWithInactiveOffice()
    deathIbombo = await createDeathRegisteredWithInactiveOfficeAndFacility()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('0 - Log in as a nationally-scoped user and load advanced search', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
  })

  test('1 - Inactive Ibombo Registration Office appears in Place of Registration filter and finds the birth record', async () => {
    await page.getByText('Birth').click()
    await page.getByText('Registration details').click()

    await page
      .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
      .fill('Old Ibombo')
    // The option is present despite the office being inactive.
    await selectLocationOption(page, 'Old Ibombo Registration Office')

    // Advanced search requires at least 2 fields — status is the 2nd here.
    await page.locator('#event____status').click()
    await page.getByText('Registered').click()

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)

    await assertTexts({
      root: page,
      testId: 'search-result',
      texts: [
        'Event: Birth',
        'Place of registration: Old Ibombo Registration Office',
        'Status of record: Registered',
        formatV2ChildName(birthIbombo.declaration)
      ]
    })
  })

  test('2 - Inactive Ibombo Registration Office appears in Place of Registration filter and finds the death record', async () => {
    await page.goto(CLIENT_URL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)

    await page.getByText('Death').click()
    await page.getByText('Registration details').click()

    await page
      .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
      .fill('Old Ibombo')
    await selectLocationOption(page, 'Old Ibombo Registration Office')

    // Advanced search requires at least 2 fields — status is the 2nd here.
    await page.locator('#event____status').click()
    await page.getByText('Registered').click()

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)

    await assertTexts({
      root: page,
      testId: 'search-result',
      texts: [
        'Event: Death',
        'Place of registration: Old Ibombo Registration Office',
        'Status of record: Registered',
        formatDeceasedName(deathIbombo.declaration)
      ]
    })
  })
})
