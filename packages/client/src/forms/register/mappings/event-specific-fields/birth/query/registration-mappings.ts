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
import { IFormData, IFormField } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { transformStatusData } from '@client/forms/register/mappings/query/utils'
import { IOfflineData } from '@client/offline/reducer'

export function getBirthRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  fieldDef: IFormField,
  nestedFormField?: IFormField,
  offlineData?: IOfflineData
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

  if (
    Array.isArray(queryData[sectionId].certificates) &&
    queryData[sectionId].certificates.length > 0
  ) {
    const certificate = queryData[sectionId].certificates.slice(-1)[0]
    // since we shall need this certificate only for ready to issue tab, to calculate certificate fee
    transformedData[sectionId].certificates = certificate?.certTemplateId
      ? [
          {
            templateConfig: offlineData?.templates.certificates?.find(
              (x) => x.id === certificate.certTemplateId
            )
          }
        ]
      : []
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
