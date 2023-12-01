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
import * as Hapi from '@hapi/hapi'
import User, { IUserModel } from '@user-mgnt/model/user'

export default async function getUserAvatar(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = request.params.userId
  const user: IUserModel | null = await User.findById(userId)

  if (!user) {
    return h.response().code(400)
  }

  const avatarURI = user.avatar?.data
  const name = user.name[0]
  const userName = `${String(name.given[0])} ${String(name.family)}`

  return h.response({ userName, avatarURI }).code(200)
}
