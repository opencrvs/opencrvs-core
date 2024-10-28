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
import { IFormData } from '@client/forms'
import { Event } from '@client/utils/gateway'
import type { GQLRegWorkflow } from '@client/utils/gateway-deprecated-do-not-use'
import { transformStatusData } from '@client/forms/register/mappings/query/utils'

export function getDeathRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (!transformedData[sectionId]) {
    transformedData[sectionId] = {}
  }

  if (queryData[sectionId].id) {
    transformedData[sectionId]._fhirID = queryData[sectionId].id
  }
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'DEATH') {
    transformedData[sectionId].type = Event.Death
  }

  if (queryData[sectionId].status) {
    transformStatusData(
      transformedData,
      queryData[sectionId].status as GQLRegWorkflow[],
      sectionId
    )
  }

  if (
    Array.isArray(queryData[sectionId].certificates) &&
    queryData[sectionId].certificates.length > 0
  ) {
    transformedData[sectionId].certificates = [
      queryData[sectionId].certificates[
        queryData[sectionId].certificates.length - 1
      ]
    ]
  }
}
