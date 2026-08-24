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
import { UUID } from '../uuid'

/**
 * A location or administrative area pinned to one of its versions, encoded as
 * `"{locationId}:{versionId}"`.
 *
 * Declarations store a bare location id; only advanced search values carry a version.
 */
const SEPARATOR = ':'

const VERSIONED_LOCATION = /^[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$/

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

/**
 * The chain of administrative areas an advanced-search address pins, root first
 * — province, district, village, etc. — encoded as a comma-separated list of pins.
 *
 * Only administrative areas nest, so only they form a chain; a location (an
 * office or facility) is always a single pin. The last link is the leaf, and the
 * only one a search filters on; the ancestors are kept because an address value
 * stores just the leaf and rebuilds the levels above it, which would otherwise
 * lose the name each was picked under.
 */
const CHAIN_SEPARATOR = ','

function isPathOfPins(value: string) {
  return (
    value.length > 0 &&
    value.split(CHAIN_SEPARATOR).every((link) => VERSIONED_LOCATION.test(link))
  )
}

export const AdministrativeAreaPath = z
  .string()
  .refine(isPathOfPins)
  .brand('AdministrativeAreaPath')

export type AdministrativeAreaPath = z.infer<typeof AdministrativeAreaPath>

/** Encodes a chain of pins. Empty input yields undefined. */
export function toAdministrativeAreaPath(
  pins: VersionedLocation[]
): AdministrativeAreaPath | undefined {
  return pins.length
    ? (pins.join(CHAIN_SEPARATOR) as AdministrativeAreaPath)
    : undefined
}

export function isAdministrativeAreaPath(
  value: unknown
): value is AdministrativeAreaPath {
  return typeof value === 'string' && isPathOfPins(value)
}

/** The pins of a chain, root first, or an empty list when it is not a chain. */
export function parseAdministrativeAreaPath(
  value: unknown
): VersionedLocation[] {
  return isAdministrativeAreaPath(value)
    ? (value.split(CHAIN_SEPARATOR) as VersionedLocation[])
    : []
}
