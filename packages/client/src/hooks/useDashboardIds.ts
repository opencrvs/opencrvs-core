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
import { getScope } from '@client/profile/profileSelectors'
import {
  DashboardScope,
  parseConfigurableScope
} from '@opencrvs/commons/client'
import { useSelector } from 'react-redux'

export function useDashboardIds() {
  const userScopes = useSelector(getScope)
  if (!userScopes) return []

  return userScopes?.reduce((acc, scope) => {
    const parsed = parseConfigurableScope(scope)
    const configurableScopes = DashboardScope.safeParse(parsed)
    if (configurableScopes.success) {
      const data = configurableScopes.data

      acc.push(...data.options.id)
    }
    return acc
  }, [] as string[])
}
