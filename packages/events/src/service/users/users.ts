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

import { toDocumentPath, getUser } from '@opencrvs/commons'
import { env } from '@events/environment'

export const getUsersById = async (ids: string[], token: string) => {
  const users = await Promise.all(
    ids.map(async (id) => getUser(env.USER_MANAGEMENT_URL, id, token))
  )

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    signature: user.signature ? toDocumentPath(user.signature) : undefined,
    avatar: user.avatar?.data ? toDocumentPath(user.avatar.data) : undefined
  }))
}
