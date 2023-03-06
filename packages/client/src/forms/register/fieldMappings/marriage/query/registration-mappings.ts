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
import { IFormData } from '@client/forms'
import { transformStatusData } from '@client/forms/mappings/query'
import { Event } from '@client/utils/gateway'
import { GQLRegWorkflow } from '@opencrvs/gateway/src/graphql/schema'

export function getMarriageRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].id) {
    transformedData[sectionId]._fhirID = queryData[sectionId].id
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'MARRIAGE') {
    transformedData[sectionId].type = Event.Marriage
  }

  if (queryData[sectionId].groomSignature) {
    transformedData[sectionId].groomSignature =
      queryData[sectionId].groomSignature
  }
  if (queryData[sectionId].brideSignature) {
    transformedData[sectionId].brideSignature =
      queryData[sectionId].brideSignature
  }
  if (queryData[sectionId].witnessOneSignature) {
    transformedData[sectionId].witnessOneSignature =
      queryData[sectionId].witnessOneSignature
  }
  if (queryData[sectionId].witnessTwoSignature) {
    transformedData[sectionId].witnessTwoSignature =
      queryData[sectionId].witnessTwoSignature
  }

  if (queryData[sectionId].status) {
    transformStatusData(
      transformedData,
      queryData[sectionId].status as GQLRegWorkflow[],
      sectionId
    )
  }
}
