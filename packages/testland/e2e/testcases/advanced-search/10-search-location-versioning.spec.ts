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
  registerDeclarationsThenDeactivateOffice,
  createBirthRegisteredWithInactiveFacility,
  createDeathRegisteredWithInactiveFacility
} from './location-versioning-declarations'

function formatDeceasedName(declaration: {
  'deceased.name': { firstname: string; surname: string }
}) {
  const { firstname, surname } = declaration['deceased.name']
  return `${firstname} ${surname}`
}

test.describe.serial('Advanced search - inactive registration office', () => {
  let page: Page
  let officeName: string
  let birth: Awaited<
    ReturnType<typeof registerDeclarationsThenDeactivateOffice>
  >['birth']
  let death: Awaited<
    ReturnType<typeof registerDeclarationsThenDeactivateOffice>
  >['death']

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    const result = await registerDeclarationsThenDeactivateOffice(page)
    officeName = result.officeName
    birth = result.birth
    death = result.death
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('0 - Log in as a nationally-scoped user and load advanced search', async () => {
    // Registrar General's `record.search` scope has no jurisdiction
    // restriction — needed since this office is created fresh, not tied to
    // any specific pre-seeded jurisdiction.
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
  })

  test('1 - Inactive office appears in Place of Registration filter and finds the birth record', async () => {
    await page.getByText('Birth').click()
    await page.getByText('Registration details').click()

    await page
      .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
      .fill(officeName)
    // The option is present despite the office being inactive.
    await selectLocationOption(page, officeName)

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
        `Place of registration: ${officeName}`,
        'Status of record: Registered',
        formatV2ChildName(birth.declaration)
      ]
    })
  })

  test('2 - Inactive office appears in Place of Registration filter and finds the death record', async () => {
    await page.goto(CLIENT_URL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)

    await page.getByText('Death').click()
    await page.getByText('Registration details').click()

    await page
      .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
      .fill(officeName)
    await selectLocationOption(page, officeName)

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
        `Place of registration: ${officeName}`,
        'Status of record: Registered',
        formatDeceasedName(death.declaration)
      ]
    })
  })
})

test.describe.serial('Advanced search - inactive health facilities', () => {
  let page: Page

  let birthFacility: Awaited<
    ReturnType<typeof createBirthRegisteredWithInactiveFacility>
  >
  let deathFacility: Awaited<
    ReturnType<typeof createDeathRegisteredWithInactiveFacility>
  >

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    birthFacility = await createBirthRegisteredWithInactiveFacility()
    deathFacility = await createDeathRegisteredWithInactiveFacility()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('0 - Log in and load advanced search', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
  })

  test('1 - Inactive health facility appears in Place of Delivery filter and finds the birth record', async () => {
    await page.getByText('Birth').click()
    await page.getByText('Event details').click()

    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()

    await page.locator('#child____birthLocation').fill('Old Central Maternity')
    // The option is present despite the facility being inactive.
    await selectLocationOption(page, 'Old Central Maternity Hospital')

    // Advanced search requires at least 2 fields — status is the 2nd here,
    // under a separate "Registration details" accordion.
    await page.getByText('Registration details').click()
    await page.locator('#event____status').click()
    await page.getByText('Registered').click()

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)
    // Client lag before the result list actually renders after navigation.
    await page.waitForTimeout(2000)

    await assertTexts({
      root: page,
      testId: 'search-result',
      texts: [
        'Event: Birth',
        "Child's Location of birth: Old Central Maternity Hospital, Central, Farajaland",
        'Status of record: Registered',
        formatV2ChildName(birthFacility.declaration)
      ]
    })
  })

  test('2 - Inactive health facility appears in Place of Delivery filter and finds the death record', async () => {
    await page.goto(CLIENT_URL)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)

    await page.getByText('Death').click()
    await page.getByText('Event details').click()

    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Health Institution', { exact: true }).click()

    await page
      .locator('#eventDetails____deathLocation')
      .fill('Old Ibombo Community')
    await selectLocationOption(page, 'Old Ibombo Community Clinic')

    // Advanced search requires at least 2 fields — status is the 2nd here,
    // under a separate "Registration details" accordion.
    await page.getByText('Registration details').click()
    await page.locator('#event____status').click()
    await page.getByText('Registered').click()

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)

    await assertTexts({
      root: page,
      testId: 'search-result',
      texts: [
        'Event: Death',
        "Deceased's Health Institution: Old Ibombo Community Clinic, Ibombo, Central, Farajaland",
        'Status of record: Registered',
        formatDeceasedName(deathFacility.declaration)
      ]
    })
  })
})
