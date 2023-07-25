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

import {
  COUNTRY_CONFIG_URL,
  APPLICATION_CONFIG_URL,
  DOCUMENTS_URL
} from './constants'
import fetch from 'node-fetch'
import { raise } from './utils'
import { TypeOf, z } from 'zod'

async function uploadSvg(
  fileData: string,
  authHeader: { Authorization: string }
) {
  const url = new URL('upload-svg', DOCUMENTS_URL).toString()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'image/svg+xml'
    },
    body: Buffer.from(fileData)
  })
  if (!res.ok) {
    raise(await res.json())
  }
  return (await res.json()).refUrl
}

type CertificateMeta = TypeOf<typeof CertificateSchema>[number]

const CertificateSchema = z.array(
  z.object({
    event: z.enum(['birth', 'death', 'marriage']),
    fileName: z.string(),
    svgCode: z.string()
  })
)

async function getCertificate() {
  const url = new URL('certificates', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the certificates from ${url}`)
  }
  const parsedCertificates = CertificateSchema.safeParse(await res.json())
  if (!parsedCertificates.success) {
    raise(
      `Getting certificates from country-config errored with: ${JSON.stringify(
        parsedCertificates.error.issues
      )}`
    )
  }
  return parsedCertificates.data
}

async function uploadCertificate(token: string, certificate: CertificateMeta) {
  const authHeader = {
    Authorization: `Bearer ${token}`
  }
  const certificateSVG = {
    svgCode: certificate.svgCode as string,
    svgFilename: certificate.fileName,
    user: 'jonathan.campbell',
    event: certificate.event,
    status: 'ACTIVE'
  }

  certificateSVG.svgCode = await uploadSvg(certificateSVG.svgCode, authHeader)

  const res = await fetch(`${APPLICATION_CONFIG_URL}createCertificate`, {
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

const activeCertificates = async (token: string) => {
  const res = await fetch(`${APPLICATION_CONFIG_URL}getActiveCertificates`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function seedCertificate(token: string) {
  if ((await activeCertificates(token)).length === 0) {
    const certificates = await getCertificate()
    await Promise.all(
      certificates.map(async (certificate) => {
        await uploadCertificate(token, certificate)
      })
    )
  }
}
