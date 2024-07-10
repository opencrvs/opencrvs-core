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
import { GQLResolver } from '@gateway/graphql/schema'
import { getPresignedUrlFromUri } from '@gateway/features/registration/utils'

export interface ICertificateSVG {
  _id: string
  svgCode: string
  svgFilename: string
  svgDateUpdated: string
  svgDateCreated: string
  user: string
  event: string
  status: string
}

export const certificateTypeResolvers: GQLResolver = {
  CertificateSVG: {
    id(certificate: ICertificateSVG) {
      return certificate._id
    },
    svgCode: (
      certificate: ICertificateSVG,
      _,
      { headers: authHeader, presignDocumentUrls }
    ) => {
      if (!presignDocumentUrls) {
        return certificate.svgCode
      }
      return getPresignedUrlFromUri(certificate.svgCode, authHeader)
    }
  }
}
