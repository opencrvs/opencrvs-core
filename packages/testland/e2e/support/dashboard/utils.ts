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
import { expect, Page, type FrameLocator } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { AddressType } from '@opencrvs/toolkit/events'

import {
  dateToIsoDateString,
  getToken,
  randomPastDate
} from '@e2e/support/helpers'
import {
  getAdministrativeAreas,
  getIdByName,
  getLocations
} from '@e2e/support/birth/helpers'
import {
  createDeclaration,
  type CreateDeclarationResponse
} from '@e2e/support/test-data/birth-declaration'
import {
  CREDENTIALS,
  METABASE_EMAIL,
  METABASE_PASSWORD,
  METABASE_URL
} from '@e2e/support/constants'

/*
 * A broken Metabase card renders a warning icon and an error message
 * ("Something's gone wrong" / "There was a problem displaying this chart")
 * instead of the `visualization-root` content.
 */

const ERROR_TEXT = /something's gone wrong|there was a problem/i
const LOADING_SELECTOR =
  '[data-testid="loading-indicator"], [data-testid="loading-spinner"], .LoadingSpinner'

// Scalar cards title with `scalar-title`, chart and table cards with
// `legend-caption-title`. Markdown text cards have neither.
const CARD_TITLE_SELECTOR =
  '[data-testid="legend-caption-title"], [data-testid="scalar-title"]'

export async function expectNoBrokenCards(
  frame: FrameLocator,
  expectedCardTitles: string[],
  /** Cards without a title element, e.g. markdown intro cards */
  untitledCards = 0
) {
  // Wait for the dashboard grid to mount and all card queries to finish
  await expect(frame.locator('[data-testid="dashcard"]').first()).toBeVisible({
    timeout: 60_000
  })
  await expect(frame.locator(LOADING_SELECTOR)).toHaveCount(0, {
    timeout: 60_000
  })

  // Every expected card is present — none missing, none extra
  await expect(frame.locator(CARD_TITLE_SELECTOR)).toHaveText(
    expectedCardTitles
  )

  const cardCount = expectedCardTitles.length + untitledCards
  const dashcards = frame.locator('[data-testid="dashcard"]')
  await expect(dashcards).toHaveCount(cardCount)

  // Every card rendered its visualization container ("No results" included)
  await expect(
    frame.locator('[data-testid="dashcard"] [data-testid="visualization-root"]')
  ).toHaveCount(cardCount)

  // No card is in an error state
  await expect(dashcards.filter({ hasText: ERROR_TEXT })).toHaveCount(0)
  await expect(
    frame.locator('[data-testid="dashcard"] .Icon-warning')
  ).toHaveCount(0)
}

export async function expectBirthsTabSelected(frame: FrameLocator) {
  await expect(frame.getByRole('tab', { name: 'Births' })).toHaveAttribute(
    'aria-selected',
    'true',
    { timeout: 60_000 }
  )
}

function fullAddress(administrativeArea: string) {
  return {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea,
    streetLevelDetails: {
      town: faker.location.city(),
      residentialArea: faker.location.county(),
      street: faker.location.street(),
      number: faker.string.numeric(2),
      zipCode: faker.string.numeric(4)
    }
  }
}

function fullParentDetails(
  parent: 'mother' | 'father',
  administrativeArea: string
) {
  return {
    [`${parent}.name`]: {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    // Must be at least 18 years before child.dob to pass validation
    [`${parent}.dob`]: dateToIsoDateString(
      faker.date.between({ from: '1985-01-01', to: '2000-11-28' })
    ),
    [`${parent}.nationality`]: 'FAR',
    [`${parent}.idType`]: 'NATIONAL_ID',
    [`${parent}.nid`]: faker.string.numeric(10),
    [`${parent}.address`]: fullAddress(administrativeArea),
    [`${parent}.maritalStatus`]: 'MARRIED',
    [`${parent}.educationalAttainment`]: 'FIRST_STAGE_TERTIARY_ISCED_5',
    [`${parent}.occupation`]: faker.person.jobTitle()
  }
}

export async function populateDashboardRecords(page: Page) {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const administrativeAreas = await getAdministrativeAreas(token)
  const village = getIdByName(administrativeAreas, 'Klow')
  const facilities = await getLocations('HEALTH_FACILITY', token)
  const facilityId = getIdByName(facilities, 'Klow Village Hospital')

  const placeOfBirthVariants = [
    {
      'child.placeOfBirth': 'HEALTH_FACILITY',
      'child.birthLocation': facilityId,
      'child.birthLocationId': facilityId
    },
    {
      'child.placeOfBirth': 'PRIVATE_HOME',
      'child.birthLocation.privateHome': fullAddress(village),
      'child.birthLocationId': village
    },
    {
      'child.placeOfBirth': 'OTHER',
      'child.birthLocation.other': fullAddress(village),
      'child.birthLocationId': village
    }
  ]

  const records: CreateDeclarationResponse[] = []

  for (const [index, placeOfBirth] of placeOfBirthVariants.entries()) {
    const declaration = {
      'informant.relation': 'MOTHER',
      'informant.email': faker.internet.email(),

      'child.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'child.gender': (['male', 'female', 'unknown'] as const)[index],
      'child.dob': randomPastDate(14),
      ...placeOfBirth,
      'child.attendantAtBirth': (['PHYSICIAN', 'NURSE', 'MIDWIFE'] as const)[
        index
      ],
      'child.birthType': (['SINGLE', 'TWIN', 'TRIPLET'] as const)[index],
      'child.weightAtBirth': 3.5,

      ...fullParentDetails('mother', village),
      'mother.previousBirths': index,

      'father.detailsNotAvailable': false,
      ...fullParentDetails('father', village),
      'father.addressSameAs': 'NO'
    }

    records.push(await createDeclaration(token, declaration))
  }

  // ensure json is unfolded in metabase
  await page.goto(`${METABASE_URL}/admin/databases/2`)
  await page
    .locator('[placeholder="nicetoseeyou@email.com"]')
    .fill(METABASE_EMAIL)
  await page.locator('[placeholder="Shhh..."]').fill(METABASE_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await page.getByText('Sync database schema').click()
}
