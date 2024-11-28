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
import { IUserData } from '@client/declarations'
import React, { useEffect, useState } from 'react'
import { GetSystemRolesQuery, Role } from '@client/utils/gateway'

export async function validateApplicationVersion() {
  const runningVer = localStorage.getItem('running-version')

  if (!runningVer || runningVer !== APPLICATION_VERSION) {
    localStorage.setItem('running-version', APPLICATION_VERSION)
    const userData = await storage.getItem('USER_DATA')
    const allUserData: IUserData[] = !userData
      ? []
      : (JSON.parse(userData) as IUserData[])

    allUserData.forEach((userData) => {
      userData['declarations'] = []
    })

    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }
}
export function isNavigatorOnline() {
  return navigator.onLine
}

const ONLINE = 'online'
const OFFLINE = 'offline'

export function useOnlineStatus() {
  const [isOnline, setOnline] = useState(isNavigatorOnline())

  useEffect(() => {
    const handleConnectionChange = () => {
      setOnline(isNavigatorOnline())
    }

    handleConnectionChange()
    window.addEventListener(ONLINE, handleConnectionChange)
    window.addEventListener(OFFLINE, handleConnectionChange)

    return () => {
      window.removeEventListener(ONLINE, handleConnectionChange)
      window.removeEventListener(OFFLINE, handleConnectionChange)
    }
  }, [])

  return isOnline
}

export function getUserRole(lang: string, role: Role) {
  const defaultLabel = role?.labels?.find((label) => label.lang === LANG_EN)
  const label = role?.labels?.find((label) => label.lang === lang)
  return label?.label || defaultLabel?.label
}

export type RolesInput = (Omit<Role, '_id'> & { _id?: string })[]

export type ISystemRole = NonNullable<
  GetSystemRolesQuery['getSystemRoles']
>[number]
