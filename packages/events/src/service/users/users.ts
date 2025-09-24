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

import { getUser, User, UserNotFoundError } from '@opencrvs/commons'
import { env } from '@events/environment'

type DatabaseUser = Awaited<ReturnType<typeof getUser>>
export const getUsersById = async (
  ids: string[],
  token: string
): Promise<User[]> => {
  const users = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getUser(env.USER_MANAGEMENT_URL, id, token)
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return undefined
        }
        throw error
      }
    })
  )

  return users
    .filter((user): user is DatabaseUser => user !== undefined)
    .map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      signature: user.signature ? user.signature : undefined,
      avatar: user.avatar?.data ? user.avatar.data : undefined,
      primaryOfficeId: user.primaryOfficeId,
      fullHonorificName: user.fullHonorificName
        ? user.fullHonorificName
        : undefined
    }))
}
