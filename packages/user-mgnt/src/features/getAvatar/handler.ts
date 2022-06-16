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
import * as Hapi from '@hapi/hapi'
import User, { IUserModel } from '@user-mgnt/model/user'
import { AVATAR_API } from '@user-mgnt/constants'
import fetch from 'node-fetch'

export default async function getUserAvatar(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = request.params.userId
  const user: IUserModel | null = await User.findById(userId)

  if (!user) {
    return h.response().code(400)
  }
  if (!user.avatar) {
    const name = user.name[0]
    const userName = `${String(name.given[0])} ${String(name.family)}`

    const avatarBuffer = await fetch(`${AVATAR_API}${userName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return avatarBuffer.buffer()
  }
  const avatarDataURL = user.avatar.data
  const base64String = avatarDataURL.split(',')[1]
  const base64Decode = Buffer.from(base64String, 'base64')
  return base64Decode
}
