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

import {
  RecordNotFoundError,
  getFHIRBundleWithRecordID
} from '@workflow/records'
import { getTaskResource } from '../registration/fhir/fhir-template'
import {
  setupLastRegLocation,
  setupLastRegUser
} from '../registration/fhir/fhir-bundle-modifier'
import { z } from 'zod'
import { Request } from '@hapi/hapi'
import { getLoggedInPractitionerResource } from '../user/utils'
import { getToken } from '@workflow/utils/authUtils'
import { Bundle, Extension, Task } from '@opencrvs/commons'

import { indexBundle } from '@workflow/records/search'
import { createNewAuditEvent } from '@workflow/records/audit'
import { badRequest, conflict, notFound } from '@hapi/boom'
import {
  getTaskHistory,
  isTask,
  sendBundleToHearth,
  sortTasksDescending
} from '@workflow/records/fhir'
import {
  ASSIGNED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL
} from '../task/fhir/constants'

const CorrectionRequestInput = z.object({
  requester: z.string(),
  hasShowedVerifiedDocument: z.boolean(),
  noSupportingDocumentationRequired: z.boolean().optional(),
  payments: z
    .array(
      z.object({
        paymentId: z.string().optional(),
        type: z.string().optional(),
        total: z.number().optional(),
        amount: z.number().optional(),
        outcome: z.string().optional(),
        date: z.string().optional(),
        data: z.string().optional()
      })
    )
    .default([]),
  location: z.object({
    _fhirID: z.string()
  }),
  values: z
    .array(
      z.object({
        section: z.string().optional(),
        fieldName: z.string().optional(),
        oldValue: z.string().optional(),
        newValue: z.string().optional()
      })
    )
    .default([]),
  reason: z.string(),
  note: z.string(),
  otherReason: z.string()
})
const CorrectionRejectionInput = z.object({
  reason: z.string()
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

function extensionsWithoutAssignment(extensions: Extension[]) {
  return extensions.filter(
    (extension) => extension.url !== ASSIGNED_EXTENSION_URL
  )
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

      // Only send new task to Hearth so it doesn't change anything else
      await sendBundleToHearth({
        ...bundle,
        entry: [{ resource: correctionRequestWithLocationExtensions }]
      })

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
    path: '/records/{recordId}/reject-correction',
    handler: async (request: Request) => {
      const rejectionDetails = validateRequest(
        CorrectionRejectionInput,
        request.payload
      )

      let bundle: Bundle

      try {
        bundle = await getFHIRBundleWithRecordID(request.params.recordId)
      } catch (error) {
        if (error instanceof RecordNotFoundError) {
          throw notFound(error.message)
        }
        throw error
      }

      if (!hasActiveCorrectionRequest(bundle)) {
        throw conflict(
          'There is no a pending correction request for this record'
        )
      }

      const currentCorrectionRequestedTask = getTaskResource(bundle)

      const correctionRejectionTask: Task = {
        ...currentCorrectionRequestedTask,
        status: 'rejected',
        reason: {
          text: rejectionDetails.reason
        },
        extension: extensionsWithoutAssignment(
          currentCorrectionRequestedTask.extension
        )
      }

      const practitioner = await getLoggedInPractitionerResource(
        getToken(request)
      )

      const correctionRejectionTaskWithPractitionerExtensions =
        setupLastRegUser(correctionRejectionTask, practitioner)

      const correctionRejectionWithLocationExtensions =
        await setupLastRegLocation(
          correctionRejectionTaskWithPractitionerExtensions,
          practitioner
        )

      // Store rejected task in Hearth
      await sendBundleToHearth({
        ...bundle,
        entry: [{ resource: correctionRejectionWithLocationExtensions }]
      })

      const taskHistory = await getTaskHistory(
        currentCorrectionRequestedTask.id
      )

      const previousTaskBeforeCorrection = sortTasksDescending(
        taskHistory.entry.map((x) => x.resource)
      )

      const firstNonCorrectionTask = previousTaskBeforeCorrection.find((task) =>
        task.businessStatus?.coding?.some(
          (coding) => coding.code !== 'CORRECTION_REQUESTED'
        )
      )

      if (!firstNonCorrectionTask) {
        throw new Error(
          'Record did not have any tasks before correction. This should never happen'
        )
      }

      const reinstateTask = {
        ...firstNonCorrectionTask,
        extension: [
          ...extensionsWithoutAssignment(firstNonCorrectionTask.extension),
          { url: REINSTATED_EXTENSION_URL }
        ]
      }

      const reinstateTaskWithPractitionerExtensions = setupLastRegUser(
        reinstateTask,
        practitioner
      )

      const reinstateTaskWithLocationExtensions = await setupLastRegLocation(
        reinstateTaskWithPractitionerExtensions,
        practitioner
      )

      try {
        // Reinstate previous task
        await sendBundleToHearth({
          ...bundle,
          entry: [
            {
              resource: reinstateTaskWithLocationExtensions
            }
          ]
        })

        // Re-enstate previous task

        const bundleWithTask = {
          ...bundle,
          entry: bundle.entry
            .filter((entry) => !isTask(entry.resource))
            .concat({ resource: firstNonCorrectionTask })
        }

        await createNewAuditEvent(bundleWithTask, getToken(request))
        await indexBundle(bundleWithTask, getToken(request))

        return {}
      } catch (error) {
        throw error
      }
    }
  }
]

function hasActiveCorrectionRequest(bundle: Bundle) {
  return bundle.entry.some((entry) => {
    if (entry.resource.resourceType !== 'Task') {
      return false
    }
    const task = entry.resource as Task

    return (
      task.status === 'requested' &&
      task.businessStatus?.coding?.some(
        (coding) => coding.code === 'CORRECTION_REQUESTED'
      )
    )
  })
}

function createCorrectionRequestTask(
  previousTask: Task,
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
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person',
        valueString: correctionDetails.requester
      },
      {
        url: 'http://opencrvs.org/specs/extension/requestingIndividual',
        valueString: correctionDetails.requester
      },
      {
        url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
        valueBoolean: correctionDetails.hasShowedVerifiedDocument
      }
    ],
    input: correctionDetails.values.map((update) => ({
      valueCode: update.section,
      valueId: update.fieldName,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/action-type',
            code: 'update'
          }
        ]
      },
      valueString: update.newValue
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
