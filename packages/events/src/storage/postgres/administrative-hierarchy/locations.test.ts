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

import {
  getUUID,
  SetAdministrativeAreaPayload,
  SetLocationPayload
} from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  systemInitialisationTestSetup
} from '@events/tests/utils'
import { getPool } from '@events/storage/postgres/events'
import {
  clearAdministrativeHierarchyCache,
  getAdministrativeHierarchyById,
  primeAdministrativeHierarchyCache
} from './locations'

/**
 * Seeds country > province > district, with an office in the district, and
 * returns their ids top-down.
 */
async function seedHierarchy() {
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const countryId = getUUID()
  const provinceId = getUUID()
  const districtId = getUUID()
  const officeId = getUUID()

  const administrativeAreas: SetAdministrativeAreaPayload[] = [
    { id: countryId, parentId: null, name: 'Country', externalId: countryId },
    {
      id: provinceId,
      parentId: countryId,
      name: 'Province',
      externalId: provinceId
    },
    {
      id: districtId,
      parentId: provinceId,
      name: 'District',
      externalId: districtId
    }
  ]

  const locations: SetLocationPayload[] = [
    {
      id: officeId,
      administrativeAreaId: districtId,
      name: 'District CRVS Office',
      locationType: 'CRVS_OFFICE'
    }
  ]

  await seeder.administrativeAreas.set(administrativeAreas)
  await seeder.locations.set(locations)

  return { countryId, provinceId, districtId, officeId }
}

test('resolves the same hierarchies the single-id lookup returns', async () => {
  const { countryId, provinceId, districtId, officeId } = await seedHierarchy()

  clearAdministrativeHierarchyCache()
  const individually = {
    office: await getAdministrativeHierarchyById(officeId),
    district: await getAdministrativeHierarchyById(districtId),
    country: await getAdministrativeHierarchyById(countryId)
  }

  clearAdministrativeHierarchyCache()
  await primeAdministrativeHierarchyCache([officeId, districtId, countryId])

  expect(await getAdministrativeHierarchyById(officeId)).toEqual(
    individually.office
  )
  expect(await getAdministrativeHierarchyById(districtId)).toEqual(
    individually.district
  )
  expect(await getAdministrativeHierarchyById(countryId)).toEqual(
    individually.country
  )

  expect(individually.office).toEqual([
    countryId,
    provinceId,
    districtId,
    officeId
  ])
  expect(individually.district).toEqual([countryId, provinceId, districtId])
  expect(individually.country).toEqual([countryId])
})

test('resolves a whole batch in a single query', async () => {
  const { countryId, districtId, officeId } = await seedHierarchy()
  const unknownId = getUUID()

  clearAdministrativeHierarchyCache()

  const connect = vi.spyOn(getPool(), 'connect')
  await primeAdministrativeHierarchyCache([
    officeId,
    districtId,
    countryId,
    unknownId
  ])
  const queriesWhilePriming = connect.mock.calls.length

  await getAdministrativeHierarchyById(officeId)
  await getAdministrativeHierarchyById(districtId)
  await getAdministrativeHierarchyById(countryId)
  await getAdministrativeHierarchyById(unknownId)

  expect(queriesWhilePriming).toBe(1)
  expect(connect.mock.calls.length).toBe(queriesWhilePriming)

  connect.mockRestore()
})

test('agrees with the single-id lookup on an id that resolves to nothing', async () => {
  await seedHierarchy()
  const unknownId = getUUID()

  clearAdministrativeHierarchyCache()
  const individually = await getAdministrativeHierarchyById(unknownId)

  clearAdministrativeHierarchyCache()
  await primeAdministrativeHierarchyCache([unknownId])

  expect(await getAdministrativeHierarchyById(unknownId)).toEqual(individually)
})

test('caches ids that resolve to nothing as an empty hierarchy', async () => {
  await seedHierarchy()
  const unknownId = getUUID()

  clearAdministrativeHierarchyCache()
  await primeAdministrativeHierarchyCache([unknownId])

  expect(await getAdministrativeHierarchyById(unknownId)).toEqual([])
})

test('queries nothing when every id is already cached', async () => {
  const { officeId } = await seedHierarchy()

  clearAdministrativeHierarchyCache()
  await primeAdministrativeHierarchyCache([officeId])

  const connect = vi.spyOn(getPool(), 'connect')
  await primeAdministrativeHierarchyCache([officeId, officeId])

  expect(connect).not.toHaveBeenCalled()
  connect.mockRestore()
})

test('ignores empty ids rather than querying for them', async () => {
  clearAdministrativeHierarchyCache()

  const connect = vi.spyOn(getPool(), 'connect')
  await primeAdministrativeHierarchyCache(['', ''])

  expect(connect).not.toHaveBeenCalled()
  connect.mockRestore()
})

test('does not cache a failed lookup', async () => {
  const { officeId } = await seedHierarchy()

  clearAdministrativeHierarchyCache()

  const connect = vi.spyOn(getPool(), 'connect')
  connect.mockRejectedValueOnce(new Error('connection lost'))
  await expect(primeAdministrativeHierarchyCache([officeId])).rejects.toThrow(
    'connection lost'
  )
  connect.mockRestore()

  // The retry sees a clean cache rather than the previous rejection.
  await primeAdministrativeHierarchyCache([officeId])
  expect(await getAdministrativeHierarchyById(officeId)).toContain(officeId)
})
