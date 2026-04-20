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
import { JurisdictionFilter } from '@opencrvs/commons/client'
import {
  V2_DEFAULT_MOCK_LOCATIONS,
  V2_DEFAULT_MOCK_LOCATIONS_MAP,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP
} from '@client/tests/v2-events/administrative-hierarchy-mock'
import { filterLocationsByJurisdiction } from './LocationSearch'

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

const locations = V2_DEFAULT_MOCK_LOCATIONS_MAP
const administrativeAreas = V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP

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
      expect(result[0].name).toBe('Ibombo District Office')
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
      expect(result[0].name).toBe('Klow Village Office')
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
      expect(result.some((l) => l.name === 'Chamakubi Health Post')).toBe(true)
      expect(result.some((l) => l.name === 'Ibombo Rural Health Centre')).toBe(
        true
      )
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

      expect(result.some((l) => l.name === 'Isango District Office')).toBe(
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
  })
})
