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

import * as crypto from 'crypto'
import { FHIR_URL, MINIO_URL } from '@webhooks/constants'
import fetch from 'node-fetch'
import { logger } from '@webhooks/logger'
import { IAuthHeader } from '@webhooks/features/event/handler'
import { fromBuffer } from 'file-type'

export function createRequestSignature(
  requestSigningVersion: string,
  signingSecret: string,
  rawBody: string
) {
  const hmac = crypto.createHmac(requestSigningVersion, signingSecret)
  hmac.update(`${requestSigningVersion}:${encodeURIComponent(rawBody)}`)
  return `${requestSigningVersion}=${hmac.digest('hex')}`
}

export async function transformBirthBundle(
  bundle: fhir.Bundle,
  scope: string,
  authHeader: IAuthHeader,
  permissions: string[] = []
) {
  if (!bundle || !bundle.entry || !bundle.entry[0].resource) {
    throw new Error('Invalid FHIR bundle found')
  }
  const task: fhir.Task = bundle.entry.find(
    (entry) => entry.resource?.resourceType === 'Task'
  )?.resource as fhir.Task

  if (task && task.focus && task.focus.reference) {
    const composition = await getComposition(
      task.focus.reference as string,
      authHeader
    )
    switch (scope) {
      case 'nationalId':
        return getPermissionsBundle(
          bundle,
          [
            'child-details',
            'mother-details',
            'father-details',
            'supporting-documents',
            'informant-details'
          ],
          composition,
          authHeader
        )
      case 'webhook':
        return getPermissionsBundle(
          bundle,
          permissions,
          composition,
          authHeader
        )
      default:
        return bundle
    }
  } else {
    throw new Error('Task has no composition reference')
  }
}

export async function transformDeathBundle(
  bundle: fhir.Bundle,
  scope: string,
  authHeader: IAuthHeader,
  permissions: string[] = []
) {
  if (!bundle || !bundle.entry || !bundle.entry[0].resource) {
    throw new Error('Invalid FHIR bundle found')
  }

  const task: fhir.Task = bundle.entry.find(
    (entry) => entry.resource?.resourceType === 'Task'
  )?.resource as fhir.Task

  if (task && task.focus && task.focus.reference) {
    const composition = await getComposition(
      task.focus.reference as string,
      authHeader
    )
    switch (scope) {
      case 'nationalId':
        return getPermissionsBundle(
          bundle,
          [
            'deceased-details',
            'supporting-documents',
            'informant-details',
            'death-encounter'
          ],
          composition,
          authHeader
        )
      case 'webhook':
        return getPermissionsBundle(
          bundle,
          permissions,
          composition,
          authHeader
        )
      default:
        return bundle
    }
  } else {
    throw new Error('Task has no composition reference')
  }
}

export const getPermissionsBundle = async (
  bundle: fhir.Bundle,
  permissions: string[] = [],
  composition: fhir.Composition,
  authHeader: IAuthHeader
) => {
  const resources = await Promise.all(
    permissions.map((sectionCode) =>
      getResourceBySection(composition, sectionCode, authHeader)
    )
  )
  resources.forEach((resource: fhir.BundleEntry) => {
    if (resource) {
      bundle.entry!.push({ resource })
    }
  })

  return bundle
}

const getFromFhir = (suffix: string, authHeader: IAuthHeader) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir',
      ...authHeader
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

async function getComposition(resource: string, authHeader: IAuthHeader) {
  try {
    return await getFromFhir(`/${resource}`, authHeader)
  } catch (error) {
    logger.error(`getting composition by identifer failed with error: ${error}`)
    throw new Error(error)
  }
}

async function getResourceBySection(
  composition: any,
  sectionCode: string,
  authHeader: IAuthHeader
) {
  const resourceSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding || !section.code.coding.some) {
        return false
      }
      return section.code.coding.some((coding) => coding.code === sectionCode)
    })

  if (!resourceSection || !resourceSection.entry) {
    return null
  }
  // TODO: For a proper implementation, all the documents should be requested
  // and searched to find which document is the visual identity MOSIP requires.
  const resource = resourceSection.entry[0].reference
  try {
    if (sectionCode === 'certificates') {
      const fhirResponse = (await getFromFhir(
        `/${resource}`,
        authHeader
      )) as fhir.DocumentReference
      const minioObjectName = fhirResponse.content[0].attachment.data || ''
      const base64Certificate = await getBase64DocumentFromMinio(
        minioObjectName
      )
      fhirResponse.content[0].attachment.data = base64Certificate
      return fhirResponse
    } else {
      return await getFromFhir(`/${resource}`, authHeader)
    }
  } catch (error) {
    logger.error(`getting resource by identifer failed with error: ${error}`)
    throw new Error(error)
  }
}

async function getBase64DocumentFromMinio(minioDocumentName: string) {
  const minioDocumentURL = new URL(`${minioDocumentName}`, MINIO_URL).toString()
  const response = await fetch(minioDocumentURL)
  const fileBuffer = await response.buffer()

  // convert buffer to base64 string
  const base64String = fileBuffer.toString('base64')

  // get file type from buffer
  const fileType = await fromBuffer(fileBuffer)
  if (fileType) {
    return `data:${fileType.mime};base64,${base64String}`
  }
  return `data:application/pdf;base64,${base64String}`
}
