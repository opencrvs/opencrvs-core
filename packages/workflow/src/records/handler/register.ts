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

import { RegisteredRecord } from '@workflow/../../commons/build/dist/record'
import { createRoute } from '@workflow/states'

export const registerRoute = [
  createRoute({
    method: 'POST',
    path: 'records/{recordId}/register',
    allowedStartStates: ['VALIDATED', 'IN_PROGRESS'],
    action: 'REGISTERED',
    handler: async (request, record) => {
      return record as any as RegisteredRecord
    }
  })
]
