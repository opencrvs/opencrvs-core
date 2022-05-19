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
import { FHIR_URL } from '@config/config/constants'
import fetch from 'node-fetch'

export interface IAuthHeader {
  Authorization: string
}

export const fetchFHIR = <T = any>(
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'GET'
): Promise<T> => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    }
  }).then((response) => {
    return response.json()
  })
}

export const deleteFHIR = async (
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'DELETE'
) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    }
  })
}
