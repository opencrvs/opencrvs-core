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

import { getOrThrow, ValidatorContext } from '@opencrvs/commons/client'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import { useSuspenseAdminLeafLevelLocations } from './useLocations'

export function useValidatorContext(): ValidatorContext {
  const leafAdminStructureLocationIds = useSuspenseAdminLeafLevelLocations()
  const token = getToken()
  const tokenPayload = getOrThrow(
    getTokenPayload(token),
    'Token payload missing. User is not logged in'
  )

  return {
    user: tokenPayload,
    leafAdminStructureLocationIds
  }
}
