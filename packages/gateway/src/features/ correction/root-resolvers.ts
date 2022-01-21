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
import { IAuthHeader } from '@gateway/common-types'
import { GQLResolver } from '@gateway/graphql/schema'
import { hasScope } from '@gateway/features/user/utils'
import { buildFHIRBundle } from '@gateway/features/ correction/fhir-builders'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'
import { fetchFHIR, getIDFromResponse } from '@gateway/features/fhir/utils'

export const resolvers: GQLResolver = {
  Mutation: {
    async requestBirthRegistrationCorrection(_, { id, details }, authHeader) {
      if (hasScope(authHeader, 'register')) {
        return await requestEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.BIRTH
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    },
    async requestDeathRegistrationCorrection(_, { id, details }, authHeader) {
      if (hasScope(authHeader, 'register')) {
        return await requestEventRegistrationCorrection(
          id,
          authHeader,
          details,
          EVENT_TYPE.DEATH
        )
      } else {
        throw new Error('User does not have a register scope')
      }
    }
  }
}

async function requestEventRegistrationCorrection(
  id: string,
  authHeader: IAuthHeader,
  reg: object,
  eventType: EVENT_TYPE
) {
  const fhirBundle = await buildFHIRBundle(reg, eventType, authHeader)
  const res = await fetchFHIR(
    '',
    authHeader,
    'POST',
    JSON.stringify(fhirBundle)
  )

  // return composition-id
  return getIDFromResponse(res)
}
