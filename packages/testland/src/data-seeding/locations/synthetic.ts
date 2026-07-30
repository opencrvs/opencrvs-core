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
  LocationVersion,
  SetAdministrativeAreaPayload,
  SetLocationPayload,
  UUID
} from '@opencrvs/toolkit/events'
import { buildHistory, planHistoryLengths } from './synthetic-history'
import {
  createRng,
  deriveUuid,
  levelLabel,
  pickIndex,
  placeName
} from './synthetic-primitives'

export type SyntheticConfig = {
  adminAreasPerLevel: number[]
  totalLocations: number
  avgHistory: number
  maxHistory: number
  seed: number
}

/** Share of generated locations that are CRVS offices rather than facilities. */
const OFFICE_SHARE = 0.85

/** Share of generated locations pinned to the deepest administrative level. */
const LEAF_SHARE = 0.5

const AREA_PREFIX = 'gen-a-'
const LOCATION_PREFIX = 'gen-l-'

/**
 * Generates administrative areas and locations, each with a version history.
 *
 * Areas are returned level-ordered: `parent_id` is a non-deferrable FK and the
 * server inserts in chunks of 1000, so a child must never precede its parent.
 * Generated top-level areas have `parentId: null` — they sit alongside the
 * reference country's own roots rather than under them, so the requested depth
 * is the real depth, and the generated batch carries no dependency on the
 * reference rows `data-seeder` wrote moments earlier.
 */
export function generateSyntheticLocations(config: SyntheticConfig): {
  administrativeAreas: SetAdministrativeAreaPayload[]
  locations: SetLocationPayload[]
  summary: string
} {
  const rng = createRng(config.seed)
  const areaCount = config.adminAreasPerLevel.reduce(
    (sum, count) => sum + count,
    0
  )

  const areaLengths = planHistoryLengths(
    areaCount,
    config.avgHistory,
    config.maxHistory,
    rng
  )
  const locationLengths = planHistoryLengths(
    config.totalLocations,
    config.avgHistory,
    config.maxHistory,
    rng
  )

  const administrativeAreas: SetAdministrativeAreaPayload[] = []
  const idsByLevel: UUID[][] = []
  let areaIndex = 0

  for (const [levelOffset, count] of config.adminAreasPerLevel.entries()) {
    const level = levelOffset + 1
    const parentIds = idsByLevel[levelOffset - 1]
    const levelIds: UUID[] = []

    for (let position = 0; position < count; position++) {
      const id = deriveUuid(config.seed, 'area', areaIndex)
      const externalId = `${AREA_PREFIX}${padIndex(areaIndex + 1)}`
      const label = levelLabel(level)
      const baseName = `${placeName(config.seed, 'area', areaIndex)} ${label}`
      const at = areaIndex

      administrativeAreas.push({
        id,
        name: baseName,
        externalId,
        parentId: parentIds
          ? parentIds[pickIndex(rng, parentIds.length)]
          : null,
        versions: buildHistory({
          seed: config.seed,
          kind: 'area',
          index: areaIndex,
          length: areaLengths[areaIndex],
          baseName,
          // A rename moves the row to a different locality while keeping its
          // level label — what a boundary reorganisation looks like in practice.
          renamedName: (element) =>
            `${placeName(config.seed, `area-rename-${element}`, at)} ${label}`,
          externalId,
          rng
        })
      })

      levelIds.push(id)
      areaIndex++
    }

    idsByLevel.push(levelIds)
  }

  const deepestLevel = idsByLevel.length
  const locations: SetLocationPayload[] = []

  for (let index = 0; index < config.totalLocations; index++) {
    // Half sit at the deepest level, as real offices do; half are spread over
    // every level, which exercises hierarchy resolution at mixed depths.
    const level =
      rng() < LEAF_SHARE ? deepestLevel : 1 + pickIndex(rng, deepestLevel)
    const candidates = idsByLevel[level - 1]
    const isOffice = rng() < OFFICE_SHARE
    const externalId = `${LOCATION_PREFIX}${padIndex(index + 1)}`
    const label = isOffice ? 'Office' : 'Health Post'
    const baseName = `${placeName(config.seed, 'location', index)} ${label}`

    locations.push({
      id: deriveUuid(config.seed, 'location', index),
      name: baseName,
      externalId,
      administrativeAreaId: candidates[pickIndex(rng, candidates.length)],
      locationType: isOffice ? 'CRVS_OFFICE' : 'HEALTH_FACILITY',
      versions: buildHistory({
        seed: config.seed,
        kind: 'location',
        index,
        length: locationLengths[index],
        baseName,
        // A rename keeps the facility kind and moves the locality, e.g.
        // "Eastford Office" becoming "Westbrook Office".
        renamedName: (element) =>
          `${placeName(config.seed, `location-rename-${element}`, index)} ${label}`,
        externalId,
        rng
      })
    })
  }

  return {
    administrativeAreas,
    locations,
    summary: buildSummary(config, administrativeAreas, locations)
  }
}

