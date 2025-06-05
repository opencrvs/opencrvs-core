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
import { IUserData } from '@client/declarations'
import { storage } from '@client/storage'
import { APPLICATION_VERSION } from '@client/utils/constants'
import { useEffect, useState } from 'react'

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

    window.addEventListener(ONLINE, handleConnectionChange)
    window.addEventListener(OFFLINE, handleConnectionChange)

    return () => {
      window.removeEventListener(ONLINE, handleConnectionChange)
      window.removeEventListener(OFFLINE, handleConnectionChange)
    }
  }, [])

  return isOnline
}

/** Tell compiler that accessing record with arbitrary key might result to undefined
 * Use when you **cannot guarantee**  that key exists in the record
 */
export interface IndexMap<T> {
  [id: string]: T | undefined
}
