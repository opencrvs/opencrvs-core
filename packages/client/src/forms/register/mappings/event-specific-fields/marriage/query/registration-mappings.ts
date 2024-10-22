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
import { transformStatusData } from '@client/forms/register/mappings/query/utils'
import { IOfflineData } from '@client/offline/reducer'
import { Event } from '@client/utils/gateway'
import type { GQLRegWorkflow } from '@client/utils/gateway-deprecated-do-not-use'

export function getMarriageRegistrationSectionTransformer(
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
  if (queryData[sectionId].status) {
    transformStatusData(
      transformedData,
      queryData[sectionId].status as GQLRegWorkflow[],
      sectionId
    )
  }
}

export function groomSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].groomSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'groomSignature'
    ] = queryData[sectionId].groomSignature
  }
}

export function brideSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].brideSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'brideSignature'
    ] = queryData[sectionId].brideSignature
  }
}

export function witnessOneSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].witnessOneSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'witnessOneSignature'
    ] = queryData[sectionId].witnessOneSignature
  }
}

export function witnessTwoSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].witnessTwoSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'witnessTwoSignature'
    ] = queryData[sectionId].witnessTwoSignature
  }
}
