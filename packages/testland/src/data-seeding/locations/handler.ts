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
import { readCSVToJSON } from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'

type HumdataLocation = {
  admin0Pcode: string
  admin0Name_en: string

  admin1Pcode?: string
  admin1Name_en?: string

  admin2Pcode?: string
  admin2Name_en?: string

  admin3Pcode?: string
  admin3Name_en?: string

  admin4Pcode?: string
  admin4Name_en?: string
}

type AdministrativeArea = {
  id: string
  name: string
  partOf: string
  versions?: LocationVersion[]
}

type Location = {
  id: string
  name: string
  partOf: string
  locationType: string
  versions?: LocationVersion[]
}

/**
 * A single row of `location-versions.csv` / `administrative-area-versions.csv`,
 * referencing the base row it belongs to via `locationId` /
 * `administrativeAreaId`. `effectiveFrom` may be left empty in the CSV — the
 * consumer is responsible for defaulting it. `externalId` is not a per-version
 * column here: it's always the base row's own id, since these CSVs only model
 * renames/inactivations, not recodes.
 */
type LocationVersion = {
  effectiveFrom?: string
  name: string
  externalId: string
  status: 'active' | 'inactive'
}

/**
 * CSV sentinel for a version that shouldn't be effective yet, e.g. `FUTURE-2`
 * resolves to two days from whenever this handler runs. Keeps the fixture
 * "not yet effective" no matter when tests actually run, rather than going
 * stale once a hardcoded future date is reached.
 */
const FUTURE_VERSION_PATTERN = /^FUTURE-(\d+)$/

function resolveEffectiveFrom(effectiveFrom: string): string | undefined {
  const match = FUTURE_VERSION_PATTERN.exec(effectiveFrom)
  if (!match) {
    return effectiveFrom || undefined
  }

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + Number(match[1]))
  return futureDate.toISOString().split('T')[0]
}

type LocationVersionRow = {
  locationId: string
  effectiveFrom: string // '' when the CSV cell is left empty, not omitted
  name: string
  status: string
}

type AdministrativeAreaVersionRow = {
  administrativeAreaId: string
  effectiveFrom: string // '' when the CSV cell is left empty, not omitted
  name: string
  status: string
}

/** Groups version rows by their reference id, sorted ascending by `effectiveFrom` (empty sorts first). */
function groupVersionsByRefId<R extends Record<string, string>>(
  rows: R[],
  refIdKey: keyof R
): Map<string, LocationVersion[]> {
  const grouped = new Map<string, R[]>()
  rows.forEach((row) => {
    const refId = row[refIdKey]
    grouped.set(refId, [...(grouped.get(refId) ?? []), row])
  })

  return new Map(
    Array.from(grouped.entries()).map(([refId, refRows]) => [
      refId,
      refRows
        .map((row) => ({
          effectiveFrom: resolveEffectiveFrom(row.effectiveFrom),
          name: row.name,
          externalId: refId,
          status: row.status as LocationVersion['status']
        }))
        .sort((a, b) =>
          (a.effectiveFrom ?? '') < (b.effectiveFrom ?? '') ? -1 : 1
        )
    ])
  )
}

export async function locationsHandler(_: Request, h: ResponseToolkit) {
  const [
    humdataLocations,
    locations,
    locationVersionRows,
    administrativeAreaVersionRows
  ] = await Promise.all([
    readCSVToJSON<HumdataLocation[]>(
      './src/data-seeding/locations/source/administrative-areas.csv'
    ),
    readCSVToJSON<Location[]>(
      './src/data-seeding/locations/source/locations.csv'
    ),
    readCSVToJSON<LocationVersionRow[]>(
      './src/data-seeding/locations/source/location-versions.csv'
    ),
    readCSVToJSON<AdministrativeAreaVersionRow[]>(
      './src/data-seeding/locations/source/administrative-area-versions.csv'
    )
  ])

  const locationVersionsById = groupVersionsByRefId(
    locationVersionRows,
    'locationId'
  )
  const administrativeAreaVersionsById = groupVersionsByRefId(
    administrativeAreaVersionRows,
    'administrativeAreaId'
  )

  const administrativeAreas = new Map<string, AdministrativeArea>()
  humdataLocations.forEach((humdataLocation) => {
    ;([1, 2, 3, 4] as const).forEach((locationLevel) => {
      const id = humdataLocation[`admin${locationLevel}Pcode`]
      if (id) {
        const nonEmptyLevels = ([1, 2, 3, 4] as const)
          .slice(0, locationLevel)
          .filter((l) => humdataLocation[`admin${l}Pcode`])
        const depth = nonEmptyLevels.length
        const parentPcode = nonEmptyLevels[depth - 2]
        const partOf = parentPcode
          ? `Location/${humdataLocation[`admin${parentPcode}Pcode`]}`
          : 'Location/0'

        administrativeAreas.set(id, {
          id,
          name: humdataLocation[`admin${locationLevel}Name_en`]!,
          partOf,
          versions: administrativeAreaVersionsById.get(id)
        })
      }
    })
  })
  return h.response({
    administrativeAreas: Array.from(administrativeAreas.values()),
    locations: locations.map((location) => ({
      ...location,
      versions: locationVersionsById.get(location.id)
    }))
  })
}
