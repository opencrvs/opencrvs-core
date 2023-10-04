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
import { APPLICATION_VERSION } from '@client/utils/constants'
import { IUserData } from '@client/declarations'
import React from 'react'

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
