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
import { FHIR_URL } from '@webhooks/constants'
import fetch from 'node-fetch'
import { logger } from '@webhooks/logger'
import { IAuthHeader } from '@webhooks/features/event/handler'

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
  authHeader: IAuthHeader
) {
  if (!bundle || !bundle.entry || !bundle.entry[0].resource) {
    throw new Error('Invalid FHIR bundle found')
  }
  const task: fhir.Task = bundle.entry[0].resource as fhir.Task
  if (task && task.focus && task.focus.reference) {
    switch (scope) {
      case 'nationalId':
        const composition = await getComposition(
          task.focus.reference as string,
          authHeader
        )
        const child: fhir.Patient = await getResourceBySection(
          composition,
          'child-details',
          authHeader
        )
        const document: any = await getResourceBySection(
          composition,
          'supporting-documents',
          authHeader
        )
        bundle.entry.push({ resource: child } as fhir.BundleEntry)
        bundle.entry.push({ resource: document } as fhir.BundleEntry)
        return bundle
      default:
        return bundle
    }
  } else {
    throw new Error('Task has no composition reference')
  }
}

const getFromFhir = (suffix: string, authHeader: IAuthHeader) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir',
      ...authHeader
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
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
      return section.code.coding.some(coding => coding.code === sectionCode)
    })

  if (!resourceSection || !resourceSection.entry) {
    throw new Error(`No section found for given code: ${sectionCode}`)
  }
  // TODO: For a proper implementation, all the documents should be requested
  // and searched to find which document is the visual identity MOSIP requires.
  const resource = resourceSection.entry[0].reference
  try {
    return await getFromFhir(`/${resource}`, authHeader)
  } catch (error) {
    logger.error(`getting resource by identifer failed with error: ${error}`)
    throw new Error(error)
  }
}
