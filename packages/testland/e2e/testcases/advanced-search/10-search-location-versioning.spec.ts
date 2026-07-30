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
  createDeathRegisteredWithInactiveOfficeAndFacility,
  createBirthNotifiedInactiveAddress,
  createDeathArchivedControlRecord
} from './location-versioning-declarations'

function formatDeceasedName(declaration: {
  'deceased.name': { firstname: string; surname: string }
}) {
  const { firstname, surname } = declaration['deceased.name']
  return `${firstname} ${surname}`
}

test.describe
  .serial('Advanced search - inactive registration offices, health facilities and administrative areas', () => {
  let page: Page

  let birthCentral: Awaited<
    ReturnType<typeof createBirthRegisteredWithInactiveOfficeAndFacility>
  >
  let deathCentral: Awaited<
    ReturnType<typeof createDeathRegisteredWithInactiveAddress>
  >
  let birthIbombo: Awaited<
    ReturnType<typeof createBirthRegisteredWithInactiveOffice>
  >
  let deathIbombo: Awaited<
    ReturnType<typeof createDeathRegisteredWithInactiveOfficeAndFacility>
  >
  let birthOtherAddress: Awaited<
    ReturnType<typeof createBirthNotifiedInactiveAddress>
  >

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    // Sequential: each of these logs in as its own seeded registrar and
    // creates one event — no shared client, no concurrency concerns.
    birthCentral = await createBirthRegisteredWithInactiveOfficeAndFacility()
    deathCentral = await createDeathRegisteredWithInactiveAddress()
    birthIbombo = await createBirthRegisteredWithInactiveOffice()
    deathIbombo = await createDeathRegisteredWithInactiveOfficeAndFacility()
    birthOtherAddress = await createBirthNotifiedInactiveAddress()
    await createDeathArchivedControlRecord()
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
