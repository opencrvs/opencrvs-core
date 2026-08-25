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
import * as z from 'zod/v4'
import { LocationVersion, UUID } from '@opencrvs/commons/client'

const SEPARATOR = ':'

const VERSIONED_LOCATION = /^[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$/

/**
 * A location or administrative area pinned to one of its versions, encoded as
 * `"{locationId}:{versionId}"`.
 *
 * This exists only in advanced search, and only in the client.
 */
export const VersionedLocation = z
  .string()
  .refine((value) => VERSIONED_LOCATION.test(value))
  .brand('VersionedLocation')

export type VersionedLocation = z.infer<typeof VersionedLocation>

/** Encodes a pin. The only way to mint a {@link VersionedLocation}. */
export function toVersionedLocation(
  locationId: UUID,
  versionId: UUID
): VersionedLocation {
  return `${locationId}${SEPARATOR}${versionId}` as VersionedLocation
}

/**
 * Whether a field value is a pin rather than the bare id a declaration holds.
 *
 * A plain regex test, not a schema parse: this runs on every render of every
 * location field, and on every keystroke in an address form.
 */
export function isVersionedLocation(
  value: unknown
): value is VersionedLocation {
  return typeof value === 'string' && VERSIONED_LOCATION.test(value)
}

/** The two ids a pin carries, or undefined when the value is not a pin. */
export function parseVersionedLocation(
  value: unknown
): { locationId: UUID; versionId: UUID } | undefined {
  if (!isVersionedLocation(value)) {
    return undefined
  }

  const [locationId, versionId] = value.split(SEPARATOR)

  return { locationId: locationId as UUID, versionId: versionId as UUID }
}

/** A location or administrative area, both of which carry a version history. */
export interface VersionedEntity {
  id: UUID
  versions: LocationVersion[]
}

/**
 * The distinct names a location or administrative area has carried, in the order
 * they first appeared, each pinned to the version that first carried it.
 *
 * One entry per name, not per version.
 */
export function toNamedVersions(
  entity: VersionedEntity
): { name: string; selection: VersionedLocation }[] {
  const seen = new Set<string>()

  return entity.versions.flatMap((version) => {
    if (seen.has(version.name)) {
      return []
    }
    seen.add(version.name)

    return [
      {
        name: version.name,
        selection: toVersionedLocation(entity.id, version.versionId)
      }
    ]
  })
}

/**
 * The version a {@link VersionedLocation} pinned. Undefined when the value is
 * not a pin, or when the location or version it names is unknown.
 */
export function findSelectedVersion<T extends VersionedEntity>(
  pin: unknown,
  entities: Map<UUID, T>
): { entity: T; version: LocationVersion } | undefined {
  const parsed = parseVersionedLocation(pin)

  if (!parsed) {
    return undefined
  }

  const entity = entities.get(parsed.locationId)
  const version = entity?.versions.find(
    (candidate) => candidate.versionId === parsed.versionId
  )

  return entity && version ? { entity, version } : undefined
}
