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
import { transformStatusData } from '@client/forms/register/mappings/query/utils'

export function getBirthRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'BIRTH') {
    transformedData[sectionId].type = Event.Birth
  }

  if (queryData[sectionId].status) {
    transformStatusData(transformedData, queryData[sectionId].status, sectionId)
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

export function mosipAidTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].mosipAid) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'mosipAid'
    ] = queryData[sectionId].mosipAid
  }
}

export function mosipAidLabelTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].mosipAid) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'mosipAIDLabel'
    ] = 'MOSIP Application ID'
  }
}
