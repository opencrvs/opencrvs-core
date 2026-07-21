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
  AdministrativeArea,
  CreateAdministrativeAreaPayload,
  SetAdministrativeAreaPayload,
  UpdateAdministrativeAreaPayload,
  UUID,
  WithdrawAdministrativeAreaVersionPayload
} from '@opencrvs/commons'
import {
  internalProcedure,
  router,
  userAndSystemProcedure
} from '@events/router/trpc'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
import { diffLocationVersions } from '@events/service/locations/locations'
import {
  createAdministrativeArea,
  getAdministrativeAreas,
  setAdministrativeAreas,
  updateAdministrativeArea,
  withdrawAdministrativeAreaVersion
} from '../../service/administrative-areas'
import { allowedWithAnyOfScopes } from '../middleware'

export function setAdministrativeAreasRoute(
  procedure: typeof internalProcedure | typeof userAndSystemProcedure
) {
  return procedure
    .input(z.array(SetAdministrativeAreaPayload).min(1))
    .output(z.void())
    .mutation(async ({ input }) => setAdministrativeAreas(input))
}

export const administrativeAreaRouter = router({
  list: userAndSystemProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
          ids: z.array(UUID).optional()
        })
        .optional()
    )
    .output(z.array(AdministrativeArea))
    .query(async ({ input }) =>
      getAdministrativeAreas({
        isActive: input?.isActive,
        ids: input?.ids
      })
    ),
  create: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Create an administrative area',
        description:
          'Create a new administrative area with a single initial version.',
        method: 'POST',
        path: '/administrative-areas',
        tags: ['Administrative areas'],
        protect: true
      }
    })
    .use(allowedWithAnyOfScopes(['location.edit']))
    .input(CreateAdministrativeAreaPayload)
    .output(AdministrativeArea)
    .mutation(async ({ input, ctx }) => {
      const { administrativeArea, created } =
        await createAdministrativeArea(input)

      if (created) {
        const [initialVersion] = administrativeArea.versions

        await writeAuditLog({
          clientId: ctx.user.id,
          clientType: ctx.user.type,
          operation: 'administrativeAreas.create',
          requestData: {
            id: administrativeArea.id,
            versionId: initialVersion.versionId,
            name: initialVersion.name,
            externalId: initialVersion.externalId ?? null,
            parentId: administrativeArea.parentId,
            effectiveFrom: initialVersion.effectiveFrom,
            status: initialVersion.status
          }
        })
      }

      return administrativeArea
    }),
  update: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Update an administrative area',
        description:
          'Append a new version to an administrative area (rename, recode or inactivate). Prior versions are never modified.',
        method: 'PUT',
        path: '/administrative-areas/{id}',
        tags: ['Administrative areas'],
        protect: true
      }
    })
    .use(allowedWithAnyOfScopes(['location.edit']))
    .input(UpdateAdministrativeAreaPayload)
    .output(AdministrativeArea)
    .mutation(async ({ input, ctx }) => {
      const { administrativeArea, outcome } =
        await updateAdministrativeArea(input)

      // An idempotent replay appends nothing and must not be audited twice.
      if (outcome.appended) {
        const { previousVersion, newVersion } = outcome

        await writeAuditLog({
          clientId: ctx.user.id,
          clientType: ctx.user.type,
          operation: 'administrativeAreas.update',
          requestData: {
            id: administrativeArea.id,
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

      return administrativeArea
    }),
  withdrawVersion: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Withdraw a pending administrative area version',
        description:
          'Removes a not-yet-effective (future-dated) version from an administrative area. A version whose effectiveFrom has already passed cannot be withdrawn.',
        method: 'DELETE',
        path: '/administrative-areas/{id}/versions/{versionId}',
        tags: ['Administrative areas'],
        protect: true
      }
    })
    .use(allowedWithAnyOfScopes(['location.edit']))
    .input(WithdrawAdministrativeAreaVersionPayload)
    .output(AdministrativeArea)
    .mutation(async ({ input, ctx }) => {
      const { administrativeArea, withdrawnVersion } =
        await withdrawAdministrativeAreaVersion(input)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'administrativeAreas.withdrawVersion',
        requestData: { id: input.id, versionId: input.versionId },
        responseSummary: {
          effectiveFrom: withdrawnVersion.effectiveFrom,
          name: withdrawnVersion.name,
          externalId: withdrawnVersion.externalId ?? null,
          status: withdrawnVersion.status
        }
      })

      return administrativeArea
    })
})
