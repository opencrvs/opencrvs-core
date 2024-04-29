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
import { Integration } from '@config/models/config'
import { fetchUserManagement } from '@config/services/userManagement'
import { getToken } from '@config/utils/auth'
import * as Hapi from '@hapi/hapi'

export default async function getSystems(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const authHeader = getToken(request)

  return fetchUserManagement<Integration[]>('/getAllSystems', {
    Authorization: authHeader
  })
}
