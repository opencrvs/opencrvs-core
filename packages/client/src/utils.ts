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
import { storage } from '@client/storage'
import { APPLICATION_VERSION, LANG_EN } from '@client/utils/constants'

import React from 'react'
import { GetSystemRolesQuery, Role } from '@client/utils/gateway'

interface IUserData {
  userID: string
  userPIN?: string
}

export async function validateApplicationVersion() {
  const runningVer = localStorage.getItem('running-version')

  if (!runningVer || runningVer !== APPLICATION_VERSION) {
    localStorage.setItem('running-version', APPLICATION_VERSION)
    const userData = await storage.getItem('USER_DATA')
    const allUserData: IUserData[] = !userData
      ? []
      : (JSON.parse(userData) as IUserData[])

    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }
}
export function isNavigatorOnline() {
  return navigator.onLine
}

export function useOnlineStatus() {
  const [isOnline, setOnline] = React.useState(isNavigatorOnline())
  const ONLINE_CHECK_INTERVAL = 500
  React.useEffect(() => {
    const intervalID = setInterval(
      () => setOnline(isNavigatorOnline()),
      ONLINE_CHECK_INTERVAL
    )

    return () => clearInterval(intervalID)
  }, [])
  return isOnline
}

export function getUserRole(lang: string, role: Role) {
  const defaultLabel = role?.labels?.find((label) => label.lang === LANG_EN)
  const label = role?.labels?.find((label) => label.lang === lang)
  return label?.label || defaultLabel?.label
}

type RolesInput = (Omit<Role, '_id'> & { _id?: string })[]

type ISystemRole = NonNullable<GetSystemRolesQuery['getSystemRoles']>[number]
