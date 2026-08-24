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
import { expect, type Page } from '@playwright/test'
import { omit, merge } from 'lodash'
import { formatName, getRandomDate, joinValuesWith } from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { GATEWAY_HOST } from '@e2e/support/constants'
import { createClient } from '@opencrvs/toolkit/api'

export const REQUIRED_VALIDATION_ERROR = 'Required'

export async function validateAddress(
  page: Page,
  address: Record<string, any>,
  elementTestId: string
) {
  // selection is not rendered as part of the address.
  const addressWithoutGeographicalArea = omit(address, 'urbanOrRural')

  for (const val of Object.values(addressWithoutGeographicalArea)) {
    if (typeof val === 'string') {
      await expect(page.getByTestId(elementTestId).getByText(val)).toBeVisible()
    }
  }
}

export async function fillDate(
  page: Page,
  date: { dd: string; mm: string; yyyy: string }
) {
  await page.getByPlaceholder('dd').fill(date.dd)
  await page.getByPlaceholder('mm').fill(date.mm)
  await page.getByPlaceholder('yyyy').fill(date.yyyy)
}

export async function fillChildDetails(page: Page) {
  const firstName = faker.person.firstName('female')
  const lastName = faker.person.lastName('female')
  await page.locator('#firstname').fill(firstName)
  await page.locator('#surname').fill(lastName)

  return formatName({ firstNames: firstName, familyName: lastName })
}

export async function openBirthDeclaration(page: Page) {
  await page.click('#header-new-event')
  await page.getByLabel('Birth').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  return page
}

export const formatV2ChildName = (obj: {
  'child.name': { firstname: string; surname: string }
  [key: string]: any
}) => {
  return joinValuesWith([
    obj['child.name'].firstname,
    obj['child.name'].surname
  ])
}

export async function assertRecordInWorkqueue({
  page,
  name,
  workqueues
}: {
  page: Page
  name: string
  workqueues: { title: string; exists: boolean }[]
}) {
  const record = page.getByRole('button', { name, exact: true })

  // if positive checks are done first, absence should be visible immediately.
  const ordered = [...workqueues].sort(
    (a, b) => Number(b.exists) - Number(a.exists)
  )

  const openWorkqueue = async (title: string) => {
    await page.getByRole('button', { name: title }).click()
    await expect(page.getByTestId('search-result')).toContainText(title)
  }

  let settled = false

  for (const { title, exists } of ordered) {
    if (exists && !settled) {
      // Re-click the queue to force a refetch
      // instead of waiting for the next poll cycle
      await expect(async () => {
        await openWorkqueue(title)
        await expect(record).toBeVisible({ timeout: 1_500 })
      }).toPass({ timeout: 30_000 })
      settled = true
      continue
    }

    await openWorkqueue(title)

    if (exists) {
      await expect(record).toBeVisible()
    } else {
      await expect(record).toBeHidden()
    }
  }
}

export async function getLocations(
  type: 'HEALTH_FACILITY' | 'CRVS_OFFICE',
  token: string
) {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  const locations = await client.locations.list.query({
    locationType: type
  })
  return locations
}

export async function getAdministrativeAreas(token: string) {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  const locations = await client.administrativeAreas.list.query()

  return locations
}

export function getIdByName(
  items: { name: string; id: string }[],
  name: string
) {
  const location = items.find((item) => item.name === name)
  if (!location) {
    throw new Error(`Location with name ${name} not found`)
  }
  return location.id
}

export async function verifyMembersEnabled(page: Page, members: string[]) {
  for (const member of members) {
    const row = page.getByRole('row', { name: new RegExp(member) })
    await expect(row.getByText('Active')).toBeVisible()
    await expect(row.getByRole('button', { name: member })).toBeEnabled()
  }
}

