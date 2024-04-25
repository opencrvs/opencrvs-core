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
  SavedBundle,
  Location,
  resourceIdentifierToUUID,
  SavedLocation
} from '@opencrvs/commons/types'
import { FHIR_URL } from '@config/config/constants'
import { UUID } from '@opencrvs/commons'
import { ServerRoute } from '@hapi/hapi'

const fetchLocations = async () => {
  const locationHierarchyUrl = new URL(
    `Location?_count=0&status=active`,
    FHIR_URL
  )

  const response = await fetch(locationHierarchyUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${await response.text()}`)
  }

  const bundle = (await response.json()) as SavedBundle<Location>
  return bundle.entry.map(({ resource }) => resource)
}

/**
 * Creates a new Map<SavedLocation.partOf, SavedLocation[]>
 * It sets the first-level children under their parents
 */
const resolveParentChildrenMap = (locations: SavedLocation[]) => {
  const parentChildrenMap = new Map<UUID, SavedLocation[]>()

  for (const child of locations) {
    if (!child.partOf) continue

    const parentId = resourceIdentifierToUUID(child.partOf.reference)
    const parentChildrenRelationship = parentChildrenMap.get(parentId)

    if (!parentChildrenRelationship) {
      parentChildrenMap.set(parentId, [child])
    } else {
      parentChildrenRelationship.push(child)
    }
  }

  return parentChildrenMap
}

/** Resolves any given location's children multi-level down to the leaf node */
const resolveLocationChildren = (
  parentId: UUID,
  locations: SavedLocation[]
) => {
  const parentChildrenMap = resolveParentChildrenMap(locations)
  const children: SavedLocation[] = []
  const stack = parentChildrenMap.get(parentId) ?? []

  while (stack.length) {
    const child = stack.pop()!
    children.push(child)
    if (parentChildrenMap.get(child.id)) {
      stack.push(...(parentChildrenMap.get(child.id) ?? []))
    }
  }

  return children
}

export const resolveChildren: ServerRoute['handler'] = async (req) => {
  const { locationId } = req.params as { locationId: UUID }
  const locations = await fetchLocations()
  return resolveLocationChildren(locationId, locations)
}
