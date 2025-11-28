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

import { SystemVariables } from '@opencrvs/commons/client'
import { useUserDetails } from './useUserDetails'

/**
 * Exposes template variables such as `$user` for components to replace field values or other templates
 */
export function useSystemVariables() {
  const user = useUserDetails()

  const variables = {
    $user: user
  } satisfies SystemVariables

  return variables
}
