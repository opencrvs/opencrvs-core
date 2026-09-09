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
import {
  CreateLocationPayload,
  Location,
  SetLocationPayload,
  UpdateLocationPayload,
  UUID,
  WithdrawLocationVersionPayload
} from '@opencrvs/commons'
import {
  internalProcedure,
  router,
  userAndSystemProcedure
} from '@events/router/trpc'
import {
  createLocation,
  diffLocationVersions,
  getLocationById,
  getLocationHierarchy,
  getLocations,
  setLocations,
  updateLocation,
  withdrawLocationVersion
} from '@events/service/locations/locations'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
import { allowedWithAnyOfScopes } from '../middleware'

export function listLocationsRoute(
  procedure: typeof internalProcedure | typeof userAndSystemProcedure
) {
  return procedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
          locationIds: z.array(UUID).optional(),
          locationType: z.string().optional(),
          externalId: z.string().optional()
        })
        .optional()
    )
    .output(z.array(Location))
    .query(async ({ input }) =>
      getLocations({
        isActive: input?.isActive,
        locationIds: input?.locationIds,
        locationType: input?.locationType,
        externalId: input?.externalId
      })
    )
}

export function setLocationsRoute(
  procedure: typeof internalProcedure | typeof userAndSystemProcedure
) {
  return procedure
    .input(z.array(SetLocationPayload).min(1))
    .output(z.void())
    .mutation(async ({ input }) => {
      await setLocations(input)
    })
}

export const locationRouter = router({
  list: listLocationsRoute(
    userAndSystemProcedure.meta({
      openapi: {
        summary: 'List locations',
        description: 'Retrieve a list of locations based on provided filters.',
        method: 'GET',
        path: '/locations',
        tags: ['Locations'],
        protect: true
      }
    })
  ),
  create: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Create a location',
        description: 'Create a new location with a single initial version.',
        method: 'POST',
        path: '/locations',
        tags: ['Locations'],
        protect: true
      }
    })
    .use(allowedWithAnyOfScopes(['location.edit']))
    .input(CreateLocationPayload)
    .output(Location)
    .mutation(async ({ input, ctx }) => {
      const { location, created } = await createLocation(input)

      if (created) {
        const [initialVersion] = location.versions

        await writeAuditLog({
          clientId: ctx.user.id,
          clientType: ctx.user.type,
          operation: 'locations.create',
          requestData: {
            id: location.id,
            versionId: initialVersion.versionId,
            name: initialVersion.name,
            externalId: initialVersion.externalId ?? null,
            administrativeAreaId: location.administrativeAreaId,
            locationType: location.locationType,
            effectiveFrom: initialVersion.effectiveFrom,
            status: initialVersion.status
          }
        })
      }

      return location
    }),
  update: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Update a location',
        description:
          'Append a new version to a location (rename, recode or inactivate). This endpoint only ever appends: it never modifies or removes an existing version. To drop a version that has not taken effect yet, use the withdraw endpoint instead.',
        method: 'PUT',
        path: '/locations/{id}',
        tags: ['Locations'],
        protect: true
      }
    })
    .use(allowedWithAnyOfScopes(['location.edit']))
    .input(UpdateLocationPayload)
    .output(Location)
    .mutation(async ({ input, ctx }) => {
      const { location, outcome } = await updateLocation(input)

      // An idempotent replay appends nothing and must not be audited twice.
      if (outcome.appended) {
        const { previousVersion, newVersion } = outcome

        await writeAuditLog({
          clientId: ctx.user.id,
          clientType: ctx.user.type,
          operation: 'locations.update',
          requestData: {
            id: location.id,
            versionId: newVersion.versionId,
            name: newVersion.name,
            externalId: newVersion.externalId ?? null,
            status: newVersion.status,
            effectiveFrom: newVersion.effectiveFrom,
            lastVersionId: input.lastVersionId
          },
          responseSummary: {
            previousVersionId: previousVersion.versionId,
            versionId: newVersion.versionId,
            changed: diffLocationVersions(previousVersion, newVersion)
          }
        })
      }

      return location
    }),
  withdrawVersion: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Withdraw a pending location version',
        description:
          'Removes a not-yet-effective (future-dated) version from a location. A version whose effectiveFrom has already passed cannot be withdrawn.',
        method: 'DELETE',
        path: '/locations/{id}/versions/{versionId}',
        tags: ['Locations'],
        protect: true
      }
    })
    .use(allowedWithAnyOfScopes(['location.edit']))
    .input(WithdrawLocationVersionPayload)
    .output(Location)
    .mutation(async ({ input, ctx }) => {
      const { location, withdrawnVersion } =
        await withdrawLocationVersion(input)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'locations.withdrawVersion',
        requestData: { id: input.id, versionId: input.versionId },
        responseSummary: {
          effectiveFrom: withdrawnVersion.effectiveFrom,
          name: withdrawnVersion.name,
          externalId: withdrawnVersion.externalId ?? null,
          status: withdrawnVersion.status
        }
      })

      return location
    }),
  get: userAndSystemProcedure
    .input(z.object({ id: UUID }))
    .output(Location)
    .query(async ({ input }) => getLocationById(input.id)),
  getLocationHierarchy: userAndSystemProcedure
    .input(z.object({ locationId: UUID }))
    .output(z.array(UUID))
    .query(async ({ input }) => {
      return getLocationHierarchy(input.locationId)
    })
})
