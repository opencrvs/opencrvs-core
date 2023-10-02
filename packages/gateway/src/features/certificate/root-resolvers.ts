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
import fetch from 'node-fetch'
import { APPLICATION_CONFIG_URL } from '@gateway/constants'
import { hasScope } from '@gateway/features/user/utils'
import { uploadSvg } from '@gateway/utils/documents'

export const resolvers: GQLResolver = {
  Query: {
    async getCertificateSVG(_, filters, { headers: authHeader }) {
      const res = await fetch(`${APPLICATION_CONFIG_URL}getCertificate`, {
        method: 'POST',
        body: JSON.stringify(filters),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      if (!res.ok) {
        return null
      }
      return await res.json()
    },
    async getActiveCertificatesSVG(_, {}, { headers: authHeader }) {
      const res = await fetch(
        `${APPLICATION_CONFIG_URL}getActiveCertificates`,
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
    async createOrUpdateCertificateSVG(
      _,
      { certificateSVG },
      { headers: authHeader }
    ) {
      // Only natlsysadmin should be able to create certificate
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error(
            'Create or update certificate is only allowed for natlsysadmin'
          )
        )
      }

      certificateSVG.svgCode = await uploadSvg(
        certificateSVG.svgCode,
        authHeader
      )

      const action = certificateSVG.id ? 'update' : 'create'
      const res = await fetch(`${APPLICATION_CONFIG_URL}${action}Certificate`, {
        method: 'POST',
        body: JSON.stringify(certificateSVG),
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
