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
 * To pin a location or administrative area picked in advanced search to the name
 * that was clicked, `locationId` is not enough on its own, we need to store the
 * `versionId` as well.
 */
export const LocationSelection = z.object({
  locationId: UUID,
  versionId: UUID
})

export type LocationSelection = z.infer<typeof LocationSelection>

/**
 * The chain of administrative areas an advanced-search address pins, root first.
 * Only administrative areas nest, so only they form a chain; a location (an office
 * or facility) is always a single pin.
 *
 * The last link is the leaf, and the only one a search filters on. The ancestors
 * are kept because an address value stores just the leaf and rebuilds the levels
 * above it, which would otherwise lose the name each was picked under.
 */
export const AdministrativeAreaSelectionChain = z
  .array(LocationSelection)
  .nonempty()

export type AdministrativeAreaSelectionChain = z.infer<
  typeof AdministrativeAreaSelectionChain
>

/**
 * Whether a value is a pinned selection or the bare id a declaration
 * holds: a location id or an administrative area id.
 */
export function isLocationSelection(
  value: unknown
): value is LocationSelection {
  return LocationSelection.safeParse(value).success
}