function padIndex(value: number): string {
  return String(value).padStart(6, '0')
}

function buildSummary(
  config: SyntheticConfig,
  administrativeAreas: SetAdministrativeAreaPayload[],
  locations: SetLocationPayload[]
): string {
  const today = new Date().toISOString().slice(0, 10)
  const lengths = locations.map((location) => location.versions?.length ?? 0)
  const total = lengths.reduce((sum, length) => sum + length, 0)
  const offices = locations.filter(
    (location) => location.locationType === 'CRVS_OFFICE'
  ).length
  const pending = locations.filter(
    (location) => latest(location.versions).effectiveFrom > today
  ).length
  const inactive = locations.filter(
    (location) => resolveToday(location.versions, today).status === 'inactive'
  ).length

  const histogram = Array.from({ length: config.maxHistory }, (_, offset) => {
    const length = offset + 1
    const count = lengths.filter((value) => value === length).length

    return { length, count }
  }).filter(({ count }) => count > 0)

  const widest = Math.max(...histogram.map(({ count }) => count), 1)

  const lines = [
    `[synthetic] seed=${config.seed}`,
    `  admin areas ${administrativeAreas.length}  (${config.adminAreasPerLevel
      .map((count, offset) => `L${offset + 1} ${count}`)
      .join(', ')})`,
    `  locations   ${locations.length}  (CRVS_OFFICE ${offices} / HEALTH_FACILITY ${
      locations.length - offices
    })`,
    `  histories: mean ${(total / Math.max(lengths.length, 1)).toFixed(2)} (target ${
      config.avgHistory
    }), max ${Math.max(...lengths, 0)} (cap ${config.maxHistory})`,
    ...histogram.map(
      ({ length, count }) =>
        `    len ${String(length).padStart(2)}: ${String(count).padStart(6)} ${'#'.repeat(
          Math.max(1, Math.round((count / widest) * 20))
        )}`
    ),
    `  pending (future-dated) ${pending}  (${percent(pending, locations.length)})`,
    `  inactive today         ${inactive}  (${percent(inactive, locations.length)})`,
    `  externalIds ${AREA_PREFIX}000001..${padIndex(administrativeAreas.length)} / ${LOCATION_PREFIX}000001..${padIndex(
      locations.length
    )}`
  ]

  return lines.join('\n')
}

function latest(versions: LocationVersion[] = []): LocationVersion {
  return versions[versions.length - 1]
}

function resolveToday(
  versions: LocationVersion[] = [],
  today: string
): LocationVersion {
  let resolved = versions[0]

  for (const version of versions) {
    if (version.effectiveFrom <= today) {
      resolved = version
    }
  }

  return resolved
}

function percent(part: number, whole: number): string {
  if (whole === 0) {
    return '0.0%'
  }

  return `${((part / whole) * 100).toFixed(1)}%`
}
