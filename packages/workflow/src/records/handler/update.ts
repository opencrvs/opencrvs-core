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
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import {
  BirthRegistration as GQLBirthRegistration,
  DeathRegistration as GQLDeathRegistration,
  MarriageRegistration as GQLMarriageRegistration,
  EVENT_TYPE,
  updateFHIRBundle,
  Registration,
  InProgressRecord,
  ReadyForReviewRecord,
  getComposition,
  getInformantType
} from '@opencrvs/commons/types'
import { z } from 'zod'
import { indexBundle } from '@workflow/records/search'
import { toUpdated } from '@workflow/records/state-transitions'
import { validateRequest } from '@workflow/utils/index'
import { ChangedValuesInput } from '@workflow/records/validations'
import { uploadBase64AttachmentsToDocumentsStore } from '@workflow/documents'
import { getAuthHeader } from '@opencrvs/commons/http'
import { SCOPES } from '@opencrvs/commons/authentication'

type BirthRegistration = Omit<GQLBirthRegistration, 'registration'> & {
  registration: Registration
}
type DeathRegistration = Omit<GQLDeathRegistration, 'registration'> & {
  registration: Registration
}
type MarriageRegistration = Omit<GQLMarriageRegistration, 'registration'> & {
  registration: Registration
}

const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  details: z.custom<
    BirthRegistration | DeathRegistration | MarriageRegistration
  >()
})

function filterInformantSectionFromComposition<
  T extends InProgressRecord | ReadyForReviewRecord
>(record: T): T {
  const composition = getComposition(record)

  const filteredComposition = composition.section.filter(
    (sec) => sec.code.coding[0].code !== 'informant-details'
  )

  return {
    ...record,
    entry: [
      {
        fullUrl: record.entry.find(
          (e) => e.resource.resourceType === 'Composition'
        )!.fullUrl,
        resource: {
          ...composition,
          section: filteredComposition
        }
      },
      ...record.entry.filter((e) => e.resource.resourceType !== 'Composition')
    ]
  }
}

export const updateRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/update',
  allowedStartStates: ['IN_PROGRESS', 'READY_FOR_REVIEW'],
  action: 'UPDATE_DECLARATION',
  allowedScopes: [SCOPES.RECORD_DECLARATION_EDIT],
  includeHistoryResources: true,
  handler: async (request, record) => {
    const token = getToken(request)
    const payload = validateRequest(requestSchema, request.payload)

    const informantTypeOfBundle = getInformantType(record)
    const payloadInformantType = payload.details.registration.informantType

    // When new informant details are provided, we should create a patient entry
    // by removing the composition section from the bundle.
    // If the section is not found, the builders from updateFhirBundle
    // create a new patient resource from scratch.
    if (informantTypeOfBundle && informantTypeOfBundle !== payloadInformantType)
      record = filterInformantSectionFromComposition(record)

    const { details, event } = payload
    const {
      registration: registrationWithChangedValues,
      ...detailsWithoutReg
    } = details
    const { changedValues, ...registration } = registrationWithChangedValues
    const payloadRecordDetails = {
      ...detailsWithoutReg,
      registration
    }
    const updatedDetails = validateRequest(ChangedValuesInput, changedValues)
    const recordInputWithUploadedAttachments =
      await uploadBase64AttachmentsToDocumentsStore(
        payloadRecordDetails,
        getAuthHeader(request)
      )

    const updatedBundle = updateFHIRBundle(
      record,
      recordInputWithUploadedAttachments,
      event
    )
    const updatedRecord = await toUpdated(updatedBundle, token, updatedDetails)

    await indexBundle(updatedRecord, token)
    return updatedRecord
  }
})
