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
import { GQLRegWorkflow } from '@opencrvs/gateway/src/graphql/schema'
import { transformStatusData } from '@client/forms/register/mappings/query/utils'

export function getDeathRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (!transformedData['registration']) {
    transformedData['registration'] = {}
  }

  if (queryData['registration'].id) {
    transformedData['registration']._fhirID = queryData['registration'].id
  }
  if (queryData['registration'].trackingId) {
    transformedData['registration'].trackingId =
      queryData['registration'].trackingId
  }

  if (queryData['registration'].registrationNumber) {
    transformedData['registration'].registrationNumber =
      queryData['registration'].registrationNumber
  }

  if (
    queryData['registration'].type &&
    queryData['registration'].type === 'DEATH'
  ) {
    transformedData['registration'].type = Event.Death
  }

  if (queryData['registration'].status) {
    transformStatusData(
      transformedData,
      queryData['registration'].status as GQLRegWorkflow[],
      'registration'
    )
  }

  if (queryData[sectionId].informantsSignature) {
    transformedData[sectionId].informantsSignature =
      queryData[sectionId].informantsSignature
  }

  if (queryData[sectionId].informantsSignatureURI) {
    transformedData[sectionId].informantsSignatureURI =
      queryData[sectionId].informantsSignatureURI
  }
}
