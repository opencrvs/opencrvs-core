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
  ClientLocation,
  JurisdictionFilter,
  PlainDate,
  toVersionedLocation,
  resolveVersion,
  todayISO,
  LocationVersion,
  UUID,
  V2_DEFAULT_MOCK_LOCATIONS,
  V2_DEFAULT_MOCK_CLIENT_LOCATIONS_MAP,
  V2_DEFAULT_MOCK_CLIENT_ADMINISTRATIVE_AREAS_MAP
} from '@opencrvs/commons/client'

import {
  buildHistoricalLocationNameOptions,
  findLocationOption,
  resolveLocationValue,
  toLocationId
} from '@client/v2-events/utils'
import { filterLocationsByJurisdiction } from './LocationSearch'

function nameOf(location: ClientLocation) {
  return resolveVersion(location.versions, todayISO()).name
}

/**
 * Mock data reference (from administrative-hierarchy-mock.ts):
 *
 * Admin hierarchy:
 *   Central → Ibombo → Klow
 *
 * Locations:
 *   - Klow Village Office    (CRVS_OFFICE, in Klow)
 *   - Ibombo District Office (CRVS_OFFICE, in Ibombo)
 *   - Chamakubi Health Post and many more HEALTH_FACILITYs (all in Ibombo, NOT in Klow)
 *
 * The real-world bug this covers:
 *   Gift Phiri (community leader) is assigned to Klow Village Office (CRVS_OFFICE).
 *   A HEALTH_FACILITY field has jurisdictionFilter='location'. Without the locationTypes
 *   check, Gift saw her own office (CRVS_OFFICE) as the only option and saved it.
 *   Kennedy Mweene (registrar, jurisdictionFilter='administrativeArea') filtered to
 *   HEALTH_FACILITYs only — the saved CRVS_OFFICE UUID was not found → field appeared empty.
 */

const locations = V2_DEFAULT_MOCK_CLIENT_LOCATIONS_MAP
const administrativeAreas = V2_DEFAULT_MOCK_CLIENT_ADMINISTRATIVE_AREAS_MAP

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const KLOW_VILLAGE_OFFICE = V2_DEFAULT_MOCK_LOCATIONS.find(
  (l) => l.name === 'Klow Village Office'
)!
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const IBOMBO_DISTRICT_OFFICE = V2_DEFAULT_MOCK_LOCATIONS.find(
  (l) => l.name === 'Ibombo District Office'
)!

