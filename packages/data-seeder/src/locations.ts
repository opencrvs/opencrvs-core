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
import fetch from 'node-fetch'
import { env } from './environment'
import { z } from 'zod'
import { raise } from './utils'
import { fromZodError } from 'zod-validation-error'
import { getUUID, LocationVersion } from '@opencrvs/commons'
import { createInitialisationClient } from './initialisation-client'
import { formatUnwrittenFailure } from './seed-failure'
import { Read, validatedContents } from './read'

/** Strict, here and below: every optional field is one a typo can silently
 * drop — an unrecognised `verisons` would cost a location its whole history
 * without a word. */
const RawLocationVersionSchema = z.strictObject({
  effectiveFrom: z.iso.date().optional(),
  name: z.string(),
  externalId: z.string().optional(),
  status: z.enum(['active', 'inactive'])
})

const RawLocationSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  partOf: z.string(),
  locationType: z.string(),
  versions: z.array(RawLocationVersionSchema).optional()
})

const RawAdministrativeAreaSchema = RawLocationSchema.omit({
  locationType: true
})

const CountryConfigLocationResponse = z.object({
  locations: z.array(RawLocationSchema),
  administrativeAreas: z.array(RawAdministrativeAreaSchema)
})

/** One node of the hierarchy that parsed: an administrative area or a
 * location. The ids here are the country config's own, which is what an office
 * reference and a node's `partOf` are written in terms of. */
export interface ParsedPlace {
  id: string
  name: string
  /** `Location/<id>`, or `Location/0` at the root of the hierarchy. */
  partOf: string
}

/** Which half of the hierarchy a node belongs to. Only locations are offices,
 * and only areas are ever parents. */
export type PlaceKind = 'administrativeArea' | 'location'

interface PlaceRef {
  place: PlaceKind
  id: string
  name: string
}

export type LocationProblem =
  | { kind: 'hierarchyUnparsed'; message: string }
  | { kind: 'unparentedNode'; node: PlaceRef; partOf: string }

/** What the write path sends. The ids here are freshly minted, and the
 * country config's own ids survive as `externalId`. */
export interface LocationPayload {
  administrativeAreas: {
    id: string
    name: string
    parentId: string | null
    externalId: string
    versions?: LocationVersion[]
  }[]
  locations: {
    id: string
    name: string
    administrativeAreaId: string | null
    locationType: string
    externalId: string
    versions?: LocationVersion[]
  }[]
}

/**
 * `payload` is kept alongside the parsed nodes because minting the ids discards
 * the `partOf` the checks need, and states a parent as an id the checks have no
 * way to resolve.
 */
export type LocationRead = Read<
  {
    administrativeAreas: ParsedPlace[]
    locations: ParsedPlace[]
    payload: LocationPayload
  },
  LocationProblem
>

/**
 * Builds a seedable `versions` history from the country config's raw version
 * entries: assigns each element a fresh `versionId` and defaults an absent
 * `effectiveFrom` to the beginning-of-time sentinel, since the `set`
 * mutation's schema requires every element to carry both, unlike the raw
 * wire format.
 */
function buildSeededVersions(
  rawVersions: z.output<typeof RawLocationVersionSchema>[] | undefined
): LocationVersion[] | undefined {
  if (!rawVersions) {
    return undefined
  }

  return rawVersions.map((version) => ({
    versionId: getUUID(),
    effectiveFrom: version.effectiveFrom || '0001-01-01',
    name: version.name,
    externalId: version.externalId ?? null,
    status: version.status
  }))
}

function buildPayload({
  administrativeAreas,
  locations
}: z.output<typeof CountryConfigLocationResponse>): LocationPayload {
  const administrativeHierarchyIdMap = new Map(
    administrativeAreas.map(({ id }) => [id, getUUID()])
  )

  const locationIdMap = new Map(locations.map(({ id }) => [id, getUUID()]))

  return {
    administrativeAreas: administrativeAreas.map((a) => ({
      id: administrativeHierarchyIdMap.get(a.id)!,
      name: a.name,
      parentId:
        administrativeHierarchyIdMap.get(a.partOf.split('/')[1]) || null,
      externalId: a.id,
      versions: buildSeededVersions(a.versions)
    })),
    locations: locations.map((loc) => ({
      id: locationIdMap.get(loc.id)!,
      name: loc.name,
      administrativeAreaId:
        administrativeHierarchyIdMap.get(loc.partOf.split('/')[1]) || null,
      locationType: loc.locationType,
      externalId: loc.id,
      versions: buildSeededVersions(loc.versions)
    }))
  }
}

export const ROOT_ADMINISTRATIVE_AREA_ID = '0'

/** One check covers both halves of the hierarchy: areas nest inside areas and
 * locations hang off them, so only areas are ever parents. */
function unparentedNodes(
  nodes: ParsedPlace[],
  place: PlaceKind,
  declaredAreas: Set<string>
): LocationProblem[] {
  return nodes
    .filter(({ partOf }) => {
      const parentId = partOf.split('/')[1]
      return (
        parentId !== ROOT_ADMINISTRATIVE_AREA_ID && !declaredAreas.has(parentId)
      )
    })
    .map(({ id, name, partOf }) => ({
      kind: 'unparentedNode' as const,
      node: { place, id, name },
      partOf
    }))
}

function brokenHierarchy(
  administrativeAreas: ParsedPlace[],
  locations: ParsedPlace[]
): LocationProblem[] {
  const declaredAreas = new Set(administrativeAreas.map(({ id }) => id))

  return [
    ...unparentedNodes(
      administrativeAreas,
      'administrativeArea',
      declaredAreas
    ),
    ...unparentedNodes(locations, 'location', declaredAreas)
  ]
}

export function parseLocations(document: unknown): LocationRead {
  const parsed = CountryConfigLocationResponse.safeParse(document)

  if (!parsed.success) {
    return {
      readable: false,
      problem: {
        kind: 'hierarchyUnparsed',
        message: fromZodError(parsed.error, { prefix: null }).message
      }
    }
  }

  const { administrativeAreas, locations } = parsed.data

  return {
    readable: true,
    administrativeAreas,
    locations,
    payload: buildPayload(parsed.data),
    problems: brokenHierarchy(administrativeAreas, locations)
  }
}

export async function readLocations(): Promise<LocationRead> {
  const url = new URL('config/locations', env.COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)

  if (!res.ok) {
    raise(formatUnwrittenFailure(`Expected to get the locations from ${url}`))
  }

  return parseLocations(await res.json())
}

export function parsedPlaces(read: LocationRead): {
  administrativeAreas: ParsedPlace[]
  locations: ParsedPlace[]
} {
  return read.readable
    ? {
        administrativeAreas: read.administrativeAreas,
        locations: read.locations
      }
    : { administrativeAreas: [], locations: [] }
}

/**
 * The offices the seed-data declares
 */
export function getDeclaredOffices(read: LocationRead): Set<string> {
  return new Set(parsedPlaces(read).locations.map(({ id }) => id))
}

/** The payload to write, which only exists once validation has passed. */
export function toLocationPayload(read: LocationRead): LocationPayload {
  return validatedContents(read, 'The hierarchy').payload
}

export async function seedLocations(
  token: string,
  { administrativeAreas, locations }: LocationPayload
) {
  const client = createInitialisationClient(token)

  await client.administrativeAreas.set.mutate(administrativeAreas)
  await client.locations.set.mutate(locations)
}
