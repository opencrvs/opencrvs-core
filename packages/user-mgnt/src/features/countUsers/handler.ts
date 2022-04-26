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
import * as Hapi from '@hapi/hapi'
import { countUsers } from '@user-mgnt/features/countUsers/service'

const OFFICE_ID = 'primaryOfficeId'
const ROLE = 'role'

export async function countUsersHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const primaryOfficeId = request.query[OFFICE_ID]
  const role = request.query[ROLE]

  return countUsers({ primaryOfficeId, role })
}