describe('filterLocationsByJurisdiction', () => {
  describe("jurisdiction: 'location' — user sees only their own office", () => {
    it('returns the user office when its type matches the required locationTypes', () => {
      // A registrar at Ibombo District Office (CRVS_OFFICE) opening a CRVS_OFFICE field
      // should see exactly their own office and nothing else.
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: IBOMBO_DISTRICT_OFFICE.id,
        locationTypes: ['CRVS_OFFICE'],
        jurisdictionFilter: JurisdictionFilter.enum.location
      })

      expect(result).toHaveLength(1)
      expect(nameOf(result[0])).toBe('Ibombo District Office')
    })

    it('returns [] when the user office type does not match the required locationTypes', () => {
      // The core bug fix: Gift Phiri is at Klow Village Office (CRVS_OFFICE).
      // A HEALTH_FACILITY field with jurisdiction='location' must return nothing —
      // showing her CRVS_OFFICE as a HEALTH_FACILITY option was incorrect and caused
      // the saved value to be invisible to the registrar (who filtered by HEALTH_FACILITY).
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: KLOW_VILLAGE_OFFICE.id,
        locationTypes: ['HEALTH_FACILITY'],
        jurisdictionFilter: JurisdictionFilter.enum.location
      })

      expect(result).toHaveLength(0)
    })

    it('returns the user office when no locationTypes filter is specified', () => {
      // When the field has no locationTypes constraint, any office type is valid.
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: KLOW_VILLAGE_OFFICE.id,
        locationTypes: undefined,
        jurisdictionFilter: JurisdictionFilter.enum.location
      })

      expect(result).toHaveLength(1)
      expect(nameOf(result[0])).toBe('Klow Village Office')
    })
  })

  describe("jurisdiction: 'administrativeArea' — user sees locations within their admin hierarchy", () => {
    it('returns only locations whose admin area is within the user office admin hierarchy', () => {
      // Kennedy (registrar) is at Ibombo District Office (admin area: Ibombo).
      // He should see all HEALTH_FACILITYs that are under Ibombo.
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: IBOMBO_DISTRICT_OFFICE.id,
        locationTypes: ['HEALTH_FACILITY'],
        jurisdictionFilter: JurisdictionFilter.enum.administrativeArea
      })

      expect(result.length).toBeGreaterThan(0)
      expect(result.every((l) => l.locationType === 'HEALTH_FACILITY')).toBe(
        true
      )
      // Ibombo health facilities should be included
      expect(result.some((l) => nameOf(l) === 'Chamakubi Health Post')).toBe(
        true
      )
      expect(
        result.some((l) => nameOf(l) === 'Ibombo Rural Health Centre')
      ).toBe(true)
    })

    it('does not include locations from a different admin area at the same level', () => {
      // Ibombo District Office is in Ibombo. Isango District Office is a sibling under
      // Central but NOT under Ibombo — it should not appear in Kennedy's options.
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: IBOMBO_DISTRICT_OFFICE.id,
        locationTypes: ['CRVS_OFFICE'],
        jurisdictionFilter: JurisdictionFilter.enum.administrativeArea
      })

      expect(result.some((l) => nameOf(l) === 'Isango District Office')).toBe(
        false
      )
    })

    it('returns [] when no locations of the required type exist in the user admin hierarchy', () => {
      // Klow Village Office sits in the Klow sub-area of Ibombo.
      // The mock data has no HEALTH_FACILITYs directly under Klow, so the result is empty.
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: KLOW_VILLAGE_OFFICE.id,
        locationTypes: ['HEALTH_FACILITY'],
        jurisdictionFilter: JurisdictionFilter.enum.administrativeArea
      })

      expect(result).toHaveLength(0)
    })

    it('returns [] when userLocationId is unknown', () => {
      // Without knowing the user's office we cannot determine their admin hierarchy,
      // so no locations should be shown — returning allOptions would expose data
      // outside their jurisdiction.
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: undefined,
        locationTypes: ['HEALTH_FACILITY'],
        jurisdictionFilter: JurisdictionFilter.enum.administrativeArea
      })

      expect(result).toHaveLength(0)
    })
  })

  describe('no jurisdiction filter — user sees all locations', () => {
    it('returns all locations matching the locationTypes regardless of the user office', () => {
      // When the field imposes no jurisdiction restriction, all locations of the
      // requested type should be available — e.g. a national-level administrator.
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: KLOW_VILLAGE_OFFICE.id,
        locationTypes: ['HEALTH_FACILITY'],
        jurisdictionFilter: undefined
      })

      const allHealthFacilities = V2_DEFAULT_MOCK_LOCATIONS.filter(
        (l) => l.locationType === 'HEALTH_FACILITY'
      )
      expect(result).toHaveLength(allHealthFacilities.length)
    })

    it('returns every location when no locationTypes filter is specified either', () => {
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: undefined,
        locationTypes: undefined,
        jurisdictionFilter: undefined
      })

      expect(result).toHaveLength(V2_DEFAULT_MOCK_LOCATIONS.length)
    })

    it('returns both CRVS offices and health facilities when both types are specified', () => {
      // Verifies that the filter correctly handles multiple location types in one call.
      // Related: the registration office dropdown in user create/edit was fixed by
      // removing the locationTypes restriction entirely (so all location types are shown).
      const result = filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId: undefined,
        locationTypes: ['CRVS_OFFICE', 'HEALTH_FACILITY'],
        jurisdictionFilter: undefined
      })

      expect(result.some((l) => l.locationType === 'CRVS_OFFICE')).toBe(true)
      expect(result.some((l) => l.locationType === 'HEALTH_FACILITY')).toBe(
        true
      )
      expect(result).toHaveLength(V2_DEFAULT_MOCK_LOCATIONS.length)
    })
  })
})
// Generates version ids for testing
function versionIdOf(id: string, index: number) {
  return `${id.slice(0, 24)}${String(index).padStart(12, '0')}` as UUID
}

/** The pin a dropdown row would carry for the version at `index`. */
function pinOf(id: string, index: number) {
  return toVersionedLocation(id as UUID, versionIdOf(id, index))
}

/**
 * Builds a location-like item with one version per supplied name. `name` (the
 * server-resolved current name) is set to the last version's name.
 */
function makeVersionedItem(id: string, names: string[]) {
  const versions: LocationVersion[] = names.map((name, index) => ({
    versionId: versionIdOf(id, index),
    effectiveFrom: `2020-01-${String(index + 1).padStart(2, '0')}`,
    name,
    externalId: null,
    status: 'active' as const
  }))

  return {
    id: id as UUID,
    name: names[names.length - 1],
    versions
  }
}

