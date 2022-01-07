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
import { v4 as uuid } from 'uuid'
import transformObj from '../transformation'

const builders = {} // TODO: add fhir builders

export async function buildFHIRBundle(
  correctionInput: object,
  authHeader?: IAuthHeader
) {
  const ref = uuid()
  const context: any = {}
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [] // TODO: create task history
  }

  if (authHeader) {
    context.authHeader = authHeader
  }
  await transformObj(correctionInput, fhirBundle, builders, context)
  return fhirBundle
}
