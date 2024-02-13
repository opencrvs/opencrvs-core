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
import { USER_MANAGEMENT_URL } from '@config/config/constants'
import { Integration } from '@config/models/config'
import { getToken } from '@config/utils/auth'
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'

interface AuthHeader {
  Authorization: string
}

export const fetchUserManagement = async <T = any>(
  suffix: string,
  authHeader: AuthHeader,
  method = 'GET'
): Promise<T> => {
  const systemURL = new URL(suffix, USER_MANAGEMENT_URL).toString()
  const response = await fetch(systemURL, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    }
  })
  return response.json()
}

export const fetchSystems = async (request: Hapi.Request) => {
  const authHeader = getToken(request)

  return fetchUserManagement<Integration[]>('/getAllSystems', {
    Authorization: authHeader
  })
}
