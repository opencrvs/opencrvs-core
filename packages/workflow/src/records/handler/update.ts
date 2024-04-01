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
  Registration
} from '@opencrvs/commons/types'
import { z } from 'zod'
import { indexBundle } from '@workflow/records/search'
import { toUpdated } from '@workflow/records/state-transitions'
import { validateRequest } from '@workflow/features/correction/routes'
import { ChangedValuesInput } from '@workflow/records/validations'
import { uploadBase64AttachmentsToDocumentsStore } from '@workflow/documents'
import { getAuthHeader } from '@opencrvs/commons/http'

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

export const updateRoute = [
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/update',
    allowedStartStates: ['IN_PROGRESS', 'READY_FOR_REVIEW'],
    action: 'UPDATE_DECLARATION',
    handler: async (request, record) => {
      const token = getToken(request)
      const payload = validateRequest(requestSchema, request.payload)

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
      const updatedRecord = await toUpdated(
        updatedBundle,
        token,
        updatedDetails
      )

      await indexBundle(updatedRecord, token)
      return updatedRecord
    }
  })
]
