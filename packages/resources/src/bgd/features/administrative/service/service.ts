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
import { FHIR_URL } from '@resources/constants'
import fetch, { BodyInit, HeadersInit } from 'node-fetch'
import { generateLocationResource } from '@resources/bgd/features/administrative/scripts/service'
import { ILocation } from '@resources/bgd/features/utils'
import { OISF_SECRET, OPENHIM_URL } from '@resources/bgd/constants'
import { logger } from '@resources/logger'
import { createPersonEntry } from '@resources/bgd/features/fhir/service'

export interface ILocationDataResponse {
  data: ILocation[]
}

export async function getLocations(): Promise<ILocationDataResponse> {
  const res = await fetch(`${FHIR_URL}/Location?type=ADMIN_STRUCTURE&_count=0`)
  const locationBundle = await res.json()
  const locations = {
    data: locationBundle.entry.reduce(
      (accumulator: { [key: string]: ILocation }, entry: fhir.BundleEntry) => {
        if (!entry.resource || !entry.resource.id) {
          throw new Error('Resource in entry not valid')
        }

        accumulator[entry.resource.id] = generateLocationResource(
          entry.resource as fhir.Location
        )

        return accumulator
      },
      {}
    )
  }

  return locations
}

export async function verifyAndFetchNidInfo(nid: string, dob: string) {
  const token = await getTokenForNidAccess()
  const res = await fetchFromOpenHim(
    '/nid/information?dob=' + dob + '&nid=' + nid,
    'GET',
    {
      Authorization: `Bearer ${token}`
    }
  )

  return {
    data: createPersonEntry(res.nid, res.name, res.nameEn, res.gender),
    operationResult: res.operationResult
  }
}

async function getTokenForNidAccess() {
  if (!OISF_SECRET) {
    process.exit(1)
  }
  const res = await fetchFromOpenHim('/token/create', 'POST', {
    Authorization: `Secret ${OISF_SECRET}`
  })

  return res.token
}

async function fetchFromOpenHim(
  route: string,
  method: string,
  authHeaders?: HeadersInit,
  body?: BodyInit
) {
  try {
    const res = await fetch(`${OPENHIM_URL}${route}`, {
      method,
      body: JSON.stringify(body),
      headers: authHeaders
    })

    return await res.json()
  } catch (err) {
    logger.error(`Unable to forward to openhim for error : ${err}`)
  }
}
