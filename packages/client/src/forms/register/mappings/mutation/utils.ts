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

import type { GQLRelatedPersonInput } from '@client/utils/gateway-deprecated-do-not-use'
import { ICertificate, IFileValue } from '@client/forms'
import { omit } from 'lodash'

export function stripTypename(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripTypename)
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      if (key !== '__typename' && Object.hasOwn(obj, key)) {
        newObj[key] = stripTypename(obj[key])
      }
    }
    return newObj
  }
  return obj
}
export function transformCertificateData(certificates: ICertificate[]) {
  const certificateData = certificates[0]

  // Prepare the base certificate data
  const updatedCertificates: ICertificate[] = [
    {
      ...omit(certificateData, 'collector')
    }
  ]

  // for collector mapping
  if (certificateData && certificateData.collector) {
    let collector: GQLRelatedPersonInput = {}
    if (certificateData.collector.type) {
      collector.relationship = certificateData.collector.type as string
    }
    if (certificateData.collector.relationship) {
      collector.otherRelationship = certificateData.collector
        .relationship as string
      collector = {
        ...collector,
        name: [
          {
            use: 'en',
            firstNames: certificateData.collector.firstName as string,
            familyName: certificateData.collector.lastName as string
          }
        ],
        identifier: [
          {
            id: certificateData.collector.iD as string,
            type: certificateData.collector.iDType as string
          }
        ]
      }
    }
    if (certificateData.collector.affidavitFile) {
      collector.affidavit = [
        {
          contentType: (certificateData.collector.affidavitFile as IFileValue)
            .type,
          data: (certificateData.collector.affidavitFile as IFileValue).data
        }
      ]
    }
    updatedCertificates[0].collector = collector as any
  }

  // Return the processed certificates array
  return updatedCertificates
}
