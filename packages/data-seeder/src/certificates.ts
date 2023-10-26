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

import { COUNTRY_CONFIG_HOST, GATEWAY_HOST } from './constants'
import fetch from 'node-fetch'
import { parseGQLResponse, raise } from './utils'
import { TypeOf, z } from 'zod'
import { print } from 'graphql'
import gql from 'graphql-tag'
import { inspect } from 'util'

type CertificateMeta = TypeOf<typeof CertificateSchema>[number]

const CertificateSchema = z.array(
  z.object({
    event: z.enum(['birth', 'death', 'marriage']),
    fileName: z.string(),
    svgCode: z.string()
  })
)

async function getCertificate() {
  const url = new URL('certificates', COUNTRY_CONFIG_HOST).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the certificates from ${url}`)
  }
  const parsedCertificates = CertificateSchema.safeParse(await res.json())
  if (!parsedCertificates.success) {
    raise(
      `Getting certificates from country-config errored with: ${inspect(
        parsedCertificates.error.issues
      )}`
    )
  }
  return parsedCertificates.data
}

const createCertificateQuery = print(gql`
  mutation createCertificate($certificate: CertificateSVGInput!) {
    createOrUpdateCertificateSVG(certificateSVG: $certificate) {
      id
    }
  }
`)

type CertificateInput = {
  svgCode: string
  svgFilename: string
  user: string
  event: CertificateMeta['event']
  status: 'ACTIVE' | 'INACTIVE'
}

const getCertificateQuery = print(gql`
  query getCertificate($status: CertificateStatus!, $event: Event!) {
    getCertificateSVG(status: $status, event: $event) {
      id
    }
  }
`)

async function certificatesAlreadyExist(
  status: 'ACTIVE' | 'INACTIVE',
  event: CertificateMeta['event'],
  token: string
) {
  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: getCertificateQuery,
      variables: { status, event }
    })
  })
  const certificate = parseGQLResponse<{
    getCertificateSVG: [{ id: string }] | null
  }>(await res.json())
  return Boolean(certificate.getCertificateSVG)
}

async function uploadCertificate(token: string, certificate: CertificateInput) {
  if (
    await certificatesAlreadyExist(certificate.status, certificate.event, token)
  ) {
    console.log(
      `Certificate for "${certificate.event}" event already exists. Skipping`
    )
    return
  }
  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: createCertificateQuery,
      variables: {
        certificate
      }
    })
  })
  parseGQLResponse<{
    createOrUpdateCertificateSVG: [{ id: string }]
  }>(await res.json())
}

export async function seedCertificate(token: string) {
  const certificates = await getCertificate()
  await Promise.all(
    certificates.map(async ({ fileName, ...certificate }) => {
      await uploadCertificate(token, {
        ...certificate,
        svgFilename: fileName,
        user: 'o.admin',
        status: 'ACTIVE'
      })
    })
  )
}