export async function verifyMembersClickable(
  page: Page,
  members: string[],
  officeButtonName: string
) {
  for (const member of members) {
    const row = page.getByRole('row', { name: new RegExp(member) })
    await expect(row.getByText('Active')).toBeVisible()
    await row.getByRole('button', { name: member }).click()
    await expect(page.locator('#content-name')).toHaveText(member)
    await page.getByRole('button', { name: officeButtonName }).click()
    await expect(page).toHaveURL(/.*\/team/)
  }
}
export async function verifyTeamMembers(
  page: Page,
  team: { name: string; role: string; disabled?: boolean }[]
) {
  const rows = page.locator('#user_list tr:has(td)')

  for (const member of team) {
    const row = rows.filter({ hasText: member.name })
    await expect(row).toHaveCount(1)

    await expect(row.getByText(member.role)).toBeVisible()
    await expect(row.getByText('Active')).toBeVisible()

    const memberButton = row.getByRole('button', { name: member.name })
    if (member.disabled) {
      await expect(memberButton).toBeDisabled()
    } else {
      await expect(memberButton).toBeEnabled()
    }
  }
}
type PlaceOfBirth = 'Health Institution' | 'Other'

type BirthLocationInputs<P extends PlaceOfBirth> = P extends 'Other'
  ? {
      placeOfBirth: 'Other'
      birthLocation: {
        country: string
        province: string
        district: string
        village: string
        town: string
        residentialArea: string
        street: string
        number: string
        postcodeOrZip: string
      }
    }
  : {
      placeOfBirth: 'Health Institution'
      birthLocation: { facility: string }
    }

function generateBirthLocationInputs<P extends PlaceOfBirth>(
  placeOfBirth: P
): BirthLocationInputs<P> {
  if (placeOfBirth === 'Other') {
    return {
      placeOfBirth: 'Other',
      birthLocation: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo',
        village: 'Klow',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    } as BirthLocationInputs<P>
  }

  return {
    placeOfBirth: 'Health Institution',
    birthLocation: { facility: 'Klow Village Hospital' }
  } as BirthLocationInputs<P>
}

function generateRequiredBirthInputs<
  P extends PlaceOfBirth = 'Health Institution'
>(placeOfBirth: P = 'Health Institution' as P) {
  return {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200)
    },
    ...generateBirthLocationInputs(placeOfBirth),
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        village: 'Xhosa'
      }
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        sameAsMother: true
      }
    }
  }
}

function generateOptionalBirthInputs() {
  return {
    attendantAtBirth: 'Physician',
    birthType: 'Single',
    weightAtBirth: 2.4,
    mother: {
      address: {
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      },
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling'
    },
    father: {
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling'
    }
  }
}

type RequiredBirthInputs<P extends PlaceOfBirth = 'Health Institution'> =
  ReturnType<typeof generateRequiredBirthInputs<P>>
type OptionalBirthInputs = ReturnType<typeof generateOptionalBirthInputs>

export function generateBirthInputs(options: {
  includeOptionalFields: true
  placeOfBirth?: 'Health Institution'
}): RequiredBirthInputs<'Health Institution'> & OptionalBirthInputs

export function generateBirthInputs(options: {
  includeOptionalFields: true
  placeOfBirth: 'Other'
}): RequiredBirthInputs<'Other'> & OptionalBirthInputs

export function generateBirthInputs(options?: {
  includeOptionalFields?: false
  placeOfBirth?: 'Health Institution'
}): RequiredBirthInputs<'Health Institution'>

export function generateBirthInputs(options: {
  includeOptionalFields?: false
  placeOfBirth: 'Other'
}): RequiredBirthInputs<'Other'>

export function generateBirthInputs(options?: {
  includeOptionalFields?: boolean
  placeOfBirth?: PlaceOfBirth
}) {
  const placeOfBirth = options?.placeOfBirth ?? 'Health Institution'
  const requiredInputs = generateRequiredBirthInputs(placeOfBirth)

  return options?.includeOptionalFields
    ? merge(requiredInputs, generateOptionalBirthInputs())
    : requiredInputs
}
