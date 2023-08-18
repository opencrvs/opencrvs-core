/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { getFHIRBundleWithRecordID } from '@workflow/records'
import { getTaskResource } from '../registration/fhir/fhir-template'
import {
  setupLastRegLocation,
  setupLastRegUser
} from '../registration/fhir/fhir-bundle-modifier'
import { z } from 'zod'
import { Request } from '@hapi/hapi'
import { getLoggedInPractitionerResource } from '../user/utils'
import { getToken } from '@workflow/utils/authUtils'
import { Bundle, sendBundleToHearth } from '@workflow/records/fhir'

import { indexBundle } from '@workflow/records/search'
import { createNewAuditEvent } from '@workflow/records/audit'
import { badRequest, conflict } from '@hapi/boom'

const CorrectionRequestInput = z.object({
  requestingIndividual: z.string(),
  reason: z.string(),
  comment: z.string(),
  hasShowedVerifiedDocument: z.boolean(),
  updates: z.array(
    z.object({
      sectionId: z.string(),
      fieldId: z.string(),
      value: z.string()
    })
  )
})

type CorrectionRequestInput = z.infer<typeof CorrectionRequestInput>

function validateRequest<T extends z.ZodType>(
  validator: T,
  payload: unknown
): z.infer<T> {
  try {
    return validator.parse(payload)
  } catch (error) {
    throw badRequest(error.message)
  }
}

export const routes = [
  {
    method: 'POST',
    path: '/records/{recordId}/request-correction',
    handler: async (request: Request) => {
      const correctionDetails = validateRequest(
        CorrectionRequestInput,
        request.payload
      )

      const bundle = await getFHIRBundleWithRecordID(request.params.recordId)

      if (hasActiveCorrectionRequest(bundle)) {
        throw conflict(
          'There is already a pending correction request for this record'
        )
      }

      const previousTask = getTaskResource(bundle)
      const correctionRequestTask = createCorrectionRequestTask(
        previousTask,
        correctionDetails
      )

      const practitioner = await getLoggedInPractitionerResource(
        getToken(request)
      )

      const correctionRequestTaskWithPractitionerExtensions = setupLastRegUser(
        correctionRequestTask,
        practitioner
      )

      const correctionRequestWithLocationExtensions =
        await setupLastRegLocation(
          correctionRequestTaskWithPractitionerExtensions,
          practitioner
        )

      const bundleWithCorrectionRequestTask = {
        ...bundle,
        entry: bundle.entry
          .filter((entry) => entry.resource.id !== previousTask.id)
          .concat({ resource: correctionRequestWithLocationExtensions })
      }

      await sendBundleToHearth(bundleWithCorrectionRequestTask)
      await createNewAuditEvent(
        bundleWithCorrectionRequestTask,
        getToken(request)
      )
      await indexBundle(bundleWithCorrectionRequestTask, getToken(request))

      return {}
    }
  },
  {
    method: 'POST',
    path: '/records/:recordId/make-correction',
    handler: (request: Request) => {
      return 'success'
    }
  },
  {
    method: 'POST',
    path: '/records/:recordId/approve-correction',
    handler: (request: Request) => {
      return 'success'
    }
  },
  {
    method: 'POST',
    path: '/records/:recordId/reject-correction',
    handler: (request: Request) => {
      return 'success'
    }
  }
]

function hasActiveCorrectionRequest(bundle: Bundle) {
  return bundle.entry.some((entry) => {
    if (entry.resource.resourceType !== 'Task') {
      return false
    }
    const task = entry.resource as fhir.Task
    return (
      task.status === 'requested' &&
      task.businessStatus?.coding?.some(
        (coding) => coding.code === 'CORRECTION_REQUESTED'
      )
    )
  })
}

function createCorrectionRequestTask(
  previousTask: fhir.Task,
  correctionDetails: CorrectionRequestInput
) {
  return {
    resourceType: 'Task',
    status: 'requested',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    identifier: previousTask.identifier,
    extension: previousTask.extension
      ?.filter(
        ({ url }) =>
          url !== 'http://opencrvs.org/specs/extension/requestingIndividual' &&
          url !==
            'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument'
      )
      .concat([
        {
          url: 'http://opencrvs.org/specs/extension/requestingIndividual',
          valueString: correctionDetails.requestingIndividual
        },
        {
          url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
          valueBoolean: correctionDetails.hasShowedVerifiedDocument
        }
      ]),
    input: correctionDetails.updates.map((update) => ({
      valueCode: update.sectionId,
      valueId: update.fieldId,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/action-type',
            code: 'update'
          }
        ]
      },
      valueString: update.value
    })),
    reason: {
      text: correctionDetails.reason,
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/otherReason',
          valueString: ''
        }
      ]
    },
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'CORRECTION_REQUESTED'
        }
      ]
    }
  }
}
