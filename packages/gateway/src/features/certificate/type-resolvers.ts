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
import { GQLResolver } from '@gateway/graphql/schema'
export interface IGetCertificatePayload {
  status?: string
  event?: string
}

export interface ICertificateSVGPayload {
  id: string
  svgCode: string
  svgFilename: string
  svgDateUpdated: number
  svgDateCreated: number
  user: string
  event: string
  status: string
}

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
    }
  }
}