describe('buildHistoricalLocationNameOptions', () => {
  it('lists a renamed location once per name, each pinned to its own version', () => {
    const id = '11111111-1111-4111-8111-111111111111'
    const items = [makeVersionedItem(id, ['Office A', 'Office Z'])]

    const options = buildHistoricalLocationNameOptions(items)

    // Both rows point at the same location, but each pins the version whose
    // name it shows — that is what keeps them apart once one is picked.
    expect(options).toEqual([
      { value: pinOf(id, 0), label: 'Office A' },
      { value: pinOf(id, 1), label: 'Office Z' }
    ])
  })

  it('does not repeat a name carried by more than one version', () => {
    const id = '22222222-2222-4222-8222-222222222222'
    // A status change that leaves the name alone must not show up as a second,
    // identical row.
    const items = [
      makeVersionedItem(id, ['Alaminos', 'Alaminos', 'Alaminos City'])
    ]

    const options = buildHistoricalLocationNameOptions(items)

    expect(options.map((o) => o.label)).toEqual(['Alaminos', 'Alaminos City'])
    // The surviving row is pinned to the version that first carried the name.
    expect(options[0].value).toBe(pinOf(id, 0))
  })

  it('does not repeat a name reinstated after a rename', () => {
    const id = '22222222-2222-4222-8222-222222222222'
    const items = [
      makeVersionedItem(id, ['Alaminos', 'Alaminos City', 'Alaminos'])
    ]

    const options = buildHistoricalLocationNameOptions(items)

    // Two rows, not three. A reinstated name is still one name: a second row
    // would be indistinguishable in the dropdown and would search the same
    // records, since the name picked never narrows results.
    expect(options.map((o) => [o.label, o.value])).toEqual([
      ['Alaminos', pinOf(id, 0)],
      ['Alaminos City', pinOf(id, 1)]
    ])
  })

  it('yields a single row for a never-renamed location', () => {
    const id = '33333333-3333-4333-8333-333333333333'
    const items = [makeVersionedItem(id, ['Ibombo District Office'])]

    const options = buildHistoricalLocationNameOptions(items)

    expect(options).toEqual([
      { value: pinOf(id, 0), label: 'Ibombo District Office' }
    ])
  })
})

describe('resolveLocationValue', () => {
  const id = '44444444-4444-4444-8444-444444444444'
  const renamed = makeVersionedItem(id, ['Old Name', 'New Name'])
  const entities = new Map([[renamed.id, renamed]])

  it('resolves a pinned selection to the name that version carried', () => {
    const [oldNameOption] = buildHistoricalLocationNameOptions([renamed])

    expect(
      resolveLocationValue(oldNameOption.value, entities, todayISO())?.version
        .name
    ).toBe('Old Name')
  })

  it('resolves a bare location id at the anchor, as declarations do', () => {
    expect(resolveLocationValue(id, entities, todayISO())?.version.name).toBe(
      'New Name'
    )
    expect(
      resolveLocationValue(id, entities, PlainDate.parse('2020-01-01'))?.version
        .name
    ).toBe('Old Name')
  })

  it('falls back to the anchored version when the pinned one is gone', () => {
    // Locations re-imported since the search link was saved: the version id it
    // carries no longer exists, but the location does.
    expect(
      resolveLocationValue(pinOf(id, 9), entities, todayISO())?.version.name
    ).toBe('New Name')
  })

  it('returns undefined for an id that names neither', () => {
    expect(
      resolveLocationValue(
        '55555555-5555-4555-8555-555555555555',
        entities,
        todayISO()
      )
    ).toBeUndefined()
  })
})

describe('toLocationId', () => {
  const id = '66666666-6666-4666-8666-666666666666'
  const renamed = makeVersionedItem(id, ['Old Name', 'New Name'])

  it('narrows a pinned selection back to the location it names', () => {
    const [oldNameOption] = buildHistoricalLocationNameOptions([renamed])

    expect(toLocationId(oldNameOption.value)).toBe(id)
  })

  it('passes a bare id and an absent value through untouched', () => {
    expect(toLocationId(id)).toBe(id)
    expect(toLocationId(undefined)).toBeUndefined()
    expect(toLocationId(null)).toBeUndefined()
  })
})

describe('findLocationOption', () => {
  const id = '77777777-7777-4777-8777-777777777777'
  const renamed = makeVersionedItem(id, ['Old Name', 'New Name'])
  const options = buildHistoricalLocationNameOptions([renamed])

  it('matches a pinned value on the version it pins', () => {
    expect(findLocationOption(options, options[0].value)?.label).toBe(
      'Old Name'
    )
    expect(findLocationOption(options, options[1].value)?.label).toBe(
      'New Name'
    )
  })

  it('matches a bare id on the location instead of the version', () => {
    // Every row's value is a version id here, so without this fallback a
    // declaration default value or a search link saved before historical names
    // were listed would leave the selector empty while still filtering by it.
    expect(findLocationOption(options, id)?.label).toBe('Old Name')
  })

  it('matches a bare id against rows that carry no pin', () => {
    const currentNameOnly = [{ value: renamed.id, label: 'New Name' }]

    expect(findLocationOption(currentNameOnly, id)?.label).toBe('New Name')
  })

  it('falls back to the location when the pinned version is gone', () => {
    expect(findLocationOption(options, pinOf(id, 9))?.label).toBe('Old Name')
  })

  it('returns null for an absent value or an unknown id', () => {
    expect(findLocationOption(options, undefined)).toBeNull()
    expect(findLocationOption(options, null)).toBeNull()
    expect(
      findLocationOption(options, '88888888-8888-4888-8888-888888888888')
    ).toBeNull()
  })
})
