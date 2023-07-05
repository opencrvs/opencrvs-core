/* eslint-disable prettier/prettier */
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

import { COUNTRY_CONFIG_URL } from '@gateway/constants'

import { resolvers } from '@gateway/features/certificate/root-resolvers'
import { GQLCertificateStatus } from '@gateway/graphql/schema'

import fetch from 'node-fetch'

async function getCertificate() {
  const url = new URL('certificates', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the certificates from ${url}`)
  }
  return res.json()
}

async function updateCertificate(token: string, certificate: any) {
  const authHeaderNatlSYSAdmin = {
    Authorization: `Bearer ${token}`
  }
  const certificateSVG = {
    svgCode: certificate.svgCode as string,
    svgFilename: certificate.svgFileName,
    user: 'jonathan.campbell',
    event: certificate.event,
    status: GQLCertificateStatus.ACTIVE
  }

  if (resolvers.Mutation?.createOrUpdateCertificateSVG) {
    const response = await resolvers.Mutation?.createOrUpdateCertificateSVG(
      {},
      { certificateSVG } as any,
      { headers: authHeaderNatlSYSAdmin } as any,
      { info: 'seeding birth certificate' } as any
    )
    console.log(response)
    const url = 'http://localhost:3535' + response.svgCode
    console.log(url)
  }
}
export async function seedCertificate(token: string) {
  const certificates = await getCertificate()
  certificates.map((certificate: any) => updateCertificate(token, certificate))
}
