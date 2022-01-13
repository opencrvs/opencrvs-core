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
import transformObj from '@gateway/features/transformation'
import { builders } from '@gateway/features/registration/fhir-builders'
import { createCompositionTemplate } from '@gateway/features/fhir/templates'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'

export async function buildFHIRBundle(
  reg: object,
  eventType: EVENT_TYPE,
  authHeader?: IAuthHeader
) {
  const ref = uuid()
  const context: any = {
    event: eventType
  }
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [createCompositionTemplate(ref, context)] // TODO: create task history
  }

  if (authHeader) {
    context.authHeader = authHeader
  }
  await transformObj(reg, fhirBundle, builders, context)
  return fhirBundle
}
