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

import { getUserDetails } from '@client/profile/profileSelectors'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { getLanguage } from '@client/i18n/selectors'
import { getUserRole } from '@client/views/SysAdmin/Config/UserRoles/utils'
import { Role } from '@client/utils/gateway'
import {
  PERFORMANCE_DASHBOARD,
  PERFORMANCE_HOME,
  REGISTRAR_HOME
} from '@client/navigation/routes'
import { Redirect } from 'react-router'
import { getDefaultPerformanceLocationId } from '@client/navigation'
import { UserDetails } from '@client/utils/userUtils'

export function Home() {
  const PERFORMANCE_MANAGEMENT_ROLES = ['PERFORMANCE MANAGER']
  const NATL_ADMIN_ROLES = ['NATIONAL SYSTEM ADMIN']
  const NATIONAL_REGISTRAR_ROLES = ['NATIONAL REGISTRAR']
  const SYS_ADMIN_ROLES = ['LOCAL SYSTEM ADMIN']

  const userDetails = useSelector(getUserDetails)
  const language = useSelector(getLanguage)

  const role =
    (userDetails?.role && getUserRole(language, userDetails.role as Role)) ?? ''
  const roleIsValidForDashboard =
    role.toUpperCase() &&
    [
      ...NATL_ADMIN_ROLES,
      ...PERFORMANCE_MANAGEMENT_ROLES,
      ...NATIONAL_REGISTRAR_ROLES
    ].includes(role.toUpperCase())

  const roleIsLocalSysAdmin =
    role && SYS_ADMIN_ROLES.includes(role.toUpperCase())

  if (roleIsValidForDashboard) return <Redirect to={PERFORMANCE_DASHBOARD} />
  if (roleIsLocalSysAdmin)
    return (
      <Redirect
        to={{
          pathname: PERFORMANCE_HOME,
          search: `?locationId=${getDefaultPerformanceLocationId(
            userDetails as UserDetails
          )}`
        }}
      />
    )

  return <Redirect to={REGISTRAR_HOME} />
}
