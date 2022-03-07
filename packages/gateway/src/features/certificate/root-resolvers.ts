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
import fetch from 'node-fetch'
import { DECLARATION_CONFIG_URL } from '@gateway/constants'
import {
  ICertificateSVGPayload,
  IGetCertificatePayload
} from '@gateway/features/certificate/type-resolvers'
import { hasScope } from '@gateway/features/user/utils'

export const resolvers: GQLResolver = {
  Query: {
    async getCertificateSVG(_, { status = null, event = null }, authHeader) {
      let payload: IGetCertificatePayload = {}
      if (status) {
        payload = { ...payload, status }
      }
      if (event) {
        payload = { ...payload, event }
      }
      const res = await fetch(`${DECLARATION_CONFIG_URL}getCertificate`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    },
    async getActiveCertificatesSVG(_, {}, authHeader) {
      const res = await fetch(
        `${DECLARATION_CONFIG_URL}getActiveCertificates`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      )
      return await res.json()
    }
  },

  Mutation: {
    async createOrUpdateCertificateSVG(_, { certificateSVG = {} }, authHeader) {
      // Only natlsysadmin should be able to create certificate
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error('Create certificate is only allowed for natlsysadmin')
        )
      }

      const certificateSVGPayload: ICertificateSVGPayload = {
        id: certificateSVG.id as string,
        svgCode: certificateSVG.svgCode as string,
        svgFilename: certificateSVG.svgFilename as string,
        svgDateUpdated: certificateSVG.svgDateUpdated as number,
        svgDateCreated: certificateSVG.svgDateCreated as number,
        user: certificateSVG.user as string,
        status: certificateSVG.status as string,
        event: certificateSVG.event as string
      }

      const action = certificateSVGPayload.id ? 'update' : 'create'
      const res = await fetch(`${DECLARATION_CONFIG_URL}${action}Certificate`, {
        method: 'POST',
        body: JSON.stringify(certificateSVGPayload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't create certificate SVG`
          )
        )
      }
      return await res.json()
    }
  }
}
