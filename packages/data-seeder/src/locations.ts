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

const RawLocationVersionSchema = z.object({
  effectiveFrom: z.string().optional(),
  name: z.string(),
  externalId: z.string().optional(),
  status: z.enum(['active', 'inactive'])
})

const RawLocationSchema = z.object({
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

/**
 * Builds a seedable `versions` history from the country config's raw version
 * rows: assigns each element a fresh `versionId` and defaults an empty
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

/** The administrative hierarchy, fetched and parsed but neither written nor
 * structurally checked here; the entry point validates the whole set of
 * seed-data first. Returns the parsed seed-data alongside the rows to write,
 * because the transform below discards the `partOf` the validator needs. */
export async function getLocations() {
  const url = new URL('config/locations', env.COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(formatUnwrittenFailure(`Expected to get the locations from ${url}`))
  }

  const parsedResponse = CountryConfigLocationResponse.safeParse(
    await res.json()
  )
  if (!parsedResponse.success) {
    raise(
      formatUnwrittenFailure(
        fromZodError(parsedResponse.error, {
          prefix: `Error validating locations data returned from ${url}`
        }).message
      )
    )
  }

  const { administrativeAreas, locations } = parsedResponse.data

  const administrativeHierarchyIdMap = new Map(
    administrativeAreas.map(({ id }) => [id, getUUID()])
  )

  const locationIdMap = new Map(locations.map(({ id }) => [id, getUUID()]))

  return {
    // For the validator: the ids here are the country config's own, which is
    // what an office reference and a node's `partOf` are written in terms of.
    seedData: parsedResponse.data,
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

export type SeedLocations = Awaited<ReturnType<typeof getLocations>>

export async function seedLocations(
  token: string,
  { administrativeAreas, locations }: SeedLocations
) {
  const client = createInitialisationClient(token)

  await client.administrativeAreas.set.mutate(administrativeAreas)
  await client.locations.set.mutate(locations)
}
