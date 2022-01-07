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
import { GQLCorrectionInput, GQLResolver } from '@gateway/graphql/schema'
import { hasScope } from '@gateway/features/user/utils'
import { buildFHIRBundle } from '@gateway/features/ correction/fhir-builders'

export const resolvers: GQLResolver = {
  Mutation: {
    async correctRecord(_, { id, correctionInput }, authHeader) {
      if (hasScope(authHeader, 'register')) {
        await correctRecord(id, authHeader, correctionInput)
      }
    }
  }
}

async function correctRecord(
  id: string,
  authHeader: IAuthHeader,
  correctionInput: GQLCorrectionInput
) {
  const taskHistoryBundle = await buildFHIRBundle(correctRecord, authHeader)
  // TODO: fhir calls
}
