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
import { UUID } from '@opencrvs/commons'

import { ServerRoute } from '@hapi/hapi'
import { fetchFromHearth } from '@config/services/hearth'
import { SavedLocation, isOffice } from '@opencrvs/commons/types'
import { resolveLocationChildren } from './locationTreeSolver'

export const resolveChildren: ServerRoute['handler'] = async (req) => {
  const { locationId } = req.params as { locationId: UUID }
  const { type } = req.query || { type: undefined }

  const location = await fetchFromHearth<SavedLocation>(
    `Location/${locationId}`
  )
  if (isOffice(location)) {
    return [location]
  }

  const children = await resolveLocationChildren(locationId, type)

  return [location, ...children]
}
