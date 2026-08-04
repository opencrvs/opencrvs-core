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
import { getUUID } from '@opencrvs/commons'
import { createInitialisationClient } from './index'

const RawLocationSchema =
  z.object({
    id: z.string(),
    name: z.string(),
    partOf: z.string(),
    locationType: z.string()
  })

const RawAdministrativeAreaSchema = RawLocationSchema.omit({ locationType: true })

const CountryConfigLocationResponse = z.object({
  locations: z.array(RawLocationSchema),
  administrativeAreas: z.array(RawAdministrativeAreaSchema)
})

function validateAdminStructure(locations: z.output<typeof CountryConfigLocationResponse>['administrativeAreas']) {
  const locationsMap = new Map(
    locations.map((loc) => {
      return [loc.id, loc]
    })
  )

  // Create a map of parent-child relationships
  const locationNodeMap = new Map(
    locations.map((loc) => [
      loc.id,
      { id: loc.id, children: new Array<string>() }
    ])
  )
  // this is the root location
  locationNodeMap.set('0', { id: '0', children: [] })

  locations.forEach((loc) => {
    const parent = locationNodeMap.get(loc.partOf.split('/')[1])
    if (!parent) {
      raise(`Parent location "${loc.partOf}" not found for ${loc.name}`)
    }
    parent.children.push(loc.id)
  })

  return locationsMap
}

async function getLocations() {
  const url = new URL('config/locations', env.COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the locations from ${url}`)
  }

  const parsedResponse = CountryConfigLocationResponse.safeParse(await res.json())
  if (!parsedResponse.success) {
    raise(
      fromZodError(parsedResponse.error, {
        prefix: `Error validating locations data returned from ${url}`
      })
    )
  }

  const {administrativeAreas, locations} = parsedResponse.data

  const administrativeAreaMap = validateAdminStructure(administrativeAreas)

  const NULL_ADMINISTRATIVE_AREA_ID = '0'
  locations.forEach((location) => {
    const administrativeAreaId = location.partOf.split('/')[1]
    if (
      !administrativeAreaMap.get(administrativeAreaId) &&
      administrativeAreaId !== NULL_ADMINISTRATIVE_AREA_ID
    ) {
      raise(
        `Parent location "${location.partOf}" not found for ${location.name}`
      )
    }
  })

  const administrativeHierarchyIdMap = new Map(
    administrativeAreas.map(({ id }) => [id, getUUID()])
  )

  const locationIdMap = new Map(
    locations.map(({ id }) => [id, getUUID()])
  )

  return {
    administrativeAreas: administrativeAreas.map((a) => ({
      id: administrativeHierarchyIdMap.get(a.id)!,
      name: a.name,
      parentId:
        administrativeHierarchyIdMap.get(a.partOf.split('/')[1]) || null,
      externalId: a.id,
      validUntil: null
    })),
    locations: locations.map((loc) => ({
      id: locationIdMap.get(loc.id)!,
      name: loc.name,
      administrativeAreaId:
        administrativeHierarchyIdMap.get(loc.partOf.split('/')[1]) || null,
      locationType: loc.locationType,
      externalId: loc.id,
      validUntil: null
    }))
  }
}

export async function seedLocations(token: string) {
  const { administrativeAreas, locations } = await getLocations()

  const client = createInitialisationClient(token)

  await client.administrativeAreas.set.mutate(administrativeAreas)
  await client.locations.set.mutate(locations)
}
