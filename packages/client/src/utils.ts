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
import { storage } from '@client/storage'
import { APPLICATION_VERSION } from '@client/utils/constants'
import { IUserData } from '@client/declarations'

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export async function validateApplicationVersion() {
  const appVer = localStorage.getItem('application-version')

  if (
    !appVer ||
    (appVer !== APPLICATION_VERSION &&
      isNewAppVersion(appVer, APPLICATION_VERSION))
  ) {
    localStorage.setItem('application-version', APPLICATION_VERSION)
    const userData = await storage.getItem('USER_DATA')
    const allUserData: IUserData[] = !userData
      ? []
      : (JSON.parse(userData) as IUserData[])

    allUserData.map((userData) => {
      userData['declarations'] = []
      return userData
    })

    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }
}

function isNewAppVersion(oldVer: string, newVer: string) {
  const oldParts = oldVer.split('.')
  const newParts = newVer.split('.')
  for (let i = 0; i < newParts.length; i++) {
    const a = Number(newParts[i])
    const b = Number(oldParts[i])
    if (a > b) return true
    if (a < b) return false
  }
  return false
}
