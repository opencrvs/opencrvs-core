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

import * as Hapi from '@hapi/hapi'
import { getToken } from '@workflow/utils/auth-utils'
import { getRecordById } from '@workflow/records/index'
import { indexBundleToRoute } from '@workflow/records/search'
import { auditEvent } from '@workflow/records/audit'
import { toNotDuplicated } from '@workflow/records/state-transitions'

export async function markAsNotDuplicateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const recordId = request.params.id
  const token = getToken(request)
  const record = await getRecordById(recordId, token, ['READY_FOR_REVIEW'])

  const notDuplicateBundle = await toNotDuplicated(record, token)

  await indexBundleToRoute(notDuplicateBundle, token, '/events/not-duplicate')
  await auditEvent('not-duplicate', notDuplicateBundle, token)

  return notDuplicateBundle
}
