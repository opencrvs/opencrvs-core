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
import { AdministrativeArea, Location, UUID } from '@opencrvs/commons/client'

/** A location that was active, then inactivated via the Location QA tool. */
export function buildInactiveLocation({
  id,
  name,
  locationType,
  administrativeAreaId,
  inactiveFrom = '2020-01-01'
}: {
  id: UUID
  name: string
  locationType: string
  administrativeAreaId: UUID
  inactiveFrom?: string
}): Location {
  return {
    id,
    name,
    locationType,
    administrativeAreaId,
    externalId: null,
    status: 'inactive',
    versions: [
      {
        versionId: id,
        effectiveFrom: '0001-01-01',
        name,
        externalId: null,
        status: 'active'
      },
      {
        versionId: id,
        effectiveFrom: inactiveFrom,
        name,
        externalId: null,
        status: 'inactive'
      }
    ]
  }
}

/**
 * A location whose only version starts in the future: it exists in the
 * system but has not become effective yet. The server flattens `status` to
 * 'inactive' for such a row, while the version itself stays 'active' — that
 * mismatch is what surfaces future-dated entities on present-tense surfaces.
 */
export function buildFutureLocation({
  id,
  name,
  locationType,
  administrativeAreaId,
  effectiveFrom = '2099-01-01'
}: {
  id: UUID
  name: string
  locationType: string
  administrativeAreaId: UUID
  effectiveFrom?: string
}): Location {
  return {
    id,
    name,
    locationType,
    administrativeAreaId,
    externalId: null,
    status: 'inactive',
    versions: [
      {
        versionId: id,
        effectiveFrom,
        name,
        externalId: null,
        status: 'active'
      }
    ]
  }
}

/** Administrative-area counterpart of {@link buildFutureLocation}. */
export function buildFutureAdministrativeArea({
  id,
  name,
  parentId,
  effectiveFrom = '2099-01-01'
}: {
  id: UUID
  name: string
  parentId: UUID | null
  effectiveFrom?: string
}): AdministrativeArea {
  return {
    id,
    name,
    parentId,
    externalId: null,
    status: 'inactive',
    versions: [
      {
        versionId: id,
        effectiveFrom,
        name,
        externalId: null,
        status: 'active'
      }
    ]
  }
}
